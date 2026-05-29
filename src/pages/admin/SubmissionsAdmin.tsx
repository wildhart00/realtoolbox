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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ToolFormDialog, type ToolRow } from "./ToolFormDialog";

interface Submission {
  id: string;
  name: string;
  website_url: string;
  tagline: string;
  description: string;
  logo_url: string | null;
  submitter_name: string;
  submitter_email: string;
  wants_featured: boolean;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
}

export default function SubmissionsAdmin() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<Submission | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("submissions").select("*").order("created_at", { ascending: false });
    if (status !== "all") q = q.eq("status", status);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    setSubs((data as Submission[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [status]);

  const setStatusFor = async (id: string, s: Submission["status"]) => {
    const { error } = await supabase.from("submissions").update({ status: s }).eq("id", id);
    if (error) toast.error(error.message);
    else toast.success(`Marked ${s}`);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete submission?")) return;
    const { error } = await supabase.from("submissions").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Deleted");
    load();
  };

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const buildInitial = (s: Submission): Partial<ToolRow> => ({
    name: s.name,
    slug: slugify(s.name),
    tagline: s.tagline,
    description: s.description,
    website_url: s.website_url,
    logo_url: s.logo_url ?? undefined,
    is_featured: s.wants_featured,
  });

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
      </div>

      <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tool</TableHead>
              <TableHead>Submitter</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : subs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                  None.
                </TableCell>
              </TableRow>
            ) : (
              subs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      <a href={s.website_url} target="_blank" rel="noreferrer" className="hover:underline">
                        {s.website_url}
                      </a>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 max-w-md truncate">
                      {s.tagline}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{s.submitter_name}</div>
                    <div className="text-xs text-muted-foreground">{s.submitter_email}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === "pending" ? "default" : "secondary"}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {s.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => setApproving(s)}>
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatusFor(s.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => del(s.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ToolFormDialog
        open={!!approving}
        onOpenChange={(v) => !v && setApproving(null)}
        initial={approving ? buildInitial(approving) : null}
        approvingSubmissionId={approving?.id}
        onSaved={load}
      />
    </div>
  );
}
