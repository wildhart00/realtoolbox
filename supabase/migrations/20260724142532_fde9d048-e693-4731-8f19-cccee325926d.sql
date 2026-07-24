INSERT INTO public.skills (name, slug, tagline, description, audience, tier, access_level, price, is_published, sort_order, toolbox)
VALUES (
  'How to load a skill into any AI',
  'setup-guide',
  'Setup guide',
  'Step-by-step: load any RealToolbox skill into ChatGPT, Claude, or Gemini — and connect your toolbox directly via MCP so skills load themselves.',
  'investor',
  'quick_tool',
  'free',
  0,
  false,
  -1,
  NULL
)
ON CONFLICT (slug) DO NOTHING;