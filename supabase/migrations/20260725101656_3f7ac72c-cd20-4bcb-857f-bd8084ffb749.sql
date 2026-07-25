
DO $$ BEGIN
  CREATE TYPE public.stack_kind AS ENUM ('investor', 'agent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.stacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.stack_kind NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  intro_md text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.stacks TO anon, authenticated;
GRANT ALL ON public.stacks TO service_role;

ALTER TABLE public.stacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stacks_public_read" ON public.stacks FOR SELECT USING (true);
CREATE POLICY "stacks_admin_insert" ON public.stacks FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "stacks_admin_update" ON public.stacks FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "stacks_admin_delete" ON public.stacks FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER stacks_updated_at BEFORE UPDATE ON public.stacks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.stack_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.stack_kind NOT NULL,
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  group_name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  why_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, tool_id)
);

CREATE INDEX stack_entries_kind_group_order_idx ON public.stack_entries (kind, group_name, sort_order);

GRANT SELECT ON public.stack_entries TO anon, authenticated;
GRANT ALL ON public.stack_entries TO service_role;

ALTER TABLE public.stack_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stack_entries_public_read" ON public.stack_entries FOR SELECT USING (true);
CREATE POLICY "stack_entries_admin_insert" ON public.stack_entries FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "stack_entries_admin_update" ON public.stack_entries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "stack_entries_admin_delete" ON public.stack_entries FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER stack_entries_updated_at BEFORE UPDATE ON public.stack_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.stacks (kind, title, subtitle, intro_md) VALUES
  ('investor', 'The Investor Stack', 'If I were starting today, this is the exact toolset I''d run.', ''),
  ('agent', 'The Agent Stack', 'The tools I''d hand a new agent on day one.', '')
ON CONFLICT (kind) DO NOTHING;
