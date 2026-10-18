import { useEffect, useState } from "react";
import { readPublicUpdates, type PublicUpdate } from "@/lib/updates/readOnly";
import { PublicUpdateCard } from "./UpdateCard";

type FeedState = { status: "loading" } | { status: "unavailable" } | { status: "ready"; rows: PublicUpdate[] };
export function PublicUpdatesFeed() {
  const [state, setState] = useState<FeedState>({ status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    readPublicUpdates(controller.signal).then(rows => {
      if (!controller.signal.aborted) setState({ status: "ready", rows });
    }).catch(() => { if (!controller.signal.aborted) setState({ status: "unavailable" }); });
    return () => controller.abort();
  }, []);
  if (state.status === "loading") return <p role="status" className="mt-6 text-sm text-muted-foreground">Loading published updates…</p>;
  if (state.status === "unavailable") return <p role="alert" className="mt-6 text-sm text-muted-foreground">Published updates are unavailable. This is a read failure, not an empty feed.</p>;
  if (!state.rows.length) return <p role="status" data-testid="no-approved" className="mt-6 text-sm text-muted-foreground">No published updates yet.</p>;
  return <div className="mt-4 grid gap-5 md:grid-cols-2">{state.rows.map(u => <PublicUpdateCard key={u.id} u={u} />)}</div>;
}
