-- Affiliate programs and earnings
CREATE TYPE public.affiliate_status AS ENUM ('applied', 'pending', 'approved', 'declined', 'paused');

CREATE TABLE public.affiliate_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id UUID NULL REFERENCES public.tools(id) ON DELETE SET NULL,
  program_name TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT '',
  affiliate_url TEXT NOT NULL DEFAULT '',
  status public.affiliate_status NOT NULL DEFAULT 'applied',
  commission_rate TEXT NOT NULL DEFAULT '',
  signup_date DATE NULL,
  approval_date DATE NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.affiliate_programs TO authenticated;
GRANT ALL ON public.affiliate_programs TO service_role;

ALTER TABLE public.affiliate_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage affiliate programs"
  ON public.affiliate_programs FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_affiliate_programs_updated_at
  BEFORE UPDATE ON public.affiliate_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.affiliate_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.affiliate_programs(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  reported_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_received NUMERIC(12,2) NULL,
  payment_date DATE NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (program_id, month)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.affiliate_earnings TO authenticated;
GRANT ALL ON public.affiliate_earnings TO service_role;

ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage affiliate earnings"
  ON public.affiliate_earnings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_affiliate_earnings_updated_at
  BEFORE UPDATE ON public.affiliate_earnings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_affiliate_earnings_program_month ON public.affiliate_earnings(program_id, month DESC);