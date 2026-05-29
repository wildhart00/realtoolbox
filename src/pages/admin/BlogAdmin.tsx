import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Post {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  tags: string[];
  reading_minutes: number;
  is_published: boolean;
  cover_image_url: string | null;
  author_name: string;
  published_at?: string;
}

const empty: Post = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  tags: [],
  reading_minutes: 5,
  is_published: true,
  cover_image_url: null,
  author_name: "RealToolbox Team",
};

export default function BlogAdmin() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });
    if (error) toast.error(error.message);
    setPosts((data as Post[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title || !editing.slug) {
      toast.error("Title and slug required");
      return;
    }
    setSaving(true);
    const payload = {
      title: editing.title,
      slug: editing.slug,
      excerpt: editing.excerpt,
      body: editing.body,
      tags: editing.tags,
      reading_minutes: editing.reading_minutes,
      is_published: editing.is_published,
      cover_image_url: editing.cover_image_url,
      author_name: editing.author_name,
    };
    const { error } = editing.id
      ? await supabase.from("blog_posts").update(payload).eq("id", editing.id)
      : await supabase.from("blog_posts").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Updated" : "Created");
    setOpen(false);
    load();
  };

  const togglePublish = async (p: Post) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ is_published: !p.is_published })
      .eq("id", p.id!);
    if (error) toast.error(error.message);
    else load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
        <Button
          onClick={() => {
            setEditing({ ...empty });
            setOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> New post
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Date</TableHead>
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
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                  No posts.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="font-mono text-xs">{p.slug}</TableCell>
                  <TableCell>
                    <Badge
                      variant={p.is_published ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => togglePublish(p)}
                    >
                      {p.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.published_at && new Date(p.published_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditing(p);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => del(p.id!)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit post" : "New post"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                />
              </div>
              <div>
                <Label>Excerpt</Label>
                <Textarea
                  rows={2}
                  value={editing.excerpt}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                />
              </div>
              <div>
                <Label>Body (markdown)</Label>
                <Textarea
                  rows={12}
                  value={editing.body}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tags (comma)</Label>
                  <Input
                    value={editing.tags.join(", ")}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Reading minutes</Label>
                  <Input
                    type="number"
                    value={editing.reading_minutes}
                    onChange={(e) =>
                      setEditing({ ...editing, reading_minutes: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Cover image URL</Label>
                  <Input
                    value={editing.cover_image_url ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, cover_image_url: e.target.value || null })
                    }
                  />
                </div>
                <div>
                  <Label>Author</Label>
                  <Input
                    value={editing.author_name}
                    onChange={(e) => setEditing({ ...editing, author_name: e.target.value })}
                  />
                </div>
              </div>
              <label className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm">Published</span>
                <Switch
                  checked={editing.is_published}
                  onCheckedChange={(v) => setEditing({ ...editing, is_published: v })}
                />
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
