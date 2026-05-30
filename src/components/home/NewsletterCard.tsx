import { FormEvent, useState } from "react";
import { Mail, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function NewsletterCard({ source = "homepage" }: { source?: string } = {}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

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
    <section id="newsletter" className="px-6 lg:px-10 py-16">
      <div className="mx-auto surface-card rounded-2xl p-8 lg:p-10 text-center" style={{ maxWidth: 640 }}>
        <div className="mx-auto h-11 w-11 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center mb-5">
          <Mail className="h-5 w-5 text-[hsl(229_94%_82%)]" />
        </div>
        <h2 className="font-display text-[28px] font-bold text-foreground tracking-tight">
          New tools, every month
        </h2>
        <p className="mt-2.5 text-[14px] text-muted-foreground leading-[1.65]">
          The latest AI tools for real estate and beyond. No sponsored content — just what&apos;s actually useful.
        </p>

        {done ? (
          <div className="mt-6 inline-flex items-center gap-2 text-success">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">You&apos;re in. Talk soon.</span>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 bg-foreground/[0.05] border border-foreground/10 rounded-lg px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 transition-base"
            />
            <button
              type="submit"
              disabled={busy}
              className="bg-foreground text-background rounded-lg px-5 py-2.5 text-[13px] font-semibold hover:bg-foreground/90 transition-base disabled:opacity-50"
            >
              {busy ? "…" : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
