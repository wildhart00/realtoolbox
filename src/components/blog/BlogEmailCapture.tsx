import { FormEvent, useState } from "react";
import { Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Inline email capture for blog posts.
 *
 * Deliberately not the full-width NewsletterCard the footer already renders —
 * this sits inside the article column, mid-post, where a reader who is getting
 * value has a reason to subscribe. Writes to the same `subscribers` table with a
 * post-specific source so signups can be attributed.
 */
export function BlogEmailCapture({
  source = "blog",
  heading = "Get the next roundup",
  blurb = "New tool comparisons and workflow breakdowns for real estate investors, as they publish. No filler.",
}: {
  source?: string;
  heading?: string;
  blurb?: string;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await supabase
      .from("subscribers" as any)
      .insert({ email: email.trim().toLowerCase(), source } as any);
    setBusy(false);
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      toast.error(error.message);
      return;
    }
    setDone(true);
  };

  return (
    <aside className="my-10 rounded-2xl border border-foreground/10 bg-gradient-to-br from-[hsl(239_84%_60%)]/8 via-foreground/[0.02] to-[hsl(265_84%_60%)]/8 px-6 py-6">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(239_84%_60%)]/15 text-[hsl(229_94%_82%)]">
          <Mail className="h-4 w-4" />
        </span>
        <h3 className="font-display text-[18px] text-foreground tracking-tight leading-tight">
          {heading}
        </h3>
      </div>
      <p className="mt-2.5 text-[13.5px] text-muted-foreground leading-[1.65]">{blurb}</p>

      {done ? (
        <div className="mt-4 inline-flex items-center gap-2 text-success">
          <Check className="h-4 w-4" />
          <span className="text-[13.5px] font-medium">You&apos;re in. Talk soon.</span>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 min-w-0 bg-foreground/[0.05] border border-foreground/10 rounded-lg px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 transition-base"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base disabled:opacity-60"
          >
            {busy ? "…" : "Subscribe"}
          </button>
        </form>
      )}
    </aside>
  );
}
