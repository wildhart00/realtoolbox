import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Category {
  id?: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

const empty: Category = { slug: "", name: "", description: "", icon: "", sort_order: 0 };

export default function CategoriesAdmin() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState<Category>({ ...empty });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order")
      .order("name");
    if (error) toast.error(error.message);
    setCats((data as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveRow = async (c: Category) => {
    const { error } = await supabase
      .from("categories")
      .update({
        slug: c.slug,
        name: c.name,
        description: c.description,
        icon: c.icon,
        sort_order: c.sort_order,
      })
      .eq("id", c.id!);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  const del = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };

  const add = async () => {
    if (!newCat.slug || !newCat.name) {
      toast.error("Slug and name required");
      return;
    }
    const { error } = await supabase.from("categories").insert({
      slug: newCat.slug,
      name: newCat.name,
      description: newCat.description,
      icon: newCat.icon,
      sort_order: newCat.sort_order,
    });
    if (error) return toast.error(error.message);
    toast.success("Added");
    setNewCat({ ...empty });
    load();
  };

  const updateLocal = (i: number, key: keyof Category, value: string | number | null) => {
    setCats((prev) => prev.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)));
  };

  return (
    <div className="space-y-4 max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight">Categories</h1>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Slug</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead className="w-20">Order</TableHead>
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
            ) : (
              cats.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Input value={c.slug} onChange={(e) => updateLocal(i, "slug", e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Input value={c.name} onChange={(e) => updateLocal(i, "name", e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={c.description ?? ""}
                      onChange={(e) => updateLocal(i, "description", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={c.icon ?? ""}
                      onChange={(e) => updateLocal(i, "icon", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={c.sort_order}
                      onChange={(e) => updateLocal(i, "sort_order", Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => saveRow(c)}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => del(c.id!)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
            <TableRow className="bg-muted/30">
              <TableCell>
                <Input
                  placeholder="slug"
                  value={newCat.slug}
                  onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Name"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Description"
                  value={newCat.description ?? ""}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="icon"
                  value={newCat.icon ?? ""}
                  onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={newCat.sort_order}
                  onChange={(e) => setNewCat({ ...newCat, sort_order: Number(e.target.value) })}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" onClick={add} className="gap-1">
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
