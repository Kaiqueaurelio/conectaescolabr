CREATE TABLE public.participant_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text NOT NULL DEFAULT '',
  phone text,
  is_emergency boolean NOT NULL DEFAULT false,
  can_pick_up boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.program_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  program text NOT NULL,
  class_group text,
  started_on date NOT NULL DEFAULT current_date,
  status text NOT NULL DEFAULT 'ATIVO',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.benefit_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  benefit text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'un',
  granted_on date NOT NULL DEFAULT current_date,
  delivered_by text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  program text,
  attended_on date NOT NULL DEFAULT current_date,
  present boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.participant_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  note text NOT NULL,
  author text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_date date;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS school text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS nis text;

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['participant_guardians','program_enrollments','benefit_grants','attendance_records','participant_notes'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))', t || '_admin_all', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = participant_id AND u.auth_id = auth.uid()))', t || '_own_select', t);
  END LOOP;
END $$;