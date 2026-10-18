import { useEffect, useState } from "react";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { readPrivateQueue, QUEUE_LIMIT, EVENT_LIMIT } from "@/lib/updates/readOnly";
import { Button } from "@/components/ui/button";

type QueueData = Awaited<ReturnType<typeof readPrivateQueue>>;
export function ReadOnlyUpdateQueue() {
  const access = useAdminAccess();
  const [result, setResult] = useState<{ owner: string; token: string | undefined; data?: QueueData; failed?: boolean } | null>(null);
  useEffect(() => {
    setResult(null);
    if (!access.allowed || !access.userId) return;
    const owner = access.userId;
    const token = access.sessionToken;
    const controller = new AbortController();
    readPrivateQueue(controller.signal).then(data => {
      if (!controller.signal.aborted) setResult({ owner, token, data });
    }).catch(() => { if (!controller.signal.aborted) setResult({ owner, token, failed: true }); });
    return () => controller.abort();
  }, [access.allowed, access.userId, access.sessionToken]);
  const current = access.allowed && result?.owner === access.userId && result?.token === access.sessionToken ? result : null;
  return <section aria-labelledby="private-queue-heading" className="space-y-4 border-y py-5">
    <h2 id="private-queue-heading" className="text-xl font-semibold">Private queue · read only</h2>
    <p className="text-sm text-muted-foreground">Latest {QUEUE_LIMIT} candidates across all states, with up to {EVENT_LIMIT} review events. Not a complete history.</p>
    <div className="flex flex-wrap gap-2" aria-label="Disconnected review controls">
      {["Review", "Approve", "Publish", "Withdraw", "Pause"].map(label => <Button key={label} size="sm" variant="outline" disabled>{label}</Button>)}
    </div>
    {access.checking ? <p role="status">Checking admin access…</p> : !access.allowed ? <p role="alert">Private queue unavailable — verified admin access required.</p> : !current ? <p role="status">Loading private queue…</p> : current.failed ? <p role="alert">Private queue unavailable — access denied, invalid data or read failed. No empty-queue conclusion.</p> : current.data?.candidates.length === 0 ? <p role="status">No private candidates.</p> : current.data?.candidates.map(c => <article key={c.id} className="rounded-lg border p-4 space-y-3 min-w-0">
      <h3 className="font-semibold break-words">{c.title}</h3>
      <p className="text-sm whitespace-pre-wrap break-words">{c.draft_summary}</p>
      <details><summary className="min-h-11 flex items-center cursor-pointer text-accent">Candidate record and review history</summary>
        <dl className="text-sm space-y-2">{Object.entries(c).map(([key, value]) => <div key={key} className="break-words"><dt className="font-medium">{key}</dt><dd className="whitespace-pre-wrap">{Array.isArray(value) ? value.join(", ") || "None" : value ?? "Not recorded"}</dd></div>)}</dl>
        <h4 className="mt-4 font-medium">Review events</h4>
        {current.data?.events.filter(e => e.candidate_id === c.id).map(e => <dl key={e.id} className="mt-3 border-t pt-3 text-sm space-y-1">{Object.entries(e).map(([key, value]) => <div key={key} className="break-words"><dt className="inline font-medium">{key}: </dt><dd className="inline whitespace-pre-wrap">{value ?? "Not recorded"}</dd></div>)}</dl>)}
        {!current.data?.events.some(e => e.candidate_id === c.id) && <p className="mt-3 text-sm">No review events returned in this bounded read.</p>}
      </details>
    </article>)}
  </section>;
}
