import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ConnectMcpBlock } from "@/components/mcp/ConnectMcpBlock";

const SLUG = "setup-guide";

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function SetupGuidePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    document.title = "Setup guide — Load a skill into any AI | RealToolbox.ai";
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
      "How to load a RealToolbox skill into ChatGPT, Claude, or Gemini — plus how to connect your toolbox directly via MCP.",
    );
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth?mode=signup&next=" + encodeURIComponent("/setup-guide"), { replace: true });
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.functions.invoke("get-skill-content", {
        body: { slug: SLUG },
      });
      if (error || !data?.content) {
        setError("The setup guide isn't available yet. Please check back shortly.");
        setLoading(false);
        return;
      }
      setContent(data.content as string);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!content) return;
    // After render, scroll to hash if present
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    }
  }, [content]);

  useEffect(() => {
    return () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    };
  }, []);

  async function copyAll() {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Setup guide copied.");
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Couldn't copy. Try selecting the text manually.");
    }
  }

  // Extract H2 headings for anchor nav
  const headings: { id: string; text: string }[] = [];
  if (content) {
    const re = /^##\s+(.+)$/gm;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      const text = m[1].trim();
      headings.push({ id: slugifyHeading(text), text });
    }
  }

  return (
    <AppLayout>
      <section className="mx-auto max-w-[900px] px-6 lg:px-10 pt-12 lg:pt-16 pb-6">
        <Link
          to="/toolbox"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-base"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Toolbox
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <span className="text-[10px] px-2 py-[3px] rounded-md border bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25 font-semibold uppercase tracking-[0.08em]">
            Setup guide
          </span>
        </div>

        <h1 className="mt-4 font-display text-4xl lg:text-[52px] font-bold leading-[1.05] tracking-[-0.03em] text-foreground">
          How to load a skill into any AI
        </h1>
        <p className="mt-5 text-[16.5px] text-muted-foreground leading-[1.7]">
          Works with ChatGPT, Claude, and Gemini. Also includes how to connect your toolbox
          directly via MCP so your skills load themselves.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copyAll}
            disabled={!content}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base disabled:opacity-60"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy entire guide"}
          </button>
          <a
            href="#connect"
            className="text-[13px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-base"
          >
            Jump to MCP connection →
          </a>
        </div>
      </section>

      {headings.length > 0 && (
        <section className="mx-auto max-w-[900px] px-6 lg:px-10 pb-4">
          <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-foreground/50 font-semibold mb-2">
              In this guide
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              {headings.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className="text-[13px] text-foreground/80 hover:text-[hsl(229_94%_82%)] underline-offset-2 hover:underline"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[900px] px-6 lg:px-10 pb-10">
        <div className="rounded-2xl p-7 lg:p-9 surface-card">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading guide…
            </div>
          ) : error ? (
            <p className="text-sm text-muted-foreground">{error}</p>
          ) : (
            <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-[-0.01em] prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-10 prose-h2:scroll-mt-24 prose-h3:text-xl prose-h3:scroll-mt-24 prose-p:text-muted-foreground prose-p:leading-[1.75] prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-[hsl(229_94%_82%)] prose-code:text-foreground prose-pre:bg-background/60 prose-pre:border prose-pre:border-foreground/10">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => {
                    const text = String(children);
                    return <h2 id={slugifyHeading(text)}>{children}</h2>;
                  },
                  h3: ({ children }) => {
                    const text = String(children);
                    return <h3 id={slugifyHeading(text)}>{children}</h3>;
                  },
                }}
              >
                {content ?? ""}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-6 lg:px-10 pb-20">
        <ConnectMcpBlock variant="full" />
      </section>
    </AppLayout>
  );
}
