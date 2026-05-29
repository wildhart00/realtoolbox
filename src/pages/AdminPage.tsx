import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BatchResult {
  processed: number;
  succeeded: number;
  results: Array<{ slug: string; ok: boolean; error?: string }>;
  total: number;
  nextOffset: number;
  hasMore: boolean;
}

interface RunResult {
  processed: number;
  succeeded: number;
  results: Array<{ slug: string; ok: boolean; error?: string }>;
}

const AdminPage = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [running, setRunning] = useState(false);
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const failed = useMemo(
    () => result?.results.filter((r) => !r.ok) ?? [],
    [result],
  );

  const runRefresh = async () => {
    setRunning(true);
    setResult(null);
    setProgress(null);
    const aggregated: RunResult = { processed: 0, succeeded: 0, results: [] };
    const BATCH = 8;
    let offset = 0;
    try {
      // Loop in small batches to stay under the edge function timeout
      while (true) {
        const { data, error } = await supabase.functions.invoke("refresh-tool-images", {
          body: { onlyMissing, limit: BATCH, offset },
        });
        if (error) throw error;
        const batch = data as BatchResult;
        aggregated.processed += batch.processed;
        aggregated.succeeded += batch.succeeded;
        aggregated.results.push(...batch.results);
        setResult({ ...aggregated });
        setProgress({
          done: aggregated.processed,
          total: onlyMissing ? aggregated.processed + (batch.hasMore ? batch.total : 0) : batch.total,
        });
        if (!batch.hasMore || batch.processed === 0) break;
        offset = batch.nextOffset;
      }
      toast.success(
        `Refreshed ${aggregated.succeeded}/${aggregated.processed} tool images`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Refresh failed: ${msg}`);
    } finally {
      setRunning(false);
    }
  };

  if (loading || isAdmin === null) {
    return (
      <AppLayout>
        <div className="px-6 py-24 text-center text-sm text-muted-foreground">Loading...</div>
      </AppLayout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-semibold">Admin only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need an admin role to view this page.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-8 px-6 py-12">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tools for managing the directory.
          </p>
        </header>

        <section className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="text-lg font-semibold">Refresh tool card images</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Uses Firecrawl to scrape each tool's website, capture a product screenshot,
            extract its brand color, and store everything as the card hero image and banner.
          </p>

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={(e) => setOnlyMissing(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Only refresh tools missing a hero image
          </label>

          <Button
            onClick={runRefresh}
            disabled={running}
            className="mt-4 gap-2"
          >
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {running ? "Refreshing... this can take several minutes" : "Refresh all tool images"}
          </Button>

          {result && (
            <div className="mt-6 space-y-2 text-sm">
              <p>
                Processed <strong>{result.processed}</strong> · Succeeded{" "}
                <strong className="text-green-600">{result.succeeded}</strong> · Failed{" "}
                <strong className="text-destructive">{failed.length}</strong>
              </p>
              {failed.length > 0 && (
                <details className="rounded-lg border border-border/60 bg-muted/40 p-3">
                  <summary className="cursor-pointer font-medium">
                    Failed tools ({failed.length})
                  </summary>
                  <ul className="mt-2 space-y-1 text-xs">
                    {failed.map((f) => (
                      <li key={f.slug}>
                        <code>{f.slug}</code> — {f.error}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default AdminPage;
