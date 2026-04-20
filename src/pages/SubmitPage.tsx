import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Sparkles, Check } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  const [categoryId, setCategoryId] = useState<string>("");
  const [founderName, setFounderName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [wantsFeatured, setWantsFeatured] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!authLoading && !user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sign in to submit a tool</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Create a free account so we can keep you updated on your submission status.
          </p>
          <Button asChild variant="accent" className="mt-6">
            <Link to="/auth?mode=signup&next=/submit">Create free account</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!categoryId) return toast.error("Pick a category");
    setSubmitting(true);

    let logoUrl: string | null = null;
    if (logoFile) {
      const ext = logoFile.name.split(".").pop() ?? "png";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("tool-logos").upload(path, logoFile);
      if (uploadErr) {
        setSubmitting(false);
        return toast.error(`Logo upload failed: ${uploadErr.message}`);
      }
      logoUrl = supabase.storage.from("tool-logos").getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from("pending_tools").insert({
      submitted_by: user.id,
      name,
      website_url: websiteUrl,
      tagline,
      description,
      category_id: categoryId,
      logo_url: logoUrl,
      founder_name: founderName,
      contact_email: contactEmail,
      wants_featured: wantsFeatured,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setDone(true);
    toast.success("Submission received");
  };

  if (done) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Submission received</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Our team will review your tool and email you within 3 business days.
          </p>
          {wantsFeatured && (
            <p className="mt-4 max-w-md text-sm text-accent">
              You opted in for a featured slot — we'll send a Stripe checkout link with the review email.
            </p>
          )}
          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline"><Link to="/members">Go to Members Hub</Link></Button>
            <Button asChild variant="accent"><Link to="/">Back to directory</Link></Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <section className="border-b border-border/60 bg-gradient-subtle px-6 py-12 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> Free to submit
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight lg:text-4xl">Submit your AI tool</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Get in front of thousands of agents, brokers and investors. Submissions are reviewed by our editorial team.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 lg:px-10">
        <form onSubmit={submit} className="mx-auto max-w-3xl space-y-8">
          {/* Tool basics */}
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <h2 className="text-lg font-semibold">Tool basics</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tool name *</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Website URL *</Label>
                <Input id="url" type="url" required placeholder="https://" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="tagline">Tagline (one sentence) *</Label>
                <Input id="tagline" required maxLength={140} value={tagline} onChange={(e) => setTagline(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="desc">Full description *</Label>
                <Textarea id="desc" required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <label htmlFor="logo" className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground hover:border-accent/40">
                  <Upload className="h-4 w-4" />
                  <span className="truncate">{logoFile ? logoFile.name : "Upload PNG or SVG"}</span>
                </label>
                <input id="logo" type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
              </div>
            </div>
          </div>

          {/* Founder */}
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <h2 className="text-lg font-semibold">About you</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="founder">Founder / submitter name *</Label>
                <Input id="founder" required value={founderName} onChange={(e) => setFounderName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact email *</Label>
                <Input id="contact" type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Featured upsell */}
          <div className="rounded-2xl border border-accent/30 bg-accent-soft/40 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Feature this tool on the homepage</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get a permanent spot in our Editor's Picks section for $29/month. We'll email you a Stripe checkout link after editorial approval.
                </p>
              </div>
              <Switch checked={wantsFeatured} onCheckedChange={setWantsFeatured} />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="accent" size="lg" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit for review"}
            </Button>
          </div>
        </form>
      </section>
    </AppLayout>
  );
};

export default SubmitPage;
