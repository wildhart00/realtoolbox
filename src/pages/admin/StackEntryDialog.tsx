import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { StackKind } from "@/pages/StackPage";
import { STACK_GROUPS } from "@/pages/StackPage";

export interface StackEntryRow {
  id?: string;
  kind: StackKind;
  tool_id: string;
  group_name: string;
  sort_order: number;
  why_note: string | null;
}

interface ToolOption {
  id: string;
  name: string;
  slug: string;
}

export function StackEntryDialog({
  open,
  onOpenChange,
  kind,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  kind: StackKind;
  initial?: Partial<StackEntryRow> | null;
  onSaved: () => void;
}) {
  const groups = STACK_GROUPS[kind];
  const [row, setRow] = useState<StackEntryRow>({
    kind,
    tool_id: "",
    group_name: groups[0],
    sort_order: 0,
    why_note: "",
  });
  const [tools, setTools] = useState<ToolOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [toolSearch, setToolSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setRow({
      kind,
      tool_id: "",
      group_name: groups[0],
      sort_order: 0,
      why_note: "",
      ...(initial ?? {}),
    } as StackEntryRow);
    setToolSearch("");
    supabase
      .from("tools")
      .select("id, name, slug")
      .order("name")
      .then(({ data }) => setTools((data ?? []) as ToolOption[]));
  }, [open, kind, initial, groups]);

  const filteredTools = tools.filter((t) =>
    t.name.toLowerCase().includes(toolSearch.toLowerCase()),
  );

  const save = async () => {
    if (!row.tool_id) {
      toast.error("Pick a tool");
      return;
    }
    if (!row.group_name) {
      toast.error("Pick a group");
      return;
    }
    setSaving(true);
    const payload = {
      kind: row.kind,
      tool_id: row.tool_id,
      group_name: row.group_name,
      sort_order: row.sort_order ?? 0,
      why_note: row.why_note?.trim() || null,
    };
    const { error } = row.id
      ? await supabase.from("stack_entries" as any).update(payload as any).eq("id", row.id)
      : await supabase.from("stack_entries" as any).insert(payload as any);
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{row.id ? "Edit entry" : "Add tool to stack"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Tool</Label>
            {!row.id && (
              <Input
                placeholder="Search tools…"
                value={toolSearch}
                onChange={(e) => setToolSearch(e.target.value)}
                className="mb-2"
              />
            )}
            <Select
              value={row.tool_id}
              onValueChange={(v) => setRow((r) => ({ ...r, tool_id: v }))}
              disabled={!!row.id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick a tool" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {filteredTools.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Function group</Label>
            <Select
              value={row.group_name}
              onValueChange={(v) => setRow((r) => ({ ...r, group_name: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Why it's in the stack (editorial note)</Label>
            <Textarea
              value={row.why_note ?? ""}
              onChange={(e) => setRow((r) => ({ ...r, why_note: e.target.value }))}
              rows={5}
              placeholder="Why this earns its seat in the stack. Where it beats the alternatives."
            />
          </div>

          <div>
            <Label>Sort order (within group)</Label>
            <Input
              type="number"
              value={row.sort_order}
              onChange={(e) =>
                setRow((r) => ({ ...r, sort_order: parseInt(e.target.value || "0", 10) }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
