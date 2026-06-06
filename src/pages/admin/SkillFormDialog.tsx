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

export interface SkillRow {
  id?: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  overview: string | null;
  audience: "agent" | "investor" | "both";
  tier: "quick_tool" | "workflow" | "business_system";
  access_level: "free" | "paid";
  price: number;
  file_url: string | null;
  is_published: boolean;
  sort_order: number;
  download_count?: number;
}

const empty: SkillRow = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  overview: "",
  audience: "agent",
  tier: "quick_tool",
  access_level: "free",
  price: 0,
  file_url: null,
  is_published: false,
  sort_order: 0,
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function SkillFormDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Partial<SkillRow> | null;
  onSaved: () => void;
}) {
  const [row, setRow] = useState<SkillRow>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) setRow({ ...empty, ...(initial ?? {}) } as SkillRow);
  }, [open, initial]);

  const update = <K extends keyof SkillRow>(k: K, v: SkillRow[K]) =>
    setRow((r) => ({ ...r, [k]: v }));

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop() || "md";
    const base = row.slug || slugify(row.name) || crypto.randomUUID();
    const path = `${base}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("skill-files")
      .upload(path, file, { upsert: true, contentType: "text/markdown" });
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("skill-files").getPublicUrl(path);
    update("file_url", data.publicUrl);
    setUploading(false);
  };

  const save = async () => {
    if (!row.name) {
      toast.error("Name is required");
      return;
    }
    const payload = {
      ...row,
      slug: row.slug || slugify(row.name),
      price: row.access_level === "paid" ? row.price : 0,
    };
    setSaving(true);
    const { error } = payload.id
      ? await supabase.from("skills" as any).update(payload as any).eq("id", payload.id)
      : await supabase.from("skills" as any).insert(payload as any);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saved");
    onOpenChange(false);
    onSaved();
  };

  const isPaid = row.access_level === "paid";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{row.id ? "Edit skill" : "New skill"}</DialogTitle>
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
            <Input
              value={row.tagline ?? ""}
              onChange={(e) => update("tagline", e.target.value)}
              placeholder="One-line summary shown on the card"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={row.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Audience</Label>
              <Select
                value={row.audience}
                onValueChange={(v) => update("audience", v as SkillRow["audience"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tier</Label>
              <Select
                value={row.tier}
                onValueChange={(v) => update("tier", v as SkillRow["tier"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick_tool">Quick Tool</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="business_system">Business System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Access</Label>
              <Select
                value={row.access_level}
                onValueChange={(v) => {
                  const next = v as SkillRow["access_level"];
                  update("access_level", next);
                  if (next === "free") update("price", 0);
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Price (USD)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              disabled={!isPaid}
              value={row.price}
              onChange={(e) => update("price", parseFloat(e.target.value || "0"))}
            />
            {!isPaid && (
              <div className="text-xs text-muted-foreground mt-1">
                Only relevant for paid skills.
              </div>
            )}
          </div>

          <div>
            <Label>Skill file (.md)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept=".md,text/markdown,text/plain"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
              />
              {row.file_url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => update("file_url", null)}
                >
                  Clear
                </Button>
              )}
            </div>
            {row.file_url && (
              <a
                href={row.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground mt-1 inline-block truncate max-w-full underline"
              >
                {row.file_url}
              </a>
            )}
            {uploading && (
              <div className="text-xs text-muted-foreground mt-1">Uploading…</div>
            )}
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
