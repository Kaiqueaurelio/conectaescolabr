CREATE TABLE public.benefit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit text NOT NULL DEFAULT 'un',
  quantity_enc text,
  min_enc text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.benefit_items TO service_role;
ALTER TABLE public.benefit_items ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_benefit_items_updated_at BEFORE UPDATE ON public.benefit_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();