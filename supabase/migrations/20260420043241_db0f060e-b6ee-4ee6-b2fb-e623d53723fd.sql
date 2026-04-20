
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'member');
CREATE TYPE public.pricing_model AS ENUM ('free', 'freemium', 'paid');
CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================
-- UTILITY: updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TOOLS
-- ============================================================
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  website_url TEXT NOT NULL,
  logo_url TEXT,
  pricing pricing_model NOT NULL DEFAULT 'freemium',
  pricing_details TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_editors_pick BOOLEAN NOT NULL DEFAULT false,
  founder_name TEXT,
  founder_bio TEXT,
  founder_avatar_url TEXT,
  key_features TEXT[] NOT NULL DEFAULT '{}',
  use_cases TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_tools_updated BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_tools_featured ON public.tools(is_featured) WHERE is_featured = true;
CREATE INDEX idx_tools_editors_pick ON public.tools(is_editors_pick) WHERE is_editors_pick = true;

-- ============================================================
-- TOOL <-> CATEGORY (many-to-many)
-- ============================================================
CREATE TABLE public.tool_categories (
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, category_id)
);
ALTER TABLE public.tool_categories ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_tool_categories_category ON public.tool_categories(category_id);

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- USER ROLES (separate table — security best practice)
-- ============================================================
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================================
-- PENDING TOOL SUBMISSIONS
-- ============================================================
CREATE TABLE public.pending_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  logo_url TEXT,
  founder_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  wants_featured BOOLEAN NOT NULL DEFAULT false,
  status submission_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pending_tools ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_pending_tools_updated BEFORE UPDATE ON public.pending_tools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tool_id, user_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_reviews_tool ON public.reviews(tool_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);

-- ============================================================
-- SAVED TOOLS (favorites)
-- ============================================================
CREATE TABLE public.saved_tools (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tool_id)
);
ALTER TABLE public.saved_tools ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PREMIUM RESOURCES
-- ============================================================
CREATE TABLE public.premium_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL, -- path in premium-resources bucket
  cover_emoji TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.premium_resources ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_premium_resources_updated BEFORE UPDATE ON public.premium_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Categories: public read, admin write
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tools: public read, admin write
CREATE POLICY "Tools are viewable by everyone" ON public.tools FOR SELECT USING (true);
CREATE POLICY "Admins manage tools" ON public.tools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tool categories: public read, admin write
CREATE POLICY "Tool-categories are viewable by everyone" ON public.tool_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage tool-categories" ON public.tool_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Profiles: anyone can view, owners can update/insert their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- User roles: users can view their own; admins manage
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Pending tools: submitter sees own + can insert; admins see/manage all
CREATE POLICY "Users view own submissions" ON public.pending_tools FOR SELECT TO authenticated
  USING (auth.uid() = submitted_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users submit tools" ON public.pending_tools FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Admins manage submissions" ON public.pending_tools FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete submissions" ON public.pending_tools FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Reviews: public read, owner write
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users insert own reviews" ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON public.reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own reviews" ON public.reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Saved tools: only owner
CREATE POLICY "Users view own saved tools" ON public.saved_tools FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users save tools" ON public.saved_tools FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unsave tools" ON public.saved_tools FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Premium resources: any authenticated user can view; admins manage
CREATE POLICY "Members view premium resources" ON public.premium_resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage premium resources" ON public.premium_resources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- AUTH TRIGGER: auto-create profile + default member role
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('tool-logos', 'tool-logos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('premium-resources', 'premium-resources', false) ON CONFLICT DO NOTHING;

-- Tool logos: public read, authenticated upload (for /submit)
CREATE POLICY "Tool logos are publicly viewable" ON storage.objects FOR SELECT
  USING (bucket_id = 'tool-logos');
CREATE POLICY "Authenticated users upload tool logos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tool-logos');

-- Avatars: public read, users manage their own folder (folder = user id)
CREATE POLICY "Avatars are publicly viewable" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own avatar" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Premium resources: any authenticated user can read; admins manage
CREATE POLICY "Members read premium resource files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'premium-resources');
CREATE POLICY "Admins upload premium resources" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'premium-resources' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update premium resources" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'premium-resources' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete premium resources" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'premium-resources' AND public.has_role(auth.uid(), 'admin'));
