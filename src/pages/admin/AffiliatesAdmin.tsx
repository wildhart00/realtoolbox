import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Copy, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type Status = "applied" | "pending" | "approved" | "declined" | "paused";

interface Program {
  id?: string;
  tool_id: string | null;
  program_name: string;
  network: string;
  affiliate_url: string;
  status: Status;
  commission_rate: string;
  signup_date: string | null;
  approval_date: string | null;
  notes: string | null;
}

interface Earning {
  id?: string;
  program_id: string;
  month: string; // YYYY-MM-01
  reported_earnings: number;
  payment_received: number | null;
  payment_date: string | null;
  notes: string | null;
}

interface Tool {
  id: string;
  name: string;
  slug: string;
}

const emptyProgram: Program = {
  tool_id: null,
  program_name: "",
  network: "",
  affiliate_url: "",
  status: "applied",
  commission_rate: "",
  signup_date: null,
  approval_date: null,
  notes: null,
};

const statusColors: Record<Status, string> = {
  approved: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  applied: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  declined: "bg-destructive/15 text-destructive border-destructive/30",
  paused: "bg-muted text-muted-foreground border-border",
};

function fmtMoney(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function AffiliatesAdmin() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [clickWindow, setClickWindow] = useState<"30" | "all">("30");
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Program | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [historyFor, setHistoryFor] = useState<Program | null>(null);

  const load = async () => {
    setLoading(true);
    const [progsRes, earnRes, toolsRes] = await Promise.all([
      supabase.from("affiliate_programs").select("*").order("program_name"),
      supabase.from("affiliate_earnings").select("*").order("month", { ascending: false }),
      supabase.from("tools").select("id,name,slug").order("name"),
    ]);
    if (progsRes.error) toast.error(progsRes.error.message);
    setPrograms((progsRes.data as Program[]) ?? []);
    setEarnings((earnRes.data as Earning[]) ?? []);
    setTools((toolsRes.data as Tool[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Load click counts whenever window or tools change
  useEffect(() => {
    (async () => {
      const toolIds = programs.map((p) => p.tool_id).filter((x): x is string => !!x);
      if (toolIds.length === 0) {
        setClickCounts({});
        return;
      }
      let query = supabase
        .from("click_events")
        .select("tool_id")
        .in("tool_id", toolIds);
      if (clickWindow === "30") {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("created_at", since);
      }
      const { data, error } = await query.limit(50000);
      if (error) return;
      const counts: Record<string, number> = {};
      for (const row of (data ?? []) as { tool_id: string }[]) {
        counts[row.tool_id] = (counts[row.tool_id] ?? 0) + 1;
      }
      setClickCounts(counts);
    })();
  }, [programs, clickWindow]);

  const earningsByProgram = useMemo(() => {
    const m = new Map<string, Earning[]>();
    for (const e of earnings) {
      const arr = m.get(e.program_id) ?? [];
      arr.push(e);
      m.set(e.program_id, arr);
    }
    return m;
  }, [earnings]);

  const toolMap = useMemo(() => new Map(tools.map((t) => [t.id, t])), [tools]);

  // Summary stats
  const summary = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const ytdStart = `${now.getFullYear()}-01-01`;
    const clicksThisMonth = Object.values(clickCounts).reduce((a, b) => a + b, 0);
    let reportedThisMonth = 0;
    let paymentsYtd = 0;
    for (const e of earnings) {
      if (e.month === thisMonth) reportedThisMonth += Number(e.reported_earnings ?? 0);
      if (e.payment_date && e.payment_date >= ytdStart && e.payment_received) {
        paymentsYtd += Number(e.payment_received);
      }
    }
    const byStatus: Record<Status, number> = {
      applied: 0, pending: 0, approved: 0, declined: 0, paused: 0,
    };
    for (const p of programs) byStatus[p.status]++;
    return { clicksThisMonth, reportedThisMonth, paymentsYtd, byStatus };
  }, [programs, earnings, clickCounts]);

  const savePogram = async () => {
    if (!editing) return;
    if (!editing.program_name) {
      toast.error("Program name required");
      return;
    }
    const payload = {
      tool_id: editing.tool_id,
      program_name: editing.program_name,
      network: editing.network,
      affiliate_url: editing.affiliate_url,
      status: editing.status,
      commission_rate: editing.commission_rate,
      signup_date: editing.signup_date,
      approval_date: editing.approval_date,
      notes: editing.notes,
    };
    const { error } = editing.id
      ? await supabase.from("affiliate_programs").update(payload).eq("id", editing.id)
      : await supabase.from("affiliate_programs").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Updated" : "Created");
    setDialogOpen(false);
    load();
  };

  const delProgram = async (id: string) => {
    if (!confirm("Delete this program and all its monthly earnings?")) return;
    const { error } = await supabase.from("affiliate_programs").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };

  const copy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Affiliates</h1>
        <Button
          onClick={() => {
            setEditing({ ...emptyProgram });
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add program
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clicks ({clickWindow === "30" ? "30d" : "all time"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.clicksThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reported earnings (this month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtMoney(summary.reportedThisMonth)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payments received YTD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtMoney(summary.paymentsYtd)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {summary.byStatus.approved} approved · {summary.byStatus.pending + summary.byStatus.applied} pending · {summary.byStatus.declined} declined
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Tabs value={clickWindow} onValueChange={(v) => setClickWindow(v as "30" | "all")}>
          <TabsList>
            <TabsTrigger value="30">Clicks: last 30d</TabsTrigger>
            <TabsTrigger value="all">All time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Programs table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Program</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Last earnings</TableHead>
              <TableHead className="text-right">Last payment</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-sm text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : programs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-sm text-muted-foreground">
                  No programs yet. Add your first one.
                </TableCell>
              </TableRow>
            ) : (
              programs.map((p) => {
                const hist = earningsByProgram.get(p.id!) ?? [];
                const latest = hist[0];
                const lastPayment = hist.find((h) => h.payment_received != null && h.payment_date);
                const tool = p.tool_id ? toolMap.get(p.tool_id) : null;
                const clicks = p.tool_id ? clickCounts[p.tool_id] ?? 0 : 0;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.program_name}</div>
                      {tool && (
                        <div className="text-xs text-muted-foreground">→ {tool.name}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.network ? <Badge variant="outline">{p.network}</Badge> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[p.status]}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{p.commission_rate || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.tool_id ? clicks : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {latest ? (
                        <div>
                          <div>{fmtMoney(Number(latest.reported_earnings))}</div>
                          <div className="text-xs text-muted-foreground">
                            {latest.month.slice(0, 7)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {lastPayment ? (
                        <div>
                          <div>{fmtMoney(Number(lastPayment.payment_received))}</div>
                          <div className="text-xs text-muted-foreground">
                            {lastPayment.payment_date}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copy(p.affiliate_url)}
                          disabled={!p.affiliate_url}
                          title="Copy link"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          asChild={!!p.affiliate_url}
                          disabled={!p.affiliate_url}
                          title="Open link"
                        >
                          {p.affiliate_url ? (
                            <a href={p.affiliate_url} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <ExternalLink className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setHistoryFor(p)}
                        title="Monthly history"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(p);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => delProgram(p.id!)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Program edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit program" : "Add program"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Label>Program name</Label>
                <Input
                  value={editing.program_name}
                  onChange={(e) => setEditing({ ...editing, program_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Network</Label>
                <Input
                  placeholder="Impact, PartnerStack, Own, etc."
                  value={editing.network}
                  onChange={(e) => setEditing({ ...editing, network: e.target.value })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editing.status}
                  onValueChange={(v) => setEditing({ ...editing, status: v as Status })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Linked tool (for click tracking)</Label>
                <Select
                  value={editing.tool_id ?? "none"}
                  onValueChange={(v) =>
                    setEditing({ ...editing, tool_id: v === "none" ? null : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {tools.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Affiliate URL</Label>
                <Input
                  value={editing.affiliate_url}
                  onChange={(e) => setEditing({ ...editing, affiliate_url: e.target.value })}
                />
              </div>
              <div>
                <Label>Commission rate</Label>
                <Input
                  placeholder="30% recurring, $50/sale"
                  value={editing.commission_rate}
                  onChange={(e) => setEditing({ ...editing, commission_rate: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Signup date</Label>
                  <Input
                    type="date"
                    value={editing.signup_date ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, signup_date: e.target.value || null })
                    }
                  />
                </div>
                <div>
                  <Label>Approval date</Label>
                  <Input
                    type="date"
                    value={editing.approval_date ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, approval_date: e.target.value || null })
                    }
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={editing.notes ?? ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value || null })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePogram}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History drawer */}
      <HistorySheet
        program={historyFor}
        earnings={historyFor ? earningsByProgram.get(historyFor.id!) ?? [] : []}
        onClose={() => setHistoryFor(null)}
        onChanged={load}
      />
    </div>
  );
}

function HistorySheet({
  program,
  earnings,
  onClose,
  onChanged,
}: {
  program: Program | null;
  earnings: Earning[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [draft, setDraft] = useState<{
    month: string;
    reported_earnings: string;
    payment_received: string;
    payment_date: string;
    notes: string;
  }>({
    month: new Date().toISOString().slice(0, 7) + "-01",
    reported_earnings: "0",
    payment_received: "",
    payment_date: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  if (!program) return null;

  const add = async () => {
    if (!draft.month) {
      toast.error("Month required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("affiliate_earnings").upsert(
      {
        program_id: program.id!,
        month: draft.month,
        reported_earnings: Number(draft.reported_earnings || 0),
        payment_received: draft.payment_received ? Number(draft.payment_received) : null,
        payment_date: draft.payment_date || null,
        notes: draft.notes || null,
      },
      { onConflict: "program_id,month" },
    );
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setDraft({
      month: new Date().toISOString().slice(0, 7) + "-01",
      reported_earnings: "0",
      payment_received: "",
      payment_date: "",
      notes: "",
    });
    onChanged();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from("affiliate_earnings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      onChanged();
    }
  };

  return (
    <Sheet open={!!program} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{program.program_name} — monthly history</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
            <div className="text-sm font-medium">Add / update month</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Month</Label>
                <Input
                  type="month"
                  value={draft.month.slice(0, 7)}
                  onChange={(e) => setDraft({ ...draft, month: e.target.value + "-01" })}
                />
              </div>
              <div>
                <Label className="text-xs">Reported earnings</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.reported_earnings}
                  onChange={(e) => setDraft({ ...draft, reported_earnings: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Payment received</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.payment_received}
                  onChange={(e) => setDraft({ ...draft, payment_received: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Payment date</Label>
                <Input
                  type="date"
                  value={draft.payment_date}
                  onChange={(e) => setDraft({ ...draft, payment_date: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Notes</Label>
                <Input
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={add} disabled={saving} size="sm">
              {saving ? "Saving..." : "Save month"}
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                      No entries yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  earnings.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-sm">{e.month.slice(0, 7)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtMoney(Number(e.reported_earnings))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {e.payment_received != null ? (
                          <div>
                            <div>{fmtMoney(Number(e.payment_received))}</div>
                            {e.payment_date && (
                              <div className="text-xs text-muted-foreground">
                                {e.payment_date}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => del(e.id!)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
