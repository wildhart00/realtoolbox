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
import { toast } from "sonner";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function ContactMessagesAdmin() {
  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as unknown as ContactMessage[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setRead = async (id: string, is_read: boolean) => {
    const { error } = await supabase
      .from("contact_messages" as any)
      .update({ is_read } as any)
      .eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contact_messages" as any).delete().eq("id", id);
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
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Messages submitted through the /contact form.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-muted-foreground py-12 text-center border rounded-md">
          No messages yet.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const isOpen = open === r.id;
                const preview = r.message.length > 80 ? r.message.slice(0, 80) + "…" : r.message;
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Badge variant={r.is_read ? "outline" : "default"}>
                        {r.is_read ? "Read" : "New"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>
                      <a href={`mailto:${r.email}`} className="text-sm hover:underline">
                        {r.email}
                      </a>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <button
                        onClick={() => setOpen(isOpen ? null : r.id)}
                        className="text-sm text-left hover:text-foreground text-muted-foreground whitespace-pre-wrap"
                      >
                        {isOpen ? r.message : preview}
                      </button>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRead(r.id, !r.is_read)}
                      >
                        {r.is_read ? "Mark unread" : "Mark read"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => del(r.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
