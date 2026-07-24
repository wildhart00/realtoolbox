
-- 1. purchases table
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  toolbox_slug text NOT NULL CHECK (toolbox_slug IN ('investor_toolbox','agent_toolbox','complete_toolbox')),
  stripe_customer_id text,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  amount_cents integer,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','refunded')),
  purchased_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, toolbox_slug)
);

GRANT SELECT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases"
  ON public.purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);

-- 2. skills.toolbox
ALTER TABLE public.skills ADD COLUMN toolbox text CHECK (toolbox IN ('investor','agent'));
UPDATE public.skills SET toolbox = 'investor' WHERE is_published = true;

-- 3. deprecate subscriptions
COMMENT ON TABLE public.subscriptions IS 'Deprecated 2026-07 - historical only. Entitlements now live in public.purchases.';
