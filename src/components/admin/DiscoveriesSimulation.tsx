import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FixtureSearchAdapter, ingestDiscovery, rotatingQueries, sourcePromotionProposal, DISCOVERY_POLICY, type DiscoveryCandidate, type DiscoveryKind } from "@/lib/engine/discovery";

export function DiscoveriesSimulation() {
  const [rows, setRows] = useState<DiscoveryCandidate[]>([]);
  const [filter, setFilter] = useState<DiscoveryKind | "all">("all");
  const [week, setWeek] = useState(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async () => {
    setRunning(true); setError(null);
    try {
      const repo = new Map<string, DiscoveryCandidate>();
      const adapter = new FixtureSearchAdapter();
      for (const q of rotatingQueries(week)) ingestDiscovery(await adapter.search(q.id), repo);
      setRows([...repo.values()]); setWeek(w => w + 1);
    } catch { setError("Synthetic discovery run failed; nothing was saved."); }
    finally { setRunning(false); }
  };
  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">Synthetic search results only. Snippets are not source evidence and cannot publish. Primary-source fetching requires later vetting and authorization.</p>
    <div className="flex flex-wrap gap-2"><Button onClick={run} disabled={running}>{running ? "Running fixtures…" : "Run discovery fixtures"}</Button><Button variant="outline" onClick={() => setRows([])}>Clear discoveries</Button></div>
    <p className="text-sm">Proposed, inactive: {DISCOVERY_POLICY.searchesPerWeek} task searches/week; known sources daily; at most {DISCOVERY_POLICY.monthlySearchCap} searches and {DISCOVERY_POLICY.monthlyDetailCap} new detail fetches/month. Provider costs unknown.</p>
    <ul className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">{rotatingQueries(week).map(q => <li key={q.id}>{q.audience}: {q.query}</li>)}</ul>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Discovery kind">{(["all", "new_tool", "release", "workflow_idea"] as const).map(k => <Button key={k} size="sm" variant={filter === k ? "default" : "outline"} aria-pressed={filter === k} onClick={() => setFilter(k)}>{k.replace(/_/g, " ")}</Button>)}</div>
    {error && <p role="alert">{error}</p>}
    {rows.length === 0 && <p className="text-sm text-muted-foreground">No discoveries simulated yet.</p>}
    {rows.filter(r => filter === "all" || r.kind === filter).map(r => <article key={r.id} className="rounded-lg border p-4 space-y-2 text-sm">
      <div className="flex flex-wrap gap-2"><Badge variant="outline">{r.kind.replace(/_/g, " ")}</Badge><Badge variant="secondary">{r.freshness.replace(/_/g, " ")}</Badge><Badge variant="outline">Needs primary source</Badge></div>
      <h3>{r.title}</h3><p className="break-all text-muted-foreground">{r.canonicalUrl}</p>
      <p>Found {r.firstSeenAt} · last seen {r.lastSeenAt} · announcement {r.announcementDate ?? "undated"}</p>
      <p>Provenance: {r.provenance.map(p => p.queryId).join(", ")} · synthetic fixture</p>
      <p className="text-muted-foreground">Review: {r.reviewReasons.join(", ")}</p>
      <details><summary className="cursor-pointer">Source promotion proposal — disabled</summary><ul className="list-disc pl-5 mt-2">{sourcePromotionProposal(r).requiredReview.map(v => <li key={v}>{v}</li>)}</ul></details>
    </article>)}
  </div>;
}