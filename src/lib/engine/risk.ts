import type { CandidateFlag, RiskCategory } from "./types";

const RULES: Record<RiskCategory, RegExp> = {
  pricing: /(\$\s?\d|\bpric(e|es|ing)\b|\bcost(s)?\b|free trial|\bdiscount)/i,
  availability: /(\bavailab(le|ility)\b|\brollout\b|\bnationwide\b|\bgeneral availability\b|\bbeta\b|\blaunch(es|ed)?\b)/i,
  performance: /(\d+\s?%|\bfaster\b|\bincrease[sd]?\b|\broi\b|\bsav(e|es|ings)\b|\bboost)/i,
  ranking: /(\bbest\b|#\s?1\b|\bleading\b|\btop\b|\bnumber one\b)/i,
  privacy: /(\bprivacy\b|\bpersonal data\b|\bsecurity\b|\bconsent\b|\bbreach\b)/i,
  legal: /(fair housing|\bcomplian(ce|t)\b|\blegal\b|\bregulat|\blawsuit\b|\bsettlement\b)/i,
  financial: /(\binvestment returns?\b|\brevenue\b|\bearnings\b|\bfinancial results\b|\bquarter(ly)? results\b|\bguidance\b|\bstock\b)/i,
  sponsor: /(\bsponsor(ed|ship)?\b|\badvertis|\bpaid partner)/i,
};

export interface RiskDecision {
  risk: "low" | "high";
  reasons: RiskCategory[];
}

export function classifyRisk(title: string, body: string): RiskDecision {
  const text = `${title}\n${body}`;
  const reasons = (Object.keys(RULES) as RiskCategory[]).filter((k) => RULES[k].test(text));
  return { risk: reasons.length ? "high" : "low", reasons };
}

export interface AutoPolicy {
  /** Must stay false until a validation pilot has been reviewed and approved. */
  templateAutoPublishTested: boolean;
}

export const DEFAULT_POLICY: AutoPolicy = { templateAutoPublishTested: false };

/** Only low-risk, unflagged template metadata can ever be auto-eligible. */
export function routeCandidate(risk: RiskDecision, flags: CandidateFlag[], policy: AutoPolicy): "auto_eligible" | "queued" {
  if (!policy.templateAutoPublishTested) return "queued";
  if (risk.risk === "high" || flags.length > 0) return "queued";
  return "auto_eligible";
}
