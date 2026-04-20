
ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS full_description text;

UPDATE public.tools SET
  hero_image_url = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
  full_description = 'Akkio is a user-friendly platform that empowers real estate businesses to transform raw data into clear, actionable insights in minutes. By combining natural language interfaces with advanced analytics and machine learning, Akkio enables professionals to analyse, visualise, and predict outcomes without the need for coding or technical expertise.',
  key_features = ARRAY[
    'Natural Language Queries: Ask questions in plain English',
    'Generative Reports: Auto-generate comprehensive reports',
    'Conversational Data Exploration',
    'Machine Learning Models for sales forecasting'
  ],
  use_cases = ARRAY[
    'Predicting tenant churn',
    'Optimizing marketing spend across channels',
    'Forecasting neighborhood property values'
  ]
WHERE slug = 'akkio';

UPDATE public.tools SET
  hero_image_url = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop',
  full_description = 'ListedKit centralises every real-estate transaction into one intelligent workspace. From listing intake to closing, its AI assistant drafts emails, summarises contracts, tracks compliance deadlines, and keeps every party — agent, client, attorney, and lender — in sync. Built specifically for transaction coordinators and brokerages, it removes hours of manual chasing each week.',
  key_features = ARRAY[
    'AI-drafted client communications',
    'Automated transaction timelines',
    'Document summarisation & compliance checks',
    'Multi-party collaboration workspace'
  ],
  use_cases = ARRAY[
    'Listing-to-close transaction management',
    'Reducing TC workload by 30%+',
    'Auditable compliance trail'
  ]
WHERE slug = 'listedkit';

UPDATE public.tools SET
  hero_image_url = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop',
  full_description = 'Transform empty rooms into stunning, fully-furnished homes in seconds. AiCasaDesign uses advanced generative AI to virtually stage properties, allowing potential buyers to visualize the space''s true potential. Upload a photo of an empty room, select a design style (Modern, Farmhouse, Minimalist), and get photorealistic staged images instantly.',
  key_features = ARRAY[
    'Instant Virtual Staging from single photos',
    'Multiple interior design styles',
    'High-resolution photorealistic exports',
    'Object removal and decluttering'
  ],
  use_cases = ARRAY[
    'Staging vacant listings to sell faster',
    'Helping buyers visualize renovations',
    'Creating engaging social media content'
  ]
WHERE slug = 'aicasadesign';
