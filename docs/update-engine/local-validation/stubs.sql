-- Local stand-ins for Supabase objects the proposal depends on. NOT Supabase.
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF; END $$;
CREATE ROLE sandbox_exec NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role, sandbox_exec;
-- Synthetic auth.uid(): reads a session GUC instead of a JWT.
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
  $$ SELECT nullif(current_setting('test.uid', true), '')::uuid $$;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
-- Mimic Supabase's broad default privileges so REVOKE-before-GRANT is actually exercised.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
-- Actual postgres/public live defaults relevant to the new proposal objects.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT ON TABLES TO sandbox_exec;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO sandbox_exec;
CREATE TYPE public.app_role AS ENUM ('admin','member');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, role public.app_role NOT NULL, UNIQUE(user_id, role));
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
  $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
CREATE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS
  $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TABLE public.tools (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text);
INSERT INTO public.user_roles (user_id, role) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001','admin'),
  ('bbbbbbbb-0000-0000-0000-000000000002','member');
