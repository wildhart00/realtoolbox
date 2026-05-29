import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  tools: number;
  pendingSubmissions: number;
  subscribers: number;
  clicks: number;
  reviews: number;
  posts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const counts = await Promise.all([
        supabase.from("tools").select("*", { count: "exact", head: true }),
        supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
        supabase.from("click_events").select("*", { count: "exact", head: true }),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        tools: counts[0].count ?? 0,
        pendingSubmissions: counts[1].count ?? 0,
        subscribers: counts[2].count ?? 0,
        clicks: counts[3].count ?? 0,
        reviews: counts[4].count ?? 0,
        posts: counts[5].count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: "Tools", value: stats?.tools, href: "/admin/tools" },
    { label: "Pending submissions", value: stats?.pendingSubmissions, href: "/admin/submissions" },
    { label: "Subscribers", value: stats?.subscribers, href: "/admin/subscribers" },
    { label: "Total clicks", value: stats?.clicks, href: "/admin/analytics" },
    { label: "Reviews", value: stats?.reviews, href: "/admin/reviews" },
    { label: "Blog posts", value: stats?.posts, href: "/admin/blog" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.href}>
            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{c.value ?? "—"}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
