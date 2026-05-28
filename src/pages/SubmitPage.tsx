import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCategories } from "@/hooks/useDirectory";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SubmitPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();

  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pricing, setPricing] = useState<"free" | "freemium" | "paid">("freemium");
  const [founderName, setFounderName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!authLoading && !user) {
    return (
      <AppLayout>
        <div className="mx-auto px-6 py-24 text-center" style={{ maxWidth: 540 }}>
          <h1 className="font-display text-[28px] text-foreground">Sign in to submit a tool</h1>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Create a free account so we can keep you updated on your submission.
          </p>
          <Link
            to="/auth?mode=signup&next=/submit"
            className="inline-block mt-6 bg-foreground text-background rounded-lg px-5 py-2.5 text-[13px] font-semibold"
          >
            Create free account
          </Link>
        </div>
      </AppLayout>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!categoryId) return toast.error("Pick a category");
    setSubmitting(true);

    const fullDesc = `${description}\n\nPricing: ${pricing}`;
    const { error } = await (supabase.from("submissions" as any) as any).insert({
      submitted_by: user.id,
      name,
      website_url: websiteUrl,
      tagline,
      description: fullDesc,
      tool_category: categoryId,
      submitter_name: founderName || user.email?.split("@")[0] || "Submitter",
      submitter_email: contactEmail || user.email || "",
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setDone(true);
  };

  if (done) {
    return (
      <AppLayout>
        <div className="mx-auto px-6 py-24 text-center" style={{ maxWidth: 540 }}>
          <div className="mx-auto h-14 w-14 rounded-full bg-success/15 border border-success/25 flex items-center justify-center">
            <Check className="h-7 w-7 text-success" />
          </div>
          <h1 className="font-display text-[28px] text-foreground mt-6">Thanks — got it.</h1>
          <p className="mt-2 text-[14px] text-muted-foreground">
            We&apos;ll review and add it to the directory if it&apos;s a fit.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-foreground text-background rounded-lg px-5 py-2.5 text-[13px] font-semibold"
          >
            Back to directory
          </button>
        </div>
      </AppLayout>
    );
  }

  const inputCls =
    "w-full bg-foreground/[0.05] border border-foreground/10 rounded-lg px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 transition-base";
  const labelCls = "text-[12px] uppercase tracking-[0.1em] text-foreground/40 font-semibold";

  return (
    <AppLayout>
      <section className="px-6 lg:px-10 pt-14 pb-8 mx-auto" style={{ maxWidth: 640 }}>
        <h1 className="font-display text-[40px] text-foreground tracking-[-0.025em]">Submit a tool</h1>
        <p className="mt-3 text-[15px] text-muted-foreground">
          Know an AI tool real estate pros should know about? Tell us. We review every submission.
        </p>
      </section>

      <form
        onSubmit={submit}
        className="px-6 lg:px-10 pb-20 mx-auto space-y-5"
        style={{ maxWidth: 640 }}
      >
        <div className="space-y-2">
          <label className={labelCls}>Tool name *</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>URL *</label>
          <input
            type="url"
            required
            placeholder="https://"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>One-line tagline *</label>
          <input
            required
            maxLength={140}
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className={labelCls}>Category *</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputCls + " cursor-pointer"}
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Pricing</label>
            <select
              value={pricing}
              onChange={(e) => setPricing(e.target.value as any)}
              className={inputCls + " cursor-pointer"}
            >
              <option value="free">Free</option>
              <option value="freemium">Freemium</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Description *</label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className={labelCls}>Your name (optional)</label>
            <input value={founderName} onChange={(e) => setFounderName(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Your email (optional)</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-gradient-accent text-white rounded-lg px-6 py-3 text-[14px] font-semibold shadow-glow-indigo disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit for review"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
};

export default SubmitPage;
