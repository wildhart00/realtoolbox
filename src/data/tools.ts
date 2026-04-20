export type PricingModel = "Free" | "Freemium" | "Paid";

export type Tool = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category_slug: string;
  pricing: PricingModel;
  is_verified: boolean;
  is_featured: boolean;
  website_url: string;
  rating: number;
  reviews_count: number;
  founder: string;
  founder_bio: string;
  logo_bg: string; // tailwind gradient class
  logo_initial: string;
  features: string[];
  founded: string;
};

export const tools: Tool[] = [
  {
    id: "1", name: "ListedKit", slug: "listedkit",
    tagline: "AI transaction coordinator that closes deals 3x faster.",
    description: "ListedKit automates the entire transaction process from contract to close. It uses AI to track deadlines, send reminders, generate documents, and keep all parties aligned. Built by former agents, it integrates with every major MLS and CRM.",
    category_slug: "workflow-automation", pricing: "Paid", is_verified: true, is_featured: true,
    website_url: "https://example.com/listedkit", rating: 4.8, reviews_count: 142,
    founder: "Sarah Chen", founder_bio: "Former Compass agent who closed $200M before building ListedKit.",
    logo_bg: "from-blue-500 to-cyan-500", logo_initial: "L",
    features: ["Auto-deadline tracking", "Document generation", "MLS integration", "Client portal", "E-signature"],
    founded: "2022",
  },
  {
    id: "2", name: "Listing Copilot", slug: "listing-copilot",
    tagline: "Generate MLS-ready listing descriptions in 10 seconds.",
    description: "Drop in property details and Listing Copilot crafts compelling, fair-housing-compliant descriptions tuned to your market. Includes social captions, email blasts, and flyer copy.",
    category_slug: "listing-descriptions", pricing: "Freemium", is_verified: true, is_featured: true,
    website_url: "https://example.com/listing-copilot", rating: 4.9, reviews_count: 312,
    founder: "Marcus Rivera", founder_bio: "Ex-OpenAI engineer turned RE tech founder.",
    logo_bg: "from-violet-500 to-fuchsia-500", logo_initial: "L",
    features: ["MLS-ready output", "Fair housing checks", "Multi-language", "Tone presets", "Bulk generation"],
    founded: "2023",
  },
  {
    id: "3", name: "Virtuoso Stage", slug: "virtuoso-stage",
    tagline: "Stage any empty room with photorealistic AI furniture.",
    description: "Upload a photo of an empty room and Virtuoso Stage delivers a fully staged, photorealistic image in under 30 seconds. Choose from 20+ design styles. No 3D modeling needed.",
    category_slug: "virtual-staging", pricing: "Paid", is_verified: true, is_featured: true,
    website_url: "https://example.com/virtuoso", rating: 4.7, reviews_count: 489,
    founder: "Aisha Patel", founder_bio: "Architectural designer turned AI builder.",
    logo_bg: "from-amber-500 to-rose-500", logo_initial: "V",
    features: ["20+ design styles", "30-second turnaround", "Bulk uploads", "Brand watermarks", "Print-ready 4K"],
    founded: "2023",
  },
  {
    id: "4", name: "LeadOrbit", slug: "leadorbit",
    tagline: "Predictive AI that finds homeowners before they list.",
    description: "LeadOrbit analyzes 200+ signals — life events, mortgage data, social posts — to predict who's likely to sell in the next 90 days. Verified contact info included.",
    category_slug: "lead-generation", pricing: "Paid", is_verified: true, is_featured: true,
    website_url: "https://example.com/leadorbit", rating: 4.6, reviews_count: 87,
    founder: "Daniel Kim", founder_bio: "Former data scientist at Zillow.",
    logo_bg: "from-emerald-500 to-teal-500", logo_initial: "O",
    features: ["Predictive scoring", "Verified contacts", "CRM sync", "Compliance built-in", "Daily refresh"],
    founded: "2022",
  },
  {
    id: "5", name: "Skyline Photo", slug: "skyline-photo",
    tagline: "Pro real estate photo editing — automated.",
    description: "Skyline replaces dull skies, balances exposure, removes clutter, and enhances curb appeal with one click. Trained on millions of MLS photos.",
    category_slug: "photography", pricing: "Freemium", is_verified: true, is_featured: false,
    website_url: "https://example.com/skyline", rating: 4.8, reviews_count: 1024,
    founder: "Jenna Wu", founder_bio: "Real estate photographer for 10+ years.",
    logo_bg: "from-sky-500 to-indigo-500", logo_initial: "S",
    features: ["Sky replacement", "HDR balance", "Lawn enhancement", "Object removal", "Batch processing"],
    founded: "2021",
  },
  {
    id: "6", name: "AgentDeck CRM", slug: "agentdeck",
    tagline: "The AI-first CRM built for solo agents and teams.",
    description: "AgentDeck combines a powerful CRM with an AI assistant that drafts emails, schedules follow-ups, and surfaces hot leads automatically. Replaces 5 tools.",
    category_slug: "crm", pricing: "Paid", is_verified: true, is_featured: true,
    website_url: "https://example.com/agentdeck", rating: 4.5, reviews_count: 256,
    founder: "Tom Bradley", founder_bio: "Built and sold a previous CRM to a top brokerage.",
    logo_bg: "from-orange-500 to-red-500", logo_initial: "A",
    features: ["AI email drafts", "Smart pipelines", "Calendar sync", "SMS automation", "Team analytics"],
    founded: "2022",
  },
  {
    id: "7", name: "Casa3D", slug: "casa3d",
    tagline: "Turn any listing into an interactive 3D walkthrough.",
    description: "Casa3D uses your phone camera to scan a property and generate a Matterport-style walkthrough in minutes — no special hardware required.",
    category_slug: "3d-modelling", pricing: "Freemium", is_verified: true, is_featured: false,
    website_url: "https://example.com/casa3d", rating: 4.6, reviews_count: 178,
    founder: "Lucas Moreno", founder_bio: "Computer vision PhD from Stanford.",
    logo_bg: "from-cyan-500 to-blue-600", logo_initial: "C",
    features: ["Phone-based scanning", "Auto floor plans", "Embed anywhere", "Measurement tools", "VR ready"],
    founded: "2023",
  },
  {
    id: "8", name: "Reel Estate", slug: "reel-estate",
    tagline: "AI-generated listing videos with voiceover and music.",
    description: "Upload listing photos, pick a style, and Reel Estate produces a polished 60-second video with AI voiceover, captions, and licensed music — ready for Instagram and TikTok.",
    category_slug: "video", pricing: "Freemium", is_verified: true, is_featured: true,
    website_url: "https://example.com/reel-estate", rating: 4.7, reviews_count: 421,
    founder: "Priya Shah", founder_bio: "Former video producer at HGTV.",
    logo_bg: "from-rose-500 to-pink-600", logo_initial: "R",
    features: ["AI voiceover", "Auto captions", "Music library", "Brand templates", "Vertical & horizontal"],
    founded: "2023",
  },
  {
    id: "9", name: "DealCruncher", slug: "dealcruncher",
    tagline: "Underwrite multifamily deals in 90 seconds.",
    description: "Paste a listing URL or T-12 PDF and DealCruncher returns full underwriting — cap rate, IRR, cash-on-cash, sensitivity tables, and a pitch deck for lenders.",
    category_slug: "underwriting", pricing: "Paid", is_verified: true, is_featured: false,
    website_url: "https://example.com/dealcruncher", rating: 4.9, reviews_count: 64,
    founder: "Jordan Reese", founder_bio: "Multifamily investor with $80M AUM.",
    logo_bg: "from-green-500 to-emerald-600", logo_initial: "D",
    features: ["T-12 parsing", "IRR & cap rate", "Sensitivity tables", "Lender pitch decks", "Comp pulling"],
    founded: "2023",
  },
  {
    id: "10", name: "TourGenie", slug: "tourgenie",
    tagline: "Self-scheduling AI that books showings around the clock.",
    description: "TourGenie chats with leads via SMS and web, qualifies them, checks your calendar, and books showings — all without you lifting a finger.",
    category_slug: "scheduling", pricing: "Freemium", is_verified: true, is_featured: false,
    website_url: "https://example.com/tourgenie", rating: 4.4, reviews_count: 198,
    founder: "Mei Tanaka", founder_bio: "Ex-Calendly product lead.",
    logo_bg: "from-purple-500 to-indigo-600", logo_initial: "T",
    features: ["SMS & web chat", "Lead qualification", "Calendar sync", "Auto reminders", "Lockbox integration"],
    founded: "2022",
  },
  {
    id: "11", name: "PlanCraft AI", slug: "plancraft",
    tagline: "Generate beautiful 2D and 3D floor plans from a sketch.",
    description: "Sketch a rough layout on paper, snap a photo, and PlanCraft converts it into MLS-ready floor plans with accurate measurements.",
    category_slug: "floor-plans", pricing: "Paid", is_verified: false, is_featured: false,
    website_url: "https://example.com/plancraft", rating: 4.3, reviews_count: 92,
    founder: "Owen Liu", founder_bio: "Architect turned indie hacker.",
    logo_bg: "from-slate-500 to-zinc-600", logo_initial: "P",
    features: ["Sketch-to-plan", "Auto measurements", "3D export", "MLS formats", "Furniture library"],
    founded: "2024",
  },
  {
    id: "12", name: "EchoCall", slug: "echocall",
    tagline: "AI assistant that handles your inbound calls 24/7.",
    description: "EchoCall answers, qualifies, and routes incoming calls with a natural-sounding AI voice. Get a summary and next-step in your inbox after every call.",
    category_slug: "voice-calling", pricing: "Paid", is_verified: true, is_featured: false,
    website_url: "https://example.com/echocall", rating: 4.6, reviews_count: 134,
    founder: "Hannah Ortiz", founder_bio: "Former Twilio engineer.",
    logo_bg: "from-fuchsia-500 to-purple-600", logo_initial: "E",
    features: ["Natural AI voice", "Call summaries", "CRM logging", "Multi-language", "Custom scripts"],
    founded: "2023",
  },
  {
    id: "13", name: "BrokerSite", slug: "brokersite",
    tagline: "Build a stunning IDX agent website in 5 minutes.",
    description: "Answer a few questions and BrokerSite generates a full IDX-integrated website with your branding, MLS feeds, lead capture, and blog.",
    category_slug: "websites", pricing: "Freemium", is_verified: true, is_featured: false,
    website_url: "https://example.com/brokersite", rating: 4.5, reviews_count: 367,
    founder: "Riley Hayes", founder_bio: "Web designer for 200+ brokerages.",
    logo_bg: "from-blue-500 to-indigo-600", logo_initial: "B",
    features: ["IDX integration", "5-min setup", "Lead capture", "Blog & SEO", "Custom domain"],
    founded: "2022",
  },
  {
    id: "14", name: "MarketPulse", slug: "marketpulse",
    tagline: "Hyper-local market reports your clients actually read.",
    description: "MarketPulse generates branded, hyper-local market reports for any zip code — perfect for newsletters, listing presentations, and CMAs.",
    category_slug: "analytics", pricing: "Paid", is_verified: true, is_featured: false,
    website_url: "https://example.com/marketpulse", rating: 4.7, reviews_count: 211,
    founder: "Carlos Vega", founder_bio: "Former Redfin economist.",
    logo_bg: "from-teal-500 to-cyan-600", logo_initial: "M",
    features: ["Zip-level data", "Branded PDFs", "Email automation", "CMA builder", "Trend alerts"],
    founded: "2021",
  },
  {
    id: "15", name: "InboxAgent", slug: "inboxagent",
    tagline: "AI email sequences that book more listing appointments.",
    description: "Plug in your CRM and InboxAgent writes personalized drip campaigns, follows up at the perfect time, and warms up cold leads at scale.",
    category_slug: "email-marketing", pricing: "Freemium", is_verified: true, is_featured: false,
    website_url: "https://example.com/inboxagent", rating: 4.4, reviews_count: 156,
    founder: "Ben Foster", founder_bio: "Email marketer for 15 years.",
    logo_bg: "from-yellow-500 to-orange-500", logo_initial: "I",
    features: ["AI personalization", "Smart send times", "A/B testing", "CRM sync", "Deliverability tools"],
    founded: "2023",
  },
  {
    id: "16", name: "ChatRealty", slug: "chatrealty",
    tagline: "Conversational AI that qualifies leads on your website.",
    description: "Embed ChatRealty on your site to engage every visitor, answer property questions, and book showings — even at 2am.",
    category_slug: "chatbots", pricing: "Freemium", is_verified: false, is_featured: false,
    website_url: "https://example.com/chatrealty", rating: 4.2, reviews_count: 89,
    founder: "Nina Kapoor", founder_bio: "ML researcher and indie hacker.",
    logo_bg: "from-pink-500 to-rose-600", logo_initial: "C",
    features: ["Website widget", "MLS lookup", "Lead scoring", "Calendar booking", "Multi-language"],
    founded: "2024",
  },
  {
    id: "17", name: "PenName", slug: "penname",
    tagline: "Your personal AI ghostwriter for blogs and newsletters.",
    description: "PenName learns your voice and writes blog posts, newsletters, and social captions that sound like you — not a robot.",
    category_slug: "content-creation", pricing: "Paid", is_verified: true, is_featured: false,
    website_url: "https://example.com/penname", rating: 4.6, reviews_count: 178,
    founder: "Alex Romero", founder_bio: "Best-selling RE author.",
    logo_bg: "from-indigo-500 to-violet-600", logo_initial: "P",
    features: ["Voice training", "SEO optimization", "Newsletter scheduling", "Social repurposing", "Image generation"],
    founded: "2023",
  },
  {
    id: "18", name: "RankHaus", slug: "rankhaus",
    tagline: "On-page SEO automation for real estate websites.",
    description: "RankHaus audits your site, generates schema markup, optimizes listings, and tracks rankings — built for IDX sites and brokerages.",
    category_slug: "seo", pricing: "Paid", is_verified: true, is_featured: false,
    website_url: "https://example.com/rankhaus", rating: 4.5, reviews_count: 102,
    founder: "Erin Walsh", founder_bio: "SEO consultant for top 100 brokerages.",
    logo_bg: "from-lime-500 to-green-600", logo_initial: "R",
    features: ["IDX schema", "Rank tracking", "Auto audits", "Local SEO", "Competitor analysis"],
    founded: "2022",
  },
  {
    id: "19", name: "TenantPilot", slug: "tenantpilot",
    tagline: "Automate tenant communications and maintenance with AI.",
    description: "TenantPilot handles maintenance requests, lease questions, and rent reminders for property managers — 24/7, in 30+ languages.",
    category_slug: "property-management", pricing: "Paid", is_verified: true, is_featured: false,
    website_url: "https://example.com/tenantpilot", rating: 4.4, reviews_count: 73,
    founder: "Yuki Sato", founder_bio: "Built tools for 50K+ doors.",
    logo_bg: "from-emerald-500 to-green-600", logo_initial: "T",
    features: ["AI tenant chat", "Maintenance routing", "Rent reminders", "Multi-language", "Owner reports"],
    founded: "2023",
  },
  {
    id: "20", name: "ClauseGuard", slug: "clauseguard",
    tagline: "AI contract review for real estate professionals.",
    description: "Drop a purchase agreement, lease, or addendum into ClauseGuard and get instant flagged risks, missing clauses, and plain-English explanations.",
    category_slug: "compliance", pricing: "Paid", is_verified: true, is_featured: false,
    website_url: "https://example.com/clauseguard", rating: 4.8, reviews_count: 91,
    founder: "Marcus Webb", founder_bio: "Real estate attorney for 18 years.",
    logo_bg: "from-slate-600 to-slate-800", logo_initial: "C",
    features: ["Risk flagging", "Plain-English summaries", "Clause library", "State-specific", "Attorney reviewed"],
    founded: "2024",
  },
];

export const getToolBySlug = (slug: string) => tools.find((t) => t.slug === slug);
export const getToolsByCategory = (slug: string) => tools.filter((t) => t.category_slug === slug);
export const getFeaturedTools = () => tools.filter((t) => t.is_featured);
