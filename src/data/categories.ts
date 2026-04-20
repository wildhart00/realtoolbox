import {
  Box, Users, BarChart3, Mail, Camera, FileText, Home, Megaphone,
  MessageSquare, PenTool, Search, Building2, Calculator, Calendar,
  Globe, Image, Layers, Map, Phone, ShieldCheck, Sparkles, Video,
  Wand2, Workflow,
} from "lucide-react";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: typeof Box;
  description: string;
};

export const categories: Category[] = [
  { id: "1", name: "3D Modelling", slug: "3d-modelling", icon: Box, description: "Photo-to-3D, virtual staging, walkthroughs." },
  { id: "2", name: "CRM", slug: "crm", icon: Users, description: "AI-powered client relationship management." },
  { id: "3", name: "Analytics", slug: "analytics", icon: BarChart3, description: "Market insights and predictive analytics." },
  { id: "4", name: "Email Marketing", slug: "email-marketing", icon: Mail, description: "Drip campaigns, smart subject lines." },
  { id: "5", name: "Photography", slug: "photography", icon: Camera, description: "AI photo enhancement, sky replacement." },
  { id: "6", name: "Listing Descriptions", slug: "listing-descriptions", icon: FileText, description: "Generate compelling MLS copy in seconds." },
  { id: "7", name: "Virtual Staging", slug: "virtual-staging", icon: Home, description: "Stage empty rooms with AI furniture." },
  { id: "8", name: "Lead Generation", slug: "lead-generation", icon: Megaphone, description: "Find and qualify high-intent buyers." },
  { id: "9", name: "Chatbots", slug: "chatbots", icon: MessageSquare, description: "24/7 conversational lead capture." },
  { id: "10", name: "Content Creation", slug: "content-creation", icon: PenTool, description: "Blog posts, social copy, scripts." },
  { id: "11", name: "SEO", slug: "seo", icon: Search, description: "Rank your listings and brand higher." },
  { id: "12", name: "Property Management", slug: "property-management", icon: Building2, description: "Automate tenant comms and ops." },
  { id: "13", name: "Underwriting", slug: "underwriting", icon: Calculator, description: "Deal analysis for investors." },
  { id: "14", name: "Scheduling", slug: "scheduling", icon: Calendar, description: "Smart showing and tour booking." },
  { id: "15", name: "Websites", slug: "websites", icon: Globe, description: "AI-built agent and brokerage sites." },
  { id: "16", name: "Floor Plans", slug: "floor-plans", icon: Layers, description: "Generate interactive 2D & 3D plans." },
  { id: "17", name: "Image Editing", slug: "image-editing", icon: Image, description: "Object removal, lighting, twilight." },
  { id: "18", name: "Maps & Location", slug: "maps-location", icon: Map, description: "Neighborhood and demographic data." },
  { id: "19", name: "Voice & Calling", slug: "voice-calling", icon: Phone, description: "AI dialers and call summaries." },
  { id: "20", name: "Compliance", slug: "compliance", icon: ShieldCheck, description: "Disclosures and contract review." },
  { id: "21", name: "Copywriting", slug: "copywriting", icon: Wand2, description: "Brand voice, ads, taglines." },
  { id: "22", name: "Video", slug: "video", icon: Video, description: "AI listing videos and reels." },
  { id: "23", name: "Workflow Automation", slug: "workflow-automation", icon: Workflow, description: "Zapier-style real estate flows." },
  { id: "24", name: "All-in-One", slug: "all-in-one", icon: Sparkles, description: "Suites that do everything." },
];

export const getCategoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
