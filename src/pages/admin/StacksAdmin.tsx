import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { StackEntryDialog, type StackEntryRow } from "./StackEntryDialog";
import { STACK_GROUPS, type StackKind } from "@/pages/StackPage";

interface StackRow {
  id: string;
  kind: StackKind;
  title: string;
  subtitle: string | null;
  intro_md: string | null;
}

interface EntryWithTool extends StackEntryRow {
  id: string;
  tool: { id: string; name: string; slug: string } | null;
}

function StackTab({ kind }: { kind: StackKind }) {
  const [stack, setStack] = useState<StackRow | null>(null);
  const [entries, setEntries] = useState<EntryWithTool[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<StackEntryRow> | null>(null);
  const [savingHeader, setSavingHeader] = useState(false);

  const load = useCallback(async () => {
    const [{ data: s }, { data: e }] = await Promise.all([
      supabase.from("stacks" as any).select("*").eq("kind", kind).maybeSingle(),
      supabase
        .from("stack_entries" as any)
        .select("id, kind, tool_id, group_name, sort_order, why_note, tool:tools(id, name, slug)")
        .eq("kind", kind)
        .order("group_name")
        .order("sort_order"),
    ]);
    setStack(s as any);
    setEntries((e ?? []) as any);
  }, [kind]);

  useEffect(() => {
    load();
  }, [load]);

  const saveHeader = async () => {
    if (!stack) return;
    setSavingHeader(true);
    const { error } = await supabase
      .from("stacks" as any)
      .update({
        title: stack.title,
        subtitle: stack.subtitle,
        intro_md: stack.intro_md,
      } as any)
      .eq("id", stack.id);
    setSavingHeader(false);
    if (error) return toast.error(error.message);
    toast.success("Header saved");
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this tool from the stack?")) return;
    const { error } = await supabase.from("stack_entries" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const swapOrder = async (a: EntryWithTool, b: EntryWithTool) => {
    // Swap sort_order values
    const { error: e1 } = await supabase
      .from("stack_entries" as any)
      .update({ sort_order: b.sort_order } as any)
      .eq("id", a.id);
    const { error: e2 } = await supabase
      .from("stack_entries" as any)
      .update({ sort_order: a.sort_order } as any)
      .eq("id", b.id);
    if (e1 || e2) return toast.error((e1 || e2)?.message ?? "Reorder failed");
    load();
  };

  const groups = STACK_GROUPS[kind];
  const byGroup = groups.map((g) => ({
    group: g,
    items: entries.filter((e) => e.group_name === g),
  }));
  const unknownGroups = Array.from(
    new Set(entries.filter((e) => !groups.includes(e.group_name)).map((e) => e.group_name)),
  );

  return (
    <div className="space-y-8">
      {stack && (
        <section className="surface-card rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Header</h2>
          <div>
            <Label>Title</Label>
            <Input
              value={stack.title}
              onChange={(e) => setStack({ ...stack, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input
              value={stack.subtitle ?? ""}
              onChange={(e) => setStack({ ...stack, subtitle: e.target.value })}
            />
          </div>
          <div>
            <Label>Intro paragraph (plain text or simple markdown)</Label>
            <Textarea
              rows={5}
              value={stack.intro_md ?? ""}
              onChange={(e) => setStack({ ...stack, intro_md: e.target.value })}
              placeholder="Operator-voice intro. Blank lines separate paragraphs."
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveHeader} disabled={savingHeader}>
              {savingHeader ? "Saving…" : "Save header"}
            </Button>
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-foreground">Tools in this stack</h2>
            <p className="text-sm text-muted-foreground">
              Empty groups are hidden on the public page.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add tool
          </Button>
        </div>

        <div className="space-y-6">
          {byGroup.map(({ group, items }) => (
            <div key={group} className="surface-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">{group}</h3>
                <span className="text-xs text-muted-foreground">
                  {items.length} {items.length === 1 ? "tool" : "tools"}
                </span>
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tools yet.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((e, idx) => (
                    <div
                      key={e.id}
                      className="flex items-start gap-3 rounded-lg border border-foreground/[0.06] px-3 py-2.5"
                    >
                      <div className="flex flex-col gap-1 pt-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => swapOrder(e, items[idx - 1])}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === items.length - 1}
                          onClick={() => swapOrder(e, items[idx + 1])}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm">
                          {e.tool?.name ?? "(missing tool)"}
                        </div>
                        {e.why_note && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {e.why_note}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditing(e);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(e.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {unknownGroups.map((g) => (
            <div key={g} className="surface-card rounded-xl p-4 border border-warning/30">
              <h3 className="font-semibold text-foreground mb-2">
                {g}{" "}
                <span className="text-xs font-normal text-warning">
                  (not in current group list — entries hidden on public page)
                </span>
              </h3>
              <div className="space-y-2">
                {entries
                  .filter((e) => e.group_name === g)
                  .map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 rounded-lg border border-foreground/[0.06] px-3 py-2.5"
                    >
                      <div className="flex-1 text-sm">{e.tool?.name ?? "(missing tool)"}</div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(e);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(e.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <StackEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        kind={kind}
        initial={editing}
        onSaved={load}
      />
    </div>
  );
}

export default function StacksAdmin() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Stacks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Curated tool recommendations for the Investor and Agent stack pages.
        </p>
      </div>
      <Tabs defaultValue="investor">
        <TabsList>
          <TabsTrigger value="investor">Investor Stack</TabsTrigger>
          <TabsTrigger value="agent">Agent Stack</TabsTrigger>
        </TabsList>
        <TabsContent value="investor" className="mt-6">
          <StackTab kind="investor" />
        </TabsContent>
        <TabsContent value="agent" className="mt-6">
          <StackTab kind="agent" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
