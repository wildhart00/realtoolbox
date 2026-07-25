/**
 * The seven-skill decision arc — the Investor Toolbox in order of use.
 *
 * Shared by the homepage arc section and /toolbox/investor so the two can't
 * drift apart. Numbering is the order a deal actually gets worked, not a
 * ranking.
 */
export type ArcStep = {
  num: number;
  title: string;
  desc: string;
  /** The one free skill — the site's primary conversion. */
  free?: boolean;
};

export const INVESTOR_ARC: ArcStep[] = [
  { num: 1, title: "Buy Box Builder", desc: "Define exactly what you should be shopping for." },
  {
    num: 2,
    title: "Deal Screen",
    desc: "Free. Run the numbers in seconds — does this deal even clear?",
    free: true,
  },
  { num: 3, title: "Deal Triage", desc: "Decide if a lead earns your next block of diligence time." },
  { num: 4, title: "Assumption Audit", desc: "Pressure-test your inputs before you trust them." },
  { num: 5, title: "Path Picker", desc: "Flip, BRRRR, or hold — pick the right exit for this property." },
  { num: 6, title: "Walk-Away Checklist", desc: "Catch the deal-killers before they cost you money." },
  { num: 7, title: "Deal Analyzer", desc: "Underwrite it for real and land on a safe offer." },
];
