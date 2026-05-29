import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export interface ToolRow {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  full_description?: string | null;
  website_url: string;
  affiliate_url?: string | null;
  pricing: string;
  pricing_details?: string | null;
  tags: string[];
  logo_url?: string | null;
  hero_image_url?: string | null;
  banner_color?: string | null;
  is_featured: boolean;
  is_editors_pick: boolean;
  is_verified: boolean;
  re_only: boolean;
  featured_order?: number | null;
  status?: string | null;
  founder_name?: string | null;
  founder_bio?: string | null;
  founder_avatar_url?: string | null;
  use_cases: string[];
  key_features: string[];
}

const empty: ToolRow = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  website_url: "",
  pricing: "freemium",
  tags: [],
  is_featured: false,
  is_editors_pick: false,
  is_verified: false,
  re_only: true,
  status: "published",
  use_cases: [],
  key_features: [],
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<ToolRow> | null;
  onSaved: () => void;
  /** If set, marks the submission as approved after saving */
  approvingSubmissionId?: string;
}

function csv(arr: string[] | undefined) {
  return (arr ?? []).join(", ");
}
function parseCsv(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

export function ToolFormDialog({ open, onOpenChange, initial, onSaved, approvingSubmissionId }: Props) {
  const [form, setForm] = useState<ToolRow>(empty);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  useEffect(() => {
    if (open) {
      setForm({ ...empty, ...(initial ?? {}) } as ToolRow);
    }
  }, [open, initial]);

  const update = <K extends keyof ToolRow>(key: K, value: ToolRow[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.name || !form.slug || !form.website_url) {
      toast.error("Name, slug, and website URL are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        tagline: form.tagline,
        description: form.description,
        full_description: form.full_description || null,
        website_url: form.website_url,
        affiliate_url: form.affiliate_url || null,
        pricing: form.pricing as "free" | "freemium" | "paid",
        pricing_details: form.pricing_details || null,
        tags: form.tags,
        logo_url: form.logo_url || null,
        hero_image_url: form.hero_image_url || null,
        banner_color: form.banner_color || "#1a1f2e",
        is_featured: form.is_featured,
        is_editors_pick: form.is_editors_pick,
        is_verified: form.is_verified,
        re_only: form.re_only,
        featured_order: form.featured_order ?? 0,
        status: form.status || "published",
        founder_name: form.founder_name || null,
        founder_bio: form.founder_bio || null,
        founder_avatar_url: form.founder_avatar_url || null,
        use_cases: form.use_cases,
        key_features: form.key_features,
      };

      if (isEdit && form.id) {
        const { error } = await supabase.from("tools").update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("Tool updated");
      } else {
        const { error } = await supabase.from("tools").insert(payload);
        if (error) throw error;
        if (approvingSubmissionId) {
          await supabase
            .from("submissions")
            .update({ status: "approved" })
            .eq("id", approvingSubmissionId);
        }
        toast.success("Tool created");
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit tool" : "Add tool"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Tagline</Label>
            <Input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Short description</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Full description</Label>
            <Textarea
              rows={4}
              value={form.full_description ?? ""}
              onChange={(e) => update("full_description", e.target.value)}
            />
          </div>
          <div>
            <Label>Website URL</Label>
            <Input value={form.website_url} onChange={(e) => update("website_url", e.target.value)} />
          </div>
          <div>
            <Label>Affiliate URL</Label>
            <Input
              value={form.affiliate_url ?? ""}
              onChange={(e) => update("affiliate_url", e.target.value)}
            />
          </div>
          <div>
            <Label>Pricing</Label>
            <Select value={form.pricing} onValueChange={(v) => update("pricing", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">free</SelectItem>
                <SelectItem value="freemium">freemium</SelectItem>
                <SelectItem value="paid">paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Pricing details</Label>
            <Input
              value={form.pricing_details ?? ""}
              onChange={(e) => update("pricing_details", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Tags (comma separated)</Label>
            <Input value={csv(form.tags)} onChange={(e) => update("tags", parseCsv(e.target.value))} />
          </div>
          <div className="md:col-span-2">
            <Label>Use cases (comma separated)</Label>
            <Input
              value={csv(form.use_cases)}
              onChange={(e) => update("use_cases", parseCsv(e.target.value))}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Key features (comma separated)</Label>
            <Input
              value={csv(form.key_features)}
              onChange={(e) => update("key_features", parseCsv(e.target.value))}
            />
          </div>
          <div>
            <Label>Logo URL</Label>
            <Input value={form.logo_url ?? ""} onChange={(e) => update("logo_url", e.target.value)} />
          </div>
          <div>
            <Label>Hero image URL</Label>
            <Input
              value={form.hero_image_url ?? ""}
              onChange={(e) => update("hero_image_url", e.target.value)}
            />
          </div>
          <div>
            <Label>Banner color</Label>
            <Input
              value={form.banner_color ?? ""}
              onChange={(e) => update("banner_color", e.target.value)}
            />
          </div>
          <div>
            <Label>Featured order</Label>
            <Input
              type="number"
              value={form.featured_order ?? 0}
              onChange={(e) => update("featured_order", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Founder name</Label>
            <Input
              value={form.founder_name ?? ""}
              onChange={(e) => update("founder_name", e.target.value)}
            />
          </div>
          <div>
            <Label>Founder avatar URL</Label>
            <Input
              value={form.founder_avatar_url ?? ""}
              onChange={(e) => update("founder_avatar_url", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Founder bio</Label>
            <Textarea
              rows={2}
              value={form.founder_bio ?? ""}
              onChange={(e) => update("founder_bio", e.target.value)}
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm">Featured</span>
              <Switch
                checked={form.is_featured}
                onCheckedChange={(v) => update("is_featured", v)}
              />
            </label>
            <label className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm">Editor's pick</span>
              <Switch
                checked={form.is_editors_pick}
                onCheckedChange={(v) => update("is_editors_pick", v)}
              />
            </label>
            <label className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm">Verified</span>
              <Switch
                checked={form.is_verified}
                onCheckedChange={(v) => update("is_verified", v)}
              />
            </label>
            <label className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm">RE-only</span>
              <Switch checked={form.re_only} onCheckedChange={(v) => update("re_only", v)} />
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create tool"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
