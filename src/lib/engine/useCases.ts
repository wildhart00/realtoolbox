import { UPDATES } from "@/lib/updates/seed";
import type { UseCase } from "./discovery";

/** Editorial evaluation suggestions based only on the previously provided source records. */
export const PREVIEW_USE_CASES = UPDATES.slice(0, 2).map(u => ({
  id: u.id, audience: u.audience, title: u.tool, sourceUrl: u.source_url,
  useCase: {
    task: u.tasks.join(" / "), problem: u.practical_benefit,
    vendorFacts: [u.summary], editorialInference: "Evaluate the fit with a harmless sample before considering live work.",
    requiredInputs: u.audience.includes("agent") ? ["Permitted sample client activity", "Supported platform account"] : ["Harmless sample operations report", "AppFolio account"],
    setupSteps: ["Confirm account access and feature availability with the vendor.", u.next_step, "Review output accuracy and approval controls; do not activate consequential actions."],
    effort: "Not measured; account configuration and human review required", cost: { status: "unknown" },
    integrationNeeds: u.audience.includes("agent") ? ["Realtor.com+", "Supported MLS access to be confirmed"] : ["AppFolio", "Connector availability and permissions to be confirmed"],
    limitations: [u.limitations, "No time savings, ROI or independent quality results established."],
    evidenceLevel: "vendor_announced", test: { status: "not_tested", recordedAt: null, evidenceUrl: null },
  } satisfies UseCase,
}));