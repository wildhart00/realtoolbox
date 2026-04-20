import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Lock, Download, Sparkles, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useTools, useSavedToolIds, usePremiumResources } from "@/hooks/useDirectory";
import { ToolCard } from "@/components/tools/ToolCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MembersPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AppLayout>
        <div className="px-6 py-24 text-center text-sm text-muted-foreground">Loading...</div>
      </AppLayout>
    );
  }

  if (!user) return <UnauthLanding />;
  return <MemberDashboard />;
};

function UnauthLanding() {
  return (
    <AppLayout hideSidebar>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-gradient-subtle" />
        <div className="absolute -top-24 right-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />
        <div className="relative px-6 py-20 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Members Hub
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Unlock the power of <span className="text-gradient">AI in real estate</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Join thousands of forward-thinking agents, brokers, and investors getting an unfair advantage with AI.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="hero" size="lg">
                <Link to="/auth?mode=signup&next=/members">Join the hub <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth?next=/members">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-10">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Heart, title: "Save your toolkit", body: "Bookmark tools you love and build a personal stack you can return to anytime." },
            { icon: Download, title: "Premium playbooks", body: "Downloadable PDFs: ChatGPT prompts for listings, AI workflow guides and more." },
            { icon: MessageSquare, title: "Share reviews", body: "Help peers cut through the noise — and get recognised for your contributions." },
          ].map((b) => (
            <div key={b.title} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}

function MemberDashboard() {
  const { user } = useAuth();
  const { data: tools = [] } = useTools();
  const { data: savedIds } = useSavedToolIds(user?.id);
  const { data: resources = [] } = usePremiumResources();
  const [myReviews, setMyReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("reviews")
      .select("*, tool:tools(name, slug)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setMyReviews(data ?? []));
  }, [user]);

  const savedTools = tools.filter((t) => savedIds?.has(t.id));

  const downloadResource = async (path: string, title: string) => {
    // Try to download; placeholder PDFs may not exist yet
    const { data, error } = await supabase.storage.from("premium-resources").download(path);
    if (error || !data) {
      toast.info("Download coming soon", { description: "This premium resource is being prepared." });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout hideSidebar>
      <section className="border-b border-border/60 bg-gradient-subtle px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-accent text-accent-foreground text-lg font-bold">
                {(user?.email ?? "U")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button asChild variant="outline"><Link to="/submit">Submit a tool</Link></Button>
        </div>
      </section>

      <section className="px-6 py-10 lg:px-10">
        <Tabs defaultValue="saved">
          <TabsList>
            <TabsTrigger value="saved">Saved tools ({savedTools.length})</TabsTrigger>
            <TabsTrigger value="reviews">My reviews ({myReviews.length})</TabsTrigger>
            <TabsTrigger value="premium">Premium content</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="mt-6">
            {savedTools.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 p-12 text-center">
                <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Tap the heart on any tool card to save it here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {savedTools.map((t) => <ToolCard key={t.id} tool={t} isSaved />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6 space-y-3">
            {myReviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
                You haven't written any reviews yet.
              </div>
            ) : (
              myReviews.map((r) => (
                <Link
                  key={r.id}
                  to={`/tools/${r.tool?.slug}`}
                  className="block rounded-xl border border-border/60 bg-card p-4 transition-base hover:border-accent/40"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{r.tool?.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-accent">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                  {r.body && <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>}
                </Link>
              ))
            )}
          </TabsContent>

          <TabsContent value="premium" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((r) => (
                <button
                  key={r.id}
                  onClick={() => downloadResource(r.file_path, r.title)}
                  className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 text-left transition-base hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-elevated"
                >
                  <div className="text-3xl">{r.cover_emoji ?? "📄"}</div>
                  <div className="flex-1">
                    <p className="font-semibold leading-tight">{r.title}</p>
                    {r.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </span>
                  </div>
                  <Lock className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </AppLayout>
  );
}

export default MembersPage;
