import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Copy, Loader2, Lock, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useSkillAccess } from "@/hooks/useSkillAccess";
import { useCheckout } from "@/hooks/useCheckout";
import { useAuth } from "@/hooks/useAuth";

type SkillRow = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  overview: string | null;
  audience: string;
  file_url: string | null;
  access_level: string;
  price: number;
  toolbox: string | null;
};

const LLM_LINKS = [
  { label: "Open ChatGPT", href: "https://chatgpt.com" },
  { label: "Open Claude", href: "https://claude.ai/new" },
  { label: "Open Gemini", href: "https://gemini.google.com" },
];

export default function SkillDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const copyTimer = useRef<number | null>(null);
  const autoCopied = useRef(false);
  const autoCheckedOut = useRef(false);

  const { data: skill, isLoading } = useQuery({
    queryKey: ["skill-detail", slug],
    enabled: !!slug,
    queryFn: async (): Promise<SkillRow | null> => {
      const { data, error } = await supabase
        .from("skills" as any)
        .select("id, name, slug, tagline, description, overview, audience, file_url, access_level, price, toolbox")
        .eq("slug", slug!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as SkillRow) ?? null;
    },
  });

  const { isPaid, locked, requiredToolbox } = useSkillAccess({
    access_level: skill?.access_level,
    toolbox: skill?.toolbox,
  });
  const { startCheckout, loading: checkoutLoading } = useCheckout();

  useEffect(() => {
    if (!skill) return;
    document.title = `${skill.name} — RealToolbox.ai`;
    const meta =
      document.querySelector('meta[name="description"]') ??
      (() => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
        return m;
      })();
    meta.setAttribute(
      "content",
      (skill.description ?? skill.tagline ?? "Operator-grade AI workflow for real estate investors.").slice(0, 160),
    );
  }, [skill]);

  useEffect(() => {
    return () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    };
  }, []);

  async function fetchAndCopySkill() {
    if (!skill) return;
    setCopying(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-skill-content", {
        body: { slug: skill.slug },
      });
      if (error || !data?.content) throw error ?? new Error("No content");
      await navigator.clipboard.writeText(data.content);
      setCopied(true);
      toast.success("Skill copied to your clipboard.");
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 3500);
    } catch (err) {
      console.warn("copy skill failed", err);
      toast.error("Couldn't copy the skill. Please try again.");
    } finally {
      setCopying(false);
    }
  }

  function handleFreeCopyClick() {
    if (!skill) return;
    if (!user) {
      const next = `/toolbox/${skill.slug}?copy=1`;
      navigate(`/auth?mode=signup&next=${encodeURIComponent(next)}`);
      return;
    }
    fetchAndCopySkill();
  }

  // Auto-copy after returning from /auth?next=/skills/<slug>?copy=1
  useEffect(() => {
    if (authLoading || !skill || !user || isPaid) return;
    if (params.get("copy") !== "1" || autoCopied.current) return;
    autoCopied.current = true;
    // Fire-and-forget list capture with source tag
    (async () => {
      const email = user.email;
      if (email) {
        await supabase
          .from("newsletter_subscribers")
          .insert({ email, source: "deal_screen_free" } as any);
      }
    })();
    params.delete("copy");
    setParams(params, { replace: true });
    fetchAndCopySkill();
  }, [authLoading, user, skill, isPaid, params, setParams]);

  // Auto-resume checkout after returning from /auth?next=/skills/<slug>?checkout=investor|complete
  useEffect(() => {
    if (authLoading || !skill || !user) return;
    const target = params.get("checkout");
    if (!target || autoCheckedOut.current) return;
    if (target !== "investor" && target !== "complete") return;
    autoCheckedOut.current = true;
    params.delete("checkout");
    setParams(params, { replace: true });
    startCheckout(target as "investor" | "complete", `/toolbox/${skill.slug}`);
  }, [authLoading, user, skill, params, setParams, startCheckout]);

  const isAgent = requiredToolbox === "agent_toolbox";

  return (
    <AppLayout>
      <section className="mx-auto max-w-[900px] px-6 lg:px-10 pt-12 lg:pt-16 pb-10">
        <Link
          to="/toolbox"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-base"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All skills
        </Link>

        {isLoading ? (
          <div className="mt-10 text-sm text-muted-foreground">Loading…</div>
        ) : !skill ? (
          <div className="mt-10 text-sm text-muted-foreground">
            Skill not found. <Link to="/toolbox" className="underline">Back to all skills</Link>.
          </div>
        ) : (
          <>
            <div className="mt-8 flex items-center gap-3">
              <span className="text-[10px] px-2 py-[3px] rounded-md border bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25 font-semibold uppercase tracking-[0.08em]">
                {skill.tagline ?? "Skill"}
              </span>
              {isPaid && (
                locked ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
                    <Lock className="h-3 w-3" aria-hidden /> Locked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(229_94%_82%)]">
                    <Sparkles className="h-3 w-3" aria-hidden /> Unlocked
                  </span>
                )
              )}
            </div>

            <h1 className="mt-4 font-display text-4xl lg:text-[52px] font-bold leading-[1.05] tracking-[-0.03em] text-foreground">
              {skill.name}
            </h1>

            {skill.description && (
              <p className="mt-5 text-[16.5px] text-muted-foreground leading-[1.7]">
                {skill.description}
              </p>
            )}
          </>
        )}
      </section>

      {skill && (
        <>
          {/* Overview */}
          <section className="mx-auto max-w-[900px] px-6 lg:px-10 pb-10">
            <div className="rounded-2xl p-7 lg:p-9 surface-card">
              <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-4">
                Overview
              </p>
              {skill.overview ? (
                <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-[-0.01em] prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-muted-foreground prose-p:leading-[1.7] prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-[hsl(229_94%_82%)]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{skill.overview}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-[15px] text-muted-foreground leading-[1.7]">
                  {skill.description ?? "A complete operator workflow you can drop into ChatGPT, Claude, or Gemini."}
                </p>
              )}
            </div>
          </section>

          {/* How to set it up for continuous use */}
          <section className="mx-auto max-w-[900px] px-6 lg:px-10 pb-10">
            <div className="rounded-2xl p-7 lg:p-9 surface-card">
              <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-5">
                How to set it up for continuous use
              </p>
              <ol className="space-y-4 text-[15px] text-muted-foreground leading-[1.7] list-decimal pl-5 marker:text-foreground/60 marker:font-semibold">
                <li>Copy the skill (button below).</li>
                <li>Open your AI assistant.</li>
                <li>
                  Save it once so it&apos;s always on:
                  <ul className="mt-2 space-y-2 list-disc pl-5 marker:text-foreground/40">
                    <li>
                      <span className="text-foreground/85 font-semibold">ChatGPT</span> — create a new Custom GPT and paste the skill into its instructions (or paste into any chat for one-time use).
                    </li>
                    <li>
                      <span className="text-foreground/85 font-semibold">Claude</span> — create a new Project and paste the skill into the project&apos;s custom instructions.
                    </li>
                    <li>
                      <span className="text-foreground/85 font-semibold">Gemini</span> — create a new Gem and paste the skill into its instructions.
                    </li>
                  </ul>
                </li>
                <li>From then on, just talk to it — your AI follows the skill every time, no re-pasting.</li>
              </ol>
            </div>
          </section>

          {/* Action area */}
          <section className="mx-auto max-w-[900px] px-6 lg:px-10 pb-20">
            {isPaid && locked ? (
              <div className="rounded-2xl p-6 lg:p-7 surface-card border border-foreground/10">
                <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                  <Lock className="h-3.5 w-3.5" />
                  Own the {isAgent ? "Agent" : "Investor"} Toolbox
                </div>
                <p className="mt-3 text-[15px] text-foreground/85 leading-[1.65]">
                  One payment, lifetime updates. Every skill in this toolbox unlocks the moment you buy.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {isAgent ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center rounded-[10px] border border-foreground/15 bg-foreground/[0.04] px-6 py-3 text-[14px] font-semibold text-muted-foreground cursor-not-allowed"
                    >
                      Agent Toolbox — coming soon
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startCheckout("investor", `/toolbox/${skill.slug}`)}
                      disabled={checkoutLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/25 hover:shadow-[hsl(252_84%_50%)]/40 transition-base disabled:opacity-70"
                    >
                      {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Get the Investor Toolbox — $79{" "}
                      <span className="opacity-70 font-normal">(founding, reg $99)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startCheckout("complete", `/toolbox/${skill.slug}`)}
                    disabled={checkoutLoading}
                    className="inline-flex items-center justify-center rounded-[10px] border border-foreground/15 bg-background/40 px-4 py-3 text-[13.5px] font-semibold text-foreground/85 hover:border-[hsl(239_84%_67%)]/45 hover:text-foreground transition-base disabled:opacity-70"
                  >
                    Or get the Complete Toolbox — $149
                  </button>
                  <Link
                    to="/toolbox"
                    className="text-[13px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-base"
                  >
                    Browse other skills
                  </Link>
                </div>
              </div>
            ) : isPaid ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={fetchAndCopySkill}
                  disabled={copying}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/25 hover:shadow-[hsl(252_84%_50%)]/40 transition-base disabled:opacity-70"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copying ? "Copying…" : copied ? "Copied!" : "Copy skill"}
                </button>
                {LLM_LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-[10px] border border-foreground/15 bg-background/40 px-4 py-3 text-[13.5px] font-semibold text-foreground/85 hover:border-[hsl(239_84%_67%)]/45 hover:text-foreground transition-base"
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[13px] text-muted-foreground">
                  Free forever — just create your free account.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleFreeCopyClick}
                    disabled={copying}
                    className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/25 hover:shadow-[hsl(252_84%_50%)]/40 transition-base disabled:opacity-70"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copying
                      ? "Copying…"
                      : copied
                        ? "Copied!"
                        : user
                          ? "Copy skill"
                          : "Copy skill — free with account"}
                  </button>
                  {LLM_LINKS.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-[10px] border border-foreground/15 bg-background/40 px-4 py-3 text-[13.5px] font-semibold text-foreground/85 hover:border-[hsl(239_84%_67%)]/45 hover:text-foreground transition-base"
                    >
                      {l.label} →
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </AppLayout>
  );
}
