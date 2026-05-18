
-- Profiles table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  address TEXT,
  phone TEXT,
  mother_name TEXT,
  father_name TEXT,
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('ADMIN','TEACHER','STUDENT','PARENT','VOLUNTEER')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  avatar_url TEXT,
  vulnerability_situation TEXT,
  priority_public TEXT,
  benefits_received JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin (security definer to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_auth_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE auth_id = _auth_id AND role = 'ADMIN' AND status = 'APPROVED');
$$;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated
  USING (auth_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING (auth_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "users_insert_self" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "users_admin_delete" ON public.users
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT'),
    'PENDING'
  )
  ON CONFLICT (auth_id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed admin user
DO $$
DECLARE
  admin_id UUID;
  existing_id UUID;
BEGIN
  SELECT id INTO existing_id FROM auth.users WHERE email = 'admin@associacaocamila.br';
  IF existing_id IS NULL THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_id,
      'authenticated',
      'authenticated',
      'admin@associacaocamila.br',
      crypt('Admin@2026', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Administrador","role":"ADMIN"}'::jsonb,
      FALSE, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_id, jsonb_build_object('sub', admin_id::text, 'email', 'admin@associacaocamila.br'), 'email', admin_id::text, now(), now(), now());
  ELSE
    admin_id := existing_id;
    UPDATE auth.users SET encrypted_password = crypt('Admin@2026', gen_salt('bf')), email_confirmed_at = now() WHERE id = admin_id;
  END IF;

  INSERT INTO public.users (auth_id, email, full_name, role, status)
  VALUES (admin_id, 'admin@associacaocamila.br', 'Administrador', 'ADMIN', 'APPROVED')
  ON CONFLICT (auth_id) DO UPDATE SET role = 'ADMIN', status = 'APPROVED';
END $$;
