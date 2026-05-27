import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/** Logs a click and redirects to affiliate_url (or website_url). */
const GoRedirectPage = () => {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!slug) return;
      const { data } = await supabase
        .from("tools")
        .select("id, slug, affiliate_url, website_url")
        .eq("slug", slug)
        .maybeSingle();
      if (cancelled) return;

      const target = (data as any)?.affiliate_url || (data as any)?.website_url;
      if (data) {
        // Fire-and-forget log
        supabase
          .from("click_events")
          .insert({
            tool_id: (data as any).id,
            tool_slug: (data as any).slug,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent || null,
          })
          .then(() => {});
      }
      if (target) {
        window.location.replace(target);
      } else {
        window.location.replace("/");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
      Redirecting…
    </div>
  );
};

export default GoRedirectPage;
