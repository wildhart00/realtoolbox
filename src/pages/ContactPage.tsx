import { FormEvent, useState } from "react";
import { z } from "zod";
import { Mail, Check } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be under 255 characters"),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message must be under 5000 characters"),
});

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse({ name, email, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("contact_messages" as any)
      .insert(parsed.data as any);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-[640px] px-6 lg:px-10 py-16">
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-foreground/40">Contact</p>
        <h1 className="mt-2 font-display text-[40px] font-bold text-foreground tracking-tight">
          Get in touch
        </h1>
        <p className="mt-3 text-[15px] text-foreground/60 leading-[1.65]">
          Tool to recommend? Feedback? Partnership idea? Drop a note.
        </p>


        <div className="mt-10 surface-card rounded-2xl p-7 lg:p-8">
          {done ? (
            <div className="text-center py-8">
              <div className="mx-auto h-11 w-11 rounded-xl bg-success/15 border border-success/25 flex items-center justify-center mb-4">
                <Check className="h-5 w-5 text-success" />
              </div>
              <h2 className="font-display text-[22px] font-bold text-foreground">Message sent</h2>
              <p className="mt-2 text-[14px] text-foreground/55">Thanks — we&apos;ll get back to you soon.</p>
              <button
                onClick={() => setDone(false)}
                className="mt-5 text-[13px] text-[hsl(229_94%_82%)] hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-foreground/60 mb-1.5">Name</label>
                <input
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-foreground/[0.05] border border-foreground/10 rounded-lg px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 transition-base"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-foreground/60 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  maxLength={255}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-foreground/[0.05] border border-foreground/10 rounded-lg px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 transition-base"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-foreground/60 mb-1.5">Message</label>
                <textarea
                  required
                  maxLength={5000}
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-foreground/[0.05] border border-foreground/10 rounded-lg px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 transition-base resize-y"
                  placeholder="What's on your mind?"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-foreground text-background rounded-lg px-5 py-2.5 text-[13px] font-semibold hover:bg-foreground/90 transition-base disabled:opacity-50"
              >
                {busy ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
