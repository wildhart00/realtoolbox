import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Tool, PremiumResource, Review } from "@/lib/types";

const toolSelect = "*, tool_categories(category:categories(*))";

function shapeTool(t: any): Tool {
  return {
    ...t,
    tags: t.tags ?? [],
    re_only: t.re_only ?? true,
    status: t.status ?? "published",
    banner_color: t.banner_color ?? "#1a1f2e",
    featured_order: t.featured_order ?? 0,
    affiliate_url: t.affiliate_url ?? null,
    categories: (t.tool_categories ?? []).map((tc: any) => tc.category).filter(Boolean),
  } as Tool;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useTools() {
  return useQuery({
    queryKey: ["tools"],
    queryFn: async (): Promise<Tool[]> => {
      const { data, error } = await supabase
        .from("tools")
        .select(toolSelect)
        .eq("status", "published")
        .order("name");
      if (error) throw error;
      return (data ?? []).map(shapeTool);
    },
  });
}

export function useFeaturedTools() {
  return useQuery({
    queryKey: ["tools-featured"],
    queryFn: async (): Promise<Tool[]> => {
      const { data, error } = await supabase
        .from("tools")
        .select(toolSelect)
        .eq("status", "published")
        .eq("is_featured", true)
        .order("featured_order", { ascending: true })
        .limit(6);
      if (error) throw error;
      return (data ?? []).map(shapeTool);
    },
  });
}

export function useJustLaunchedTools() {
  return useQuery({
    queryKey: ["tools-just-launched"],
    queryFn: async (): Promise<Tool[]> => {
      const { data, error } = await supabase
        .from("tools")
        .select(toolSelect)
        .eq("status", "published")
        .eq("is_just_launched", true)
        .order("just_launched_date", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data ?? []).map(shapeTool);
    },
  });
}

export function useTool(slug: string | undefined) {
  return useQuery({
    queryKey: ["tool", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Tool | null> => {
      const { data, error } = await supabase
        .from("tools")
        .select(toolSelect)
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return shapeTool(data);
    },
  });
}

export function useReviews(toolId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", toolId],
    enabled: !!toolId,
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("tool_id", toolId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const reviews = (data ?? []) as Review[];
      if (reviews.length === 0) return reviews;
      const userIds = [...new Set(reviews.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
      return reviews.map((r) => ({ ...r, profile: profileMap.get(r.user_id) ?? undefined }));
    },
  });
}

export function usePremiumResources() {
  return useQuery({
    queryKey: ["premium-resources"],
    queryFn: async (): Promise<PremiumResource[]> => {
      const { data, error } = await supabase.from("premium_resources").select("*").order("sort_order");
      if (error) throw error;
      return data as PremiumResource[];
    },
  });
}

export function useSavedToolIds(userId: string | undefined) {
  return useQuery({
    queryKey: ["saved-tools", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Set<string>> => {
      const { data, error } = await supabase
        .from("saved_tools")
        .select("tool_id")
        .eq("user_id", userId!);
      if (error) throw error;
      return new Set((data ?? []).map((r: any) => r.tool_id));
    },
  });
}
