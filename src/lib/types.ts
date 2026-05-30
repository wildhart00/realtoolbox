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
  screenshot_url: string | null;
  website_url: string;
  affiliate_url: string | null;
  logo_url: string | null;
  banner_color: string | null;
  pricing: PricingModel;
  pricing_details: string | null;
  is_featured: boolean;
  featured_order: number | null;
  is_just_launched: boolean;
  just_launched_date: string | null;
  is_verified: boolean;
  is_editors_pick: boolean;
  re_only: boolean;
  tags: string[];
  status: string;
  founder_name: string | null;
  founder_bio: string | null;
  founder_avatar_url: string | null;
  key_features: string[];
  use_cases: string[];
  created_at?: string;
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
