export type PricingModel = "free" | "freemium" | "paid";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  full_description: string | null;
  hero_image_url: string | null;
  website_url: string;
  logo_url: string | null;
  pricing: PricingModel;
  pricing_details: string | null;
  is_featured: boolean;
  is_verified: boolean;
  is_editors_pick: boolean;
  founder_name: string | null;
  founder_bio: string | null;
  founder_avatar_url: string | null;
  key_features: string[];
  use_cases: string[];
  categories?: Category[];
}

export interface Review {
  id: string;
  tool_id: string;
  user_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface PremiumResource {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  cover_emoji: string | null;
  sort_order: number;
}
