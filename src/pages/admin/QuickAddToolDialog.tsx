import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}

type AffStatus = "none" | "pending" | "approved";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function QuickAddToolDialog({ open, onOpenChange, onSaved }: Props) {
  // step 1 inputs
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [pricing, setPricing] = useState<"free" | "freemium" | "paid">("freemium");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [affStatus, setAffStatus] = useState<AffStatus>("none");
  const [affUrl, setAffUrl] = useState("");

  // categories
  const [categories, setCategories] = useState<Category[]>([]);

  // generated content
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState<null | {
    tagline: string;
    description: string;
    full_description: string;
    tags: string[];
    use_cases: string[];
    key_features: string[];
    logo_url: string | null;
    banner_color: string | null;
    hero_image_url: string | null;
  }>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setUrl("");
    setPricing("freemium");
    setCategoryIds([]);
    setAffStatus("none");
    setAffUrl("");
    setGenerated(null);
    supabase
      .from("categories")
      .select("id,name")
      .order("name")
      .then(({ data }) => setCategories((data as Category[]) ?? []));
  }, [open]);

  const generate = async () => {
    if (!name || !url) {
      toast.error("Name and URL are required");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("quick-add-tool", {
        body: { name, url },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setGenerated(data as any);
      toast.success("Generated — review and save");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!generated) return;
    setSaving(true);
    try {
      const slug = slugify(name);
      const { data: tool, error } = await supabase
        .from("tools")
        .insert({
          name,
          slug,
          website_url: url,
          affiliate_url: affStatus === "approved" ? affUrl || null : null,
          pricing,
          tagline: generated.tagline,
          description: generated.description,
          full_description: generated.full_description,
          tags: generated.tags,
          use_cases: generated.use_cases,
          key_features: generated.key_features,
          logo_url: generated.logo_url,
          banner_color: generated.banner_color || "#1a1f2e",
          hero_image_url: generated.hero_image_url,
          status: "published",
          re_only: true,
        })
        .select("id")
        .single();
      if (error) throw error;

      // categories
      if (categoryIds.length > 0 && tool) {
        await supabase
          .from("tool_categories")
          .insert(
            categoryIds.map((cid) => ({ tool_id: tool.id, category_id: cid })),
          );
      }

      // affiliate program
      if (affStatus !== "none" && tool) {
        await supabase.from("affiliate_programs").insert({
          tool_id: tool.id,
          program_name: name,
          status: affStatus === "approved" ? "approved" : "applied",
          affiliate_url: affStatus === "approved" ? affUrl : "",
        });
      }

      toast.success("Tool added");
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Quick add tool
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Website URL *</Label>
              <Input
                placeholder="https://"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div>
              <Label>Pricing</Label>
              <Select value={pricing} onValueChange={(v) => setPricing(v as any)}>
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
              <Label>Affiliate status</Label>
              <Select value={affStatus} onValueChange={(v) => setAffStatus(v as AffStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not signed up</SelectItem>
                  <SelectItem value="pending">Application pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {affStatus === "approved" && (
              <div className="md:col-span-2">
                <Label>Affiliate URL</Label>
                <Input
                  value={affUrl}
                  onChange={(e) => setAffUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}
          </div>

          <div>
            <Label>Categories</Label>
            <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto rounded-md border p-2">
              {categories.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2 text-sm cursor-pointer rounded px-2 py-1 hover:bg-muted"
                >
                  <Checkbox
                    checked={categoryIds.includes(c.id)}
                    onCheckedChange={() => toggleCategory(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          {!generated && (
            <Button onClick={generate} disabled={generating} className="w-full">
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Scraping & generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate
                </>
              )}
            </Button>
          )}

          {generated && (
            <div className="space-y-3 border-t pt-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Preview — edit anything below
              </div>
              <div>
                <Label>Tagline</Label>
                <Input
                  value={generated.tagline}
                  onChange={(e) =>
                    setGenerated({ ...generated, tagline: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Short description</Label>
                <Textarea
                  rows={2}
                  value={generated.description}
                  onChange={(e) =>
                    setGenerated({ ...generated, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Full description</Label>
                <Textarea
                  rows={4}
                  value={generated.full_description}
                  onChange={(e) =>
                    setGenerated({
                      ...generated,
                      full_description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Tags</Label>
                  <Textarea
                    rows={3}
                    value={generated.tags.join(", ")}
                    onChange={(e) =>
                      setGenerated({
                        ...generated,
                        tags: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Use cases</Label>
                  <Textarea
                    rows={3}
                    value={generated.use_cases.join(", ")}
                    onChange={(e) =>
                      setGenerated({
                        ...generated,
                        use_cases: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Key features</Label>
                  <Textarea
                    rows={3}
                    value={generated.key_features.join(", ")}
                    onChange={(e) =>
                      setGenerated({
                        ...generated,
                        key_features: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Logo URL</Label>
                  <Input
                    value={generated.logo_url ?? ""}
                    onChange={(e) =>
                      setGenerated({ ...generated, logo_url: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Banner color</Label>
                  <Input
                    value={generated.banner_color ?? ""}
                    onChange={(e) =>
                      setGenerated({
                        ...generated,
                        banner_color: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Hero image</Label>
                  <Input
                    value={generated.hero_image_url ?? ""}
                    onChange={(e) =>
                      setGenerated({
                        ...generated,
                        hero_image_url: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generate}
                disabled={generating}
              >
                {generating ? "Re-generating…" : "Re-generate"}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!generated || saving}>
            {saving ? "Saving…" : "Save tool"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
