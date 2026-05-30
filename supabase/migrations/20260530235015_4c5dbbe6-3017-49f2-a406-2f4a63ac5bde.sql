
-- Create integrations table
CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tagline text NOT NULL,
  category text NOT NULL,
  logo_url text,
  setup_url text NOT NULL,
  difficulty text NOT NULL DEFAULT 'easy',
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.integrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integrations TO authenticated;
GRANT ALL ON public.integrations TO service_role;

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published integrations viewable by everyone"
ON public.integrations FOR SELECT
USING ((is_published = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage integrations"
ON public.integrations FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_integrations_updated_at
BEFORE UPDATE ON public.integrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('integration-logos', 'integration-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Integration logos publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'integration-logos');

CREATE POLICY "Admins upload integration logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'integration-logos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update integration logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'integration-logos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete integration logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'integration-logos' AND has_role(auth.uid(), 'admin'::app_role));

-- Seed data
INSERT INTO public.integrations (name, slug, tagline, category, setup_url, difficulty, sort_order, is_published) VALUES
('Gmail', 'gmail', 'Read, draft, and send emails without leaving your AI assistant.', 'communication', 'https://claude.com/blog/connectors', 'easy', 10, true),
('Google Calendar', 'google-calendar', 'Schedule showings, set reminders, and manage your day.', 'productivity', 'https://claude.com/blog/connectors', 'easy', 20, true),
('Notion', 'notion', 'Manage deal pipelines, client notes, and property databases.', 'productivity', 'https://www.notion.so/help/notion-mcp', 'easy', 30, true),
('Zapier', 'zapier', 'Connect your AI to 8,000+ apps without writing code.', 'automation', 'https://zapier.com/mcp', 'easy', 40, true),
('Higgsfield', 'higgsfield', 'Generate AI video and visual content for listings and marketing.', 'content-creation', 'https://higgsfield.ai', 'medium', 50, true),
('BatchData', 'batchdata', 'Property data, skip tracing, and address verification for prospecting.', 'property-data', 'https://batchdata.io', 'medium', 60, true);
