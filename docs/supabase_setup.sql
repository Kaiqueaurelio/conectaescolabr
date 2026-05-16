-- Supabase Database Setup Script for ONG Camila
-- This script creates all necessary tables and sets up Row Level Security (RLS)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS TABLE (Cadastro Institucional Unificado)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  rg TEXT,
  address TEXT,
  phone TEXT,
  email TEXT NOT NULL UNIQUE,
  mother_name TEXT,
  father_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'VOLUNTEER')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  avatar_url TEXT,
  vulnerability_situation TEXT,
  priority_public TEXT,
  benefits_received JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on auth_id for faster lookups
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ============================================================================
-- 2. CHILDREN_PARENTS TABLE (Relacionamento entre Alunos e Responsáveis)
-- ============================================================================
CREATE TABLE IF NOT EXISTS children_parents (
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (child_id, parent_id)
);

CREATE INDEX idx_children_parents_child ON children_parents(child_id);
CREATE INDEX idx_children_parents_parent ON children_parents(parent_id);

-- ============================================================================
-- 3. ACTIVITIES TABLE (Atividades/Projetos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. ATTENDANCE TABLE (Presença)
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'EXCUSED')),
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_activity ON attendance(activity_id);
CREATE INDEX idx_attendance_date ON attendance(date);

-- ============================================================================
-- 5. SOCIAL_RECORDS TABLE (Prontuário Digital)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('PARTICIPATION', 'BENEFIT', 'EVENT', 'OBSERVATION', 'DOCUMENT')),
  title TEXT NOT NULL,
  description TEXT,
  record_date DATE NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_social_records_user ON social_records(user_id);
CREATE INDEX idx_social_records_type ON social_records(record_type);
CREATE INDEX idx_social_records_date ON social_records(record_date);

-- ============================================================================
-- 6. INVENTORY TABLE (Estoque de Benefícios)
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  unit TEXT,
  last_restock TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inventory_item_name ON inventory(item_name);

-- ============================================================================
-- 7. BENEFIT_DISTRIBUTION TABLE (Distribuição de Benefícios)
-- ============================================================================
CREATE TABLE IF NOT EXISTS benefit_distribution (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_item_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  distribution_date TIMESTAMPTZ DEFAULT now(),
  distributed_by UUID NOT NULL REFERENCES users(id),
  notes TEXT
);

CREATE INDEX idx_benefit_distribution_user ON benefit_distribution(user_id);
CREATE INDEX idx_benefit_distribution_item ON benefit_distribution(inventory_item_id);
CREATE INDEX idx_benefit_distribution_date ON benefit_distribution(distribution_date);

-- ============================================================================
-- 8. ANNOUNCEMENTS TABLE (Comunicados)
-- ============================================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  target_roles TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_announcements_author ON announcements(author_id);
CREATE INDEX idx_announcements_created ON announcements(created_at);

-- ============================================================================
-- 9. EVENTS TABLE (Eventos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  location TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_start_datetime ON events(start_datetime);

-- ============================================================================
-- 10. BLOG_POSTS TABLE (Posts do Blog)
-- ============================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  cover_image_url TEXT,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  published_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at);

-- ============================================================================
-- 11. USER_ACTIVITY_LOG TABLE (Logs de Atividade)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_activity_log_user ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_action ON user_activity_log(action);
CREATE INDEX idx_user_activity_log_created ON user_activity_log(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = auth_id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    (SELECT role FROM users WHERE auth_id = auth.uid()) = 'ADMIN'
  );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Admins can update any user
CREATE POLICY "Admins can update any user" ON users
  FOR UPDATE USING (
    (SELECT role FROM users WHERE auth_id = auth.uid()) = 'ADMIN'
  );

-- Admins can insert users
CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE auth_id = auth.uid()) = 'ADMIN'
  );

-- Teachers and admins can view attendance
CREATE POLICY "Teachers and admins can view attendance" ON attendance
  FOR SELECT USING (
    (SELECT role FROM users WHERE auth_id = auth.uid()) IN ('ADMIN', 'TEACHER')
  );

-- Teachers and admins can insert attendance
CREATE POLICY "Teachers and admins can insert attendance" ON attendance
  FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE auth_id = auth.uid()) IN ('ADMIN', 'TEACHER')
  );

-- Admins can view all social records
CREATE POLICY "Admins can view all social records" ON social_records
  FOR SELECT USING (
    (SELECT role FROM users WHERE auth_id = auth.uid()) = 'ADMIN'
  );

-- Teachers can view social records for their students
CREATE POLICY "Teachers can view social records" ON social_records
  FOR SELECT USING (
    (SELECT role FROM users WHERE auth_id = auth.uid()) IN ('ADMIN', 'TEACHER')
  );

-- Admins can manage inventory
CREATE POLICY "Admins can manage inventory" ON inventory
  FOR ALL USING (
    (SELECT role FROM users WHERE auth_id = auth.uid()) = 'ADMIN'
  );

-- Admins can manage benefit distribution
CREATE POLICY "Admins can manage benefit distribution" ON benefit_distribution
  FOR ALL USING (
    (SELECT role FROM users WHERE auth_id = auth.uid()) = 'ADMIN'
  );

-- Anyone can view announcements
CREATE POLICY "Anyone can view announcements" ON announcements
  FOR SELECT USING (true);

-- Admins can manage announcements
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    (SELECT role FROM users WHERE auth_id = auth.uid()) = 'ADMIN'
  );

-- Anyone can view events
CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (true);

-- Admins can manage events
CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (
    (SELECT role FROM users WHERE auth_id = auth.uid()) = 'ADMIN'
  );

-- Anyone can view blog posts
CREATE POLICY "Anyone can view blog posts" ON blog_posts
  FOR SELECT USING (true);

-- Admins can manage blog posts
CREATE POLICY "Admins can manage blog posts" ON blog_posts
  FOR ALL USING (
    (SELECT role FROM users WHERE auth_id = auth.uid()) = 'ADMIN'
  );

-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs" ON user_activity_log
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs" ON user_activity_log
  FOR SELECT USING (
    (SELECT role FROM users WHERE auth_id = auth.uid()) = 'ADMIN'
  );

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
