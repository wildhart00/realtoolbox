import { createHash } from "node:crypto";
import { parseAtom, fetchAtom } from "./atom.ts";
import type { Wire } from "./transport.ts";
import { fixedGoogleWorkspaceAtomWire } from './fixed-google-workspace-atom-wire.ts';
export type ManualRpc = (name: string, args: Record<string, unknown>) => Promise<{data: unknown; error: unknown}>;
const digest = (v: string) => createHash("sha256").update(v).digest("hex");
async function call(rpc: ManualRpc, name: string, args: Record<string, unknown>) {
  const result = await rpc(name,args);
  if (result.error) throw new Error("rpc_refused");
  return result.data;
}
/** Server library ONLY. No handler/deployment; explicit manual authorization required.
 * A narrow SQL wrapper invokes the installed revision RPC atomically with lineage.
 */
export async function runManualAtom(deps: {authorized: boolean; rpc: ManualRpc; wire?: Wire; now: () => string}) {
  if (!deps.authorized) throw new Error("manual_run_not_authorized");
  const run = await call(deps.rpc,"engine_begin_atom_run",{});
  if (typeof run !== "string" || !/^[a-f0-9-]{36}$/.test(run)) throw new Error("invalid_reservation");
  let created=0, submitted=0, snapshot: string|null=null;
  let outcome: "failed"|"partial"|"changed"|"no_change"="failed";
  try {
    const xml = await fetchAtom(deps.wire ?? fixedGoogleWorkspaceAtomWire);
    const now = deps.now();
    const entries = parseAtom(xml,now);
    if (!entries.length) throw new Error("no_valid_atom_metadata");
    for (const e of entries) {
      const result = await call(deps.rpc,"engine_record_atom_draft",{
        _run_id:run,_canonical_url:e.alternateLink,_content_hash:e.contentHash,
        _title:e.title,_published:e.published,_updated:e.updated,_checked_at:now,
      });
      if (typeof result !== "string" || !/^(queued|duplicate:(queued|needs_correction|approved|rejected|auto_eligible|published|withdrawn))$/.test(result)) throw new Error("invalid_revision_result");
      submitted++;
      if (result === "queued") created++;
    }
    snapshot=digest(entries.map(e=>e.contentHash).join("\n"));
    outcome=created ? "changed" : "no_change";
  } catch { outcome=created ? "partial" : "failed"; snapshot=null; }
  // Failure counters and completion health are server-validated; no raw errors/feed in logs.
  const finished=await call(deps.rpc,"engine_finish_atom_run",{_run_id:run,_outcome:outcome,_snapshot:snapshot,_requests:1});
  if (finished!==outcome) throw new Error("invalid_finish_result");
  return {runId:run,outcome,created,submitted,requests:1};
}
