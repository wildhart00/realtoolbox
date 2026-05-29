import { useEffect, useState } from "react";
import { Trash2, Star } from "lucide-react";
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
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  body: string | null;
  created_at: string;
  user_id: string;
  tool_id: string;
  tool?: { name: string; slug: string } | null;
  profile?: { display_name: string | null } | null;
}

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as Review[];
    // Fetch tool names and profiles in batch
    const toolIds = [...new Set(rows.map((r) => r.tool_id))];
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const [toolsRes, profRes] = await Promise.all([
      toolIds.length
        ? supabase.from("tools").select("id,name,slug").in("id", toolIds)
        : Promise.resolve({ data: [] as { id: string; name: string; slug: string }[] }),
      userIds.length
        ? supabase.from("profiles").select("user_id,display_name").in("user_id", userIds)
        : Promise.resolve({ data: [] as { user_id: string; display_name: string | null }[] }),
    ]);
    const toolMap = new Map((toolsRes.data ?? []).map((t) => [t.id, t]));
    const profMap = new Map((profRes.data ?? []).map((p) => [p.user_id, p]));
    setReviews(
      rows.map((r) => ({
        ...r,
        tool: toolMap.get(r.tool_id) ?? null,
        profile: profMap.get(r.user_id) ?? null,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };

  return (
    <div className="space-y-4 max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tool</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Body</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                  No reviews.
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.tool ? (
                      <a
                        href={`/tools/${r.tool.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:underline"
                      >
                        {r.tool.name}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{r.profile?.display_name ?? "—"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      {r.rating}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="text-sm line-clamp-2">{r.body || "—"}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => del(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
