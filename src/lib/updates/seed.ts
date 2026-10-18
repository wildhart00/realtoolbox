/**
 * PREVIEW SEED — unpublished draft records, not approved for public publication.
 * Every entry is vendor_announced and draft_needs_human_review. These are static
 * records; nothing here is collected or refreshed automatically.
 */
export type Audience = "investor" | "agent";
export type AudienceChoice = Audience | "both";
export type EvidenceLevel = "vendor_announced" | "editorially_checked" | "hands_on_tested";

export interface UpdateRecord {
  id: string;
  headline: string;
  tool: string;
  source_url: string;
  event_date: string;
  source_publication_date: string;
  checked_at_utc: string;
  evidence_level: EvidenceLevel;
  editorial_status: "draft_needs_human_review";
  hands_on_tested: false;
  audience: Audience[];
  tasks: string[];
  summary: string;
  practical_benefit: string;
  limitations: string;
  next_step: string;
  pricing: string;
  geography: string;
  recency_label: string;
  application_basis: string;
}

export const SEED_META = {
  research_completed_at_utc: "2026-10-18T15:22:19Z",
  coverage_note:
    "Selective review of six dated official announcements, not exhaustive monitoring. Re-reading an announcement does not reconfirm present account availability.",
  featured_ids: ["realtor-realassist-agents-2026-10-06", "appfolio-realm-x-2026-09-29"],
};

const base = {
  checked_at_utc: "2026-10-18T15:22:19Z",
  evidence_level: "vendor_announced" as const,
  editorial_status: "draft_needs_human_review" as const,
  hands_on_tested: false as const,
  pricing: "Not researched; no price claim",
  geography: "United States; account and market availability must be confirmed",
};

