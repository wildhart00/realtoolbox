import { describe, it, expect, vi, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({ from: vi.fn(), select: vi.fn(), order: vi.fn(), limit: vi.fn(), abortSignal: vi.fn(), in: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: mocks.from } }));
import { readPublicUpdates, readPrivateQueue, parsePublicUpdates, PUBLIC_COLUMNS, CANDIDATE_COLUMNS, EVENT_COLUMNS } from "./readOnly";
const row = { id: "p1", vendor: "V", title: "T", summary: "S", source_url: "https://vendor.example/news", source_published_date: "2026-10-01", source_checked_at: "2026-10-02T00:00:00Z", published_at: "2026-10-03T00:00:00Z", evidence_level: "vendor_announced" };
describe("bounded read-only adapters", () => {
  beforeEach(() => { vi.clearAllMocks(); const chain = { select: mocks.select, order: mocks.order, limit: mocks.limit, abortSignal: mocks.abortSignal, in: mocks.in }; [mocks.from, mocks.select, mocks.order, mocks.limit, mocks.in].forEach(m => m.mockReturnValue(chain)); });
  it("uses only public view explicit projection and 30-row limit, without mutators", async () => {
    mocks.abortSignal.mockResolvedValue({ data: [row], error: null });
    expect(await readPublicUpdates(new AbortController().signal)).toEqual([row]);
    expect(mocks.from).toHaveBeenCalledWith("updates_public"); expect(mocks.select).toHaveBeenCalledWith(PUBLIC_COLUMNS); expect(mocks.limit).toHaveBeenCalledWith(30);
    expect(mocks.from).toHaveBeenCalledTimes(1);
  });
  it.each(["2026-02-30", "yesterday"])("rejects malformed source date %s", d => { expect(() => parsePublicUpdates([{ ...row, source_published_date: d }])).toThrow(); });
  it.each(["javascript:alert(1)", "https://user:pass@vendor.example/a", "https://127.0.0.1/a", "http://vendor.example/a"])("rejects unsafe source %s", u => { expect(() => parsePublicUpdates([{ ...row, source_url: u }])).toThrow(); });
  it("rejects null fields, duplicate records and excessive results", () => {
    expect(() => parsePublicUpdates([{ ...row, published_at: null }])).toThrow();
    expect(() => parsePublicUpdates([row,row])).toThrow();
    expect(() => parsePublicUpdates(Array(31).fill(row))).toThrow();
    expect(parsePublicUpdates([{ ...row, actor_id: "private" }])[0]).not.toHaveProperty("actor_id");
  });
  it("null/error response does not become empty", async () => { mocks.abortSignal.mockResolvedValue({ data: null, error: null }); await expect(readPublicUpdates(new AbortController().signal)).rejects.toThrow(); });
  it("empty private queue skips events", async () => { mocks.abortSignal.mockResolvedValue({ data: [], error: null }); expect(await readPrivateQueue(new AbortController().signal)).toEqual({ candidates: [], events: [] }); expect(mocks.from).toHaveBeenCalledTimes(1); expect(mocks.select).toHaveBeenCalledWith(CANDIDATE_COLUMNS); });
  it("reads only events for returned candidates with explicit bounds", async () => {
    const c = { id:"c1", canonical_url: row.source_url, published_date: row.source_published_date, source_checked_at: row.source_checked_at, first_seen_at: row.published_at, updated_at: row.published_at, reviewed_at:null, published_at:null, withdrawn_at:null };
    mocks.abortSignal.mockResolvedValueOnce({ data:[c], error:null }).mockResolvedValueOnce({ data:[{ candidate_id:"c1", created_at:row.published_at }], error:null });
    await readPrivateQueue(new AbortController().signal);
    expect(mocks.select).toHaveBeenCalledWith(EVENT_COLUMNS); expect(mocks.in).toHaveBeenCalledWith("candidate_id",["c1"]); expect(mocks.limit.mock.calls).toEqual([[50],[200]]);
    expect(mocks.from.mock.calls).toEqual([["update_candidates"],["update_review_events"]]);
  });
});
