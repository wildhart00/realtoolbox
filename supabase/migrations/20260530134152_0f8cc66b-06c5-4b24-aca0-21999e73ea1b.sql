ALTER TABLE public.tools
  ADD COLUMN screenshot_url text,
  ADD COLUMN is_just_launched boolean NOT NULL DEFAULT false,
  ADD COLUMN just_launched_date timestamptz;

CREATE INDEX idx_tools_just_launched
  ON public.tools (just_launched_date DESC)
  WHERE is_just_launched = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('tool-screenshots', 'tool-screenshots', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Tool screenshots publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tool-screenshots');

CREATE POLICY "Admins upload tool screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tool-screenshots' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update tool screenshots"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tool-screenshots' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete tool screenshots"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tool-screenshots' AND has_role(auth.uid(), 'admin'));