import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export interface IntegrationRow {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  category: string;
  logo_url: string | null;
  setup_url: string;
  difficulty: "easy" | "medium" | "advanced";
  sort_order: number;
  is_published: boolean;
}

const empty: IntegrationRow = {
  name: "",
  slug: "",
  tagline: "",
  category: "property-data",
  logo_url: null,
  setup_url: "",
  difficulty: "easy",
  sort_order: 0,
  is_published: false,
};

const CATEGORIES = [
  "property-data",
  "crm",
  "communication",
  "productivity",
  "content-creation",
  "automation",
  "developer",
];

export function IntegrationFormDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Partial<IntegrationRow> | null;
  onSaved: () => void;
}) {
  const [row, setRow] = useState<IntegrationRow>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) setRow({ ...empty, ...(initial ?? {}) } as IntegrationRow);
  }, [open, initial]);

  const update = <K extends keyof IntegrationRow>(k: K, v: IntegrationRow[K]) =>
    setRow((r) => ({ ...r, [k]: v }));

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${row.slug || slugify(row.name) || crypto.randomUUID()}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("integration-logos")
      .upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("integration-logos").getPublicUrl(path);
    update("logo_url", data.publicUrl);
    setUploading(false);
  };

  const save = async () => {
    if (!row.name || !row.tagline || !row.setup_url) {
      toast.error("Name, tagline and setup URL are required");
      return;
    }
    const payload = { ...row, slug: row.slug || slugify(row.name) };
    setSaving(true);
    const { error } = payload.id
      ? await supabase.from("integrations" as any).update(payload as any).eq("id", payload.id)
      : await supabase.from("integrations" as any).insert(payload as any);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saved");
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{row.id ? "Edit integration" : "New integration"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Name</Label>
              <Input value={row.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={row.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder={slugify(row.name)}
              />
            </div>
          </div>

          <div>
            <Label>Tagline</Label>
            <Textarea
              value={row.tagline}
              onChange={(e) => update("tagline", e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={row.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select
                value={row.difficulty}
                onValueChange={(v) => update("difficulty", v as IntegrationRow["difficulty"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">easy</SelectItem>
                  <SelectItem value="medium">medium</SelectItem>
                  <SelectItem value="advanced">advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Setup URL</Label>
            <Input
              value={row.setup_url}
              onChange={(e) => update("setup_url", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              {row.logo_url && (
                <img
                  src={row.logo_url}
                  alt=""
                  className="h-12 w-12 rounded-lg object-cover bg-foreground/[0.04]"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleLogoUpload(f);
                }}
              />
              {row.logo_url && (
                <Button type="button" variant="ghost" size="sm" onClick={() => update("logo_url", null)}>
                  Clear
                </Button>
              )}
            </div>
            {uploading && <div className="text-xs text-muted-foreground mt-1">Uploading…</div>}
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <Label>Sort order</Label>
              <Input
                type="number"
                value={row.sort_order}
                onChange={(e) => update("sort_order", parseInt(e.target.value || "0", 10))}
              />
            </div>
            <div className="flex items-center gap-3 pb-2">
              <Switch
                checked={row.is_published}
                onCheckedChange={(v) => update("is_published", v)}
              />
              <Label>Published</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving || uploading}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
