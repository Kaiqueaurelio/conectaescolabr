import { createClient } from "@supabase/supabase-js";

// Untyped client for legacy code that references tables not yet in the typed schema.
const url =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://placeholder.supabase.co";
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.placeholder";

export const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL);
export const supabase = createClient(url, key);

// Type definitions for database schema
export interface UserProfile {
  id: string;
  auth_id: string;
  full_name: string;
  cpf?: string;
  rg?: string;
  address?: string;
  phone?: string;
  email: string;
  mother_name?: string;
  father_name?: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "VOLUNTEER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  avatar_url?: string;
  vulnerability_situation?: string;
  priority_public?: string;
  benefits_received?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SocialRecord {
  id: string;
  user_id: string;
  record_type: "PARTICIPATION" | "BENEFIT" | "EVENT" | "OBSERVATION" | "DOCUMENT";
  title: string;
  description?: string;
  record_date: string;
  attachments?: Array<{ name: string; url: string }>;
  created_by: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  activity_id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED";
  recorded_by: string;
  created_at: string;
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  quantity: number;
  unit?: string;
  last_restock?: string;
  created_at: string;
  updated_at: string;
}

export interface BenefitDistribution {
  id: string;
  inventory_item_id: string;
  user_id: string;
  quantity: number;
  distribution_date: string;
  distributed_by: string;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  target_roles: ("ALL" | "TEACHERS" | "PARENTS" | "STUDENTS" | "VOLUNTEERS")[];
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  created_by: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  cover_image_url?: string;
  excerpt?: string;
  content: string;
  author_id: string;
  published_at: string;
  updated_at: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  action: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}
