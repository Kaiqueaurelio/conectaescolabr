ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS cpf_enc text,
  ADD COLUMN IF NOT EXISTS rg_enc text,
  ADD COLUMN IF NOT EXISTS address_enc text,
  ADD COLUMN IF NOT EXISTS phone_enc text,
  ADD COLUMN IF NOT EXISTS mother_name_enc text,
  ADD COLUMN IF NOT EXISTS father_name_enc text,
  ADD COLUMN IF NOT EXISTS vulnerability_enc text,
  ADD COLUMN IF NOT EXISTS encrypted_at timestamptz;