export const UPDATES: UpdateRecord[] = [
  {
    ...base,
    id: "realtor-realassist-agents-2026-10-06",
    headline: "Realtor.com adds RealAssist to its agent workspace",
    tool: "Realtor.com+ / RealAssist AI",
    source_url:
      "https://mediaroom.realtor.com/2026-10-06-Realtor-com-R-TM-Unveils-RealAssist-TM-AI-for-Agents-to-Power-a-More-Intelligent-Workspace",
    event_date: "2026-10-06",
    source_publication_date: "2026-10-06",
    audience: ["agent"],
    tasks: ["client setup", "client communication", "daily follow-up"],
    summary:
      "Realtor.com announced AI-assisted client setup, activity digests and suggested actions within Realtor.com+. The release says agents review and approve actions, including search changes and drafted messages.",
    practical_benefit:
      "Potentially reduces preparation before a client conversation by collecting search and message activity in one place.",
    limitations:
      "Platform was live in 21 markets at announcement; nationwide coverage is not established. Actual time savings and output quality have not been tested.",
    next_step:
      "Check whether your MLS supports Realtor.com+, then test a digest and message draft with permitted sample data.",
    recency_label: "October 2026 announcement",
    application_basis: "Vendor-described agent workflow",
  },
  {
    ...base,
    id: "appfolio-realm-x-2026-09-29",
    headline: "AppFolio expands Realm-X to multi-step work and prompt-built workflows",
    tool: "AppFolio Realm-X",
    source_url: "https://www.appfolio.com/newsroom/appfolio-introduces-the-new-realm-x",
    event_date: "2026-09-29",
    source_publication_date: "2026-09-29",
    audience: ["investor"],
    tasks: ["property operations", "workflow setup", "portfolio administration"],
    summary:
      "AppFolio announced a Realm-X update that retains conversational context and builds workflows and dashboards from prompts. The release says the new Realm-X is available across AppFolio plans and includes its Claude connector.",
    practical_benefit:
      "Investor-operators already using AppFolio could evaluate whether routine administration needs less manual configuration.",
    limitations:
      "Requires AppFolio; precise account access and feature limits need checking. Vendor statements about permissions and performance have not been independently tested; retain human approval for consequential actions.",
    next_step:
      "Ask for a demo using a harmless maintenance-reporting workflow and inspect the resulting steps before activation.",
    recency_label: "September 2026 announcement",
    application_basis: "Vendor-described property-operations workflow",
  },
  {
    ...base,
    id: "zillow-gemini-tours-2026-07-09",
    headline: "Zillow announces rental-tour discovery through Gemini",
    tool: "Zillow Rentals / Google Gemini",
    source_url: "https://www.zillow.com/news/google-gemini-now-connects-renters-to-zillow-tour-booking/",
    event_date: "2026-07-09",
    source_publication_date: "2026-07-09",
    audience: ["investor", "agent"],
    tasks: ["rental marketing", "tour scheduling"],
    summary:
      "Zillow announced a Gemini connected app that shows rental matches and tour availability. Booking confirmation occurs on Zillow, with instant booking or a tour request depending on the property's configuration.",
    practical_benefit:
      "Editorial inference: rental owners and leasing agents may benefit from checking that listing and touring information is accurate for this additional discovery route.",
    limitations:
      "The July announcement described a rollout, not universal access. Requires linked accounts; instant tours depend on property support, and no lead or conversion improvement is established.",
    next_step: "Check one eligible listing's availability and tour configuration without submitting a booking.",
    recency_label: "July 2026 announcement; background",
    application_basis: "Real-estate integration is vendor-described; owner/agent benefit is editorial inference",
  },
  {
    ...base,
    id: "zillow-pro-nationwide-2026-07-09",
    headline: "Zillow Pro expands nationwide with CRM-linked AI assistance",
    tool: "Zillow Pro / Follow Up Boss",
    source_url: "https://www.zillow.com/news/agents-using-zillow-pro-see-80-more-meetings-with-linked-contacts/",
    event_date: "2026-07-09",
    source_publication_date: "2026-07-09",
    audience: ["agent"],
    tasks: ["CRM follow-up", "client communication"],
    summary:
      "Zillow announced nationwide availability of Zillow Pro, combining Follow Up Boss with its My Agent collaboration feature. After a contact accepts an invitation, the agent can see relevant Zillow activity and use tailored message suggestions.",
    practical_benefit: "Could provide context for follow-up with existing, consenting contacts.",
    limitations:
      "Some MLS functions are market-dependent. Do not treat vendor-reported meeting or conversion differences as causal evidence or guaranteed results; membership terms and account entitlements require review.",
    next_step: "Review consent and membership terms, then compare a suggested message against the actual client conversation.",
    recency_label: "July 2026 announcement; background",
    application_basis: "Vendor-described agent workflow",
  },
  {
    ...base,
    id: "appfolio-accounting-performer-2026-06-16",
    headline: "AppFolio announces AI invoice coding and accounting review support",
    tool: "AppFolio Accounting Performer",
    source_url:
      "https://www.appfolio.com/newsroom/appfolio-deepens-agentic-ai-across-leasing-accounting-and-resident-operations",
    event_date: "2026-06-16",
    source_publication_date: "2026-06-16",
    audience: ["investor"],
    tasks: ["property bookkeeping", "invoice organization"],
    summary:
      "AppFolio announced Accounting Performer for invoice import, coding, approval routing and mismatch detection. The same release described broader AI additions across its property-operations platform.",
    practical_benefit:
      "Investor-operators could evaluate reduced manual entry while retaining review of invoice coding and exceptions.",
    limitations:
      "Announcement does not establish general availability for Accounting Performer. Confirm rollout and plan requirements; no accuracy, accounting compliance or savings claim has been independently tested.",
    next_step: "Request access details and test several synthetic invoices against expected coding, with no payment authority enabled.",
    recency_label: "June 2026 announcement; background",
    application_basis: "Vendor-described accounting workflow; investor use is an operator application",
  },
  {
    ...base,
    id: "realtor-realassist-search-2026-06-02",
    headline: "Realtor.com introduces conversational home search in RealAssist beta",
    tool: "Realtor.com RealAssist AI",
    source_url:
      "https://mediaroom.realtor.com/2026-06-02-Realtor-com-R-Launches-RealAssist-TM-AI-A-Completely-Reimagined-Way-to-Find-A-Home",
    event_date: "2026-06-02",
    source_publication_date: "2026-06-02",
    audience: ["investor", "agent"],
    tasks: ["property discovery", "client search preparation"],
    summary:
      "Realtor.com announced a Gemini-based conversational search experience with remembered preferences and property comparisons. At launch, access was limited to selected logged-in users across desktop, mobile web and its app.",
    practical_benefit:
      "Editorial inference: agents and investors can use a permitted test search to evaluate candidate discovery before checking listing facts independently.",
    limitations:
      "Broad availability remains unconfirmed by this announcement. It is not an underwriting tool; generated imagery is illustrative and cannot establish property condition, renovation feasibility or neighborhood facts.",
    next_step: "If available, test a factual search and compare results with original listings; avoid entering sensitive financial data.",
    recency_label: "June 2026 beta announcement; background",
    application_basis: "Consumer search is vendor-described; professional use is editorial inference",
  },
];
