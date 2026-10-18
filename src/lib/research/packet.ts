import { z } from "zod";
import { safeHttps, validDate } from "@/lib/updates/validation";

const text = (max: number) => z.string().min(1).refine(v => !!v.trim(), "Text required").max(max).refine(v => !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v), "Plain text only");
const timestamp = z.string().refine(v => validDate(v), "Invalid timestamp with timezone");
const citation = z.object({
  type: z.enum(["primary_source", "vendor_demo", "independent_report", "hands_on_test", "video"]),
  url: z.string().refine(safeHttps, "Public HTTPS URL required"),
  title: text(300),
  videoTimestampSeconds: z.number().int().min(0).max(86400).optional(),
}).strict().refine(c => c.videoTimestampSeconds === undefined || c.type === "video", "Timestamp requires video citation");
export const researchPacketV1 = z.object({
  schemaVersion: z.literal(1),
  id: text(100).refine(v => /^[a-z0-9][a-z0-9_-]*$/.test(v), "Invalid packet ID"),
  title: text(300),
  originalWorkflowText: text(12000),
  role: z.enum(["investor", "agent", "both"]),
  task: text(500),
  steps: z.array(text(2000)).min(1).max(20),
  prerequisites: z.array(text(1000)).max(20),
  limitations: z.array(text(2000)).min(1).max(20),
  citations: z.array(citation).min(1).max(20),
  dates: z.object({
    sourcePublishedAt: timestamp.nullable(),
    sourceCheckedAt: timestamp.nullable(),
    researchedAt: timestamp,
    editorialPublishedAt: timestamp.nullable(),
    testedAt: timestamp.nullable(),
  }).strict(),
  evidenceStatus: z.enum(["unverified", "vendor_announced", "independently_reported", "hands_on"]),
  testStatus: z.enum(["not_tested", "vendor_demo_only", "hands_on_recorded"]),
  unresolvedClaims: z.array(text(2000)).max(30),
}).strict().superRefine((p, ctx) => {
  const urls = p.citations.map(c => new URL(c.url).href);
  if (new Set(urls).size !== urls.length) ctx.addIssue({ code: "custom", message: "Duplicate citation URL" });
  if ((p.testStatus === "hands_on_recorded" || p.evidenceStatus === "hands_on") &&
      (p.testStatus !== "hands_on_recorded" || !p.dates.testedAt || !p.citations.some(c => c.type === "hands_on_test"))) {
    ctx.addIssue({ code: "custom", message: "Hands-on status requires recorded test date and test citation" });
  }
  if (p.testStatus !== "hands_on_recorded" && p.dates.testedAt !== null) ctx.addIssue({ code: "custom", message: "Untested packet cannot carry a test date" });
});
export type ResearchPacketV1 = z.infer<typeof researchPacketV1>;
export const PACKET_MAX_BYTES = 65536;
export const PACKET_MAX_COUNT = 10;
export type PacketResult = { ok: true; packets: ResearchPacketV1[] } | { ok: false; errors: string[] };
/** Pure, ephemeral validation. Does not retrieve citations or trust their claims. */
export function validateResearchImport(input: string): PacketResult {
  if (new TextEncoder().encode(input).length > PACKET_MAX_BYTES) return { ok: false, errors: ["Import exceeds 64 KiB"] };
  let value: unknown;
  try { value = JSON.parse(input); } catch { return { ok: false, errors: ["Invalid JSON"] }; }
  const parsed = z.array(researchPacketV1).min(1).max(PACKET_MAX_COUNT).safeParse(value);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.slice(0, 20).map(e => `${e.path.join(".") || "packets"}: ${e.message}`) };
  const ids = parsed.data.map(p => p.id);
  if (new Set(ids).size !== ids.length) return { ok: false, errors: ["Duplicate packet ID"] };
  return { ok: true, packets: parsed.data };
}
