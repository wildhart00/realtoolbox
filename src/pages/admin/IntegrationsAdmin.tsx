import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { IntegrationFormDialog, type IntegrationRow } from "./IntegrationFormDialog";

export default function IntegrationsAdmin() {
  const [rows, setRows] = useState<IntegrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IntegrationRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("integrations" as any)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data as unknown as IntegrationRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublished = async (r: IntegrationRow) => {
    const { error } = await supabase
      .from("integrations" as any)
      .update({ is_published: !r.is_published } as any)
      .eq("id", r.id!);
    if (error) toast.error(error.message);
    else load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete integration?")) return;
    const { error } = await supabase.from("integrations" as any).delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage entries shown on /integrations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
            New integration
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-muted-foreground py-12 text-center border rounded-md">
          No integrations yet.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs text-muted-foreground">{r.sort_order}</TableCell>
                  <TableCell className="font-medium">
                    <div>{r.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">{r.tagline}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{r.category}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{r.difficulty}</Badge></TableCell>
                  <TableCell>
                    <Switch checked={r.is_published} onCheckedChange={() => togglePublished(r)} />
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => del(r.id!)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <IntegrationFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSaved={load}
      />
    </div>
  );
}
