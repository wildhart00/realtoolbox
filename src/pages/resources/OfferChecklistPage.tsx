import { Link } from "react-router-dom";
import {
  ResourceArticleLayout,
  ArticleSectionHeading,
  Prose,
  TodoStub,
} from "@/components/resources/ResourceArticleLayout";

const SECTIONS = [
  { id: "the-number", title: "1. The number" },
  { id: "the-property", title: "2. The property" },
  { id: "the-paperwork", title: "3. The paperwork" },
  { id: "the-money", title: "4. The money" },
  { id: "the-exit", title: "5. The exit" },
  { id: "walk-away", title: "Before you sign" },
];

type Check = { label: string; note: string };

const NUMBER_CHECKS: Check[] = [
  {
    label: "ARV is built from closed, verified comps",
    note: "Not an automated estimate, not the listing agent's number, not what the wholesaler said it would appraise for.",
  },
  {
    label: "Rehab budget comes from a scope of work, not a per-foot guess",
    note: "Line items with costs against them. A single round number is a placeholder, not a budget.",
  },
  {
    label: "Holding costs are calculated against a realistic timeline",
    note: "Including the weeks before work starts and the weeks after it finishes before it sells or rents.",
  },
  {
    label: "Both sets of closing costs are in the model",
    note: "You pay them buying and you pay them selling.",
  },
  {
    label: "Financing costs are in the model",
    note: "Interest, points, and fees — not just the loan principal.",
  },
  {
    label: "Every estimate is labelled as an estimate",
    note: "You should be able to point at each number and say where it came from.",
  },
];

const PROPERTY_CHECKS: Check[] = [
  {
    label: "You or someone you trust has physically seen it",
    note: "Photos are chosen by the person selling it.",
  },
  {
    label: "The big-ticket systems have been assessed",
    note: "Roof, foundation, electrical, plumbing, HVAC — the things that turn a cosmetic rehab into a different deal.",
  },
  { label: "Square footage and bed/bath count are confirmed against the record", note: "Listings are frequently wrong, and ARV depends on this." },
  { label: "You know what's permitted and what isn't", note: "Unpermitted work becomes your problem at resale." },
];

const PAPERWORK_CHECKS: Check[] = [
  { label: "Title has been searched", note: "You know who owns it and what's attached to it." },
  { label: "Liens and back taxes are identified and quantified", note: "They generally follow the property." },
  { label: "Your contingencies are written down and still live", note: "Inspection, financing, appraisal — whichever you're relying on to be able to walk." },
  { label: "You know the deadline on every contingency", note: "A contingency you let lapse is a contingency you don't have." },
];

const MONEY_CHECKS: Check[] = [
  { label: "Funding is confirmed, not assumed", note: "A pre-qualification is not a commitment." },
  { label: "You can cover the rehab overrun as well as the rehab", note: "Reserves are part of the deal, not an optional extra." },
  { label: "You know what earnest money is at risk and under what conditions", note: "" },
  { label: "You can carry the holding costs longer than you expect to need to", note: "" },
];

const EXIT_CHECKS: Check[] = [
  { label: "You have picked one exit and modelled it", note: "Flip, BRRRR, or hold — the numbers are different for each." },
  { label: "You have a second exit that doesn't lose money", note: "If it won't sell, will it rent at a number that covers the debt?" },
  { label: "You know what has to be true for the exit to work", note: "And you've written it down, so you'll notice when it stops being true." },
];

function CheckList({ checks }: { checks: Check[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-2.5">
      {checks.map((c, i) => (
        <li key={c.label} className="surface-card rounded-xl px-5 py-4 flex items-start gap-3.5">
          <span className="mt-[2px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-foreground/20 bg-foreground/[0.04] text-[10px] font-bold text-foreground/50">
            {i + 1}
          </span>
          <span className="min-w-0">
            <span className="block text-[14px] font-semibold text-foreground leading-snug">
              {c.label}
            </span>
            {c.note && (
              <span className="mt-1 block text-[13px] text-muted-foreground leading-[1.65]">
                {c.note}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * DRAFT in part. The checklist structure is real and safe — it's a discipline
 * checklist, not market advice. Anything that would require stating a threshold,
 * a state-specific legal rule, or a contract mechanic is a TODO.
 */
export default function OfferChecklistPage() {
  return (
    <ResourceArticleLayout
      eyebrow="Checklist"
      title="What to check before you make an offer"
      intro="Not a substitute for underwriting — a list of the things that should already be true by the time you're writing a number on a contract. Work down it. Anything you can't tick is a question, and questions are cheaper before the offer than after it."
      metaDescription="A pre-offer checklist for new real estate investors: the number, the property, the paperwork, the money, and the exit — what should be settled before you commit."
      sections={SECTIONS}
      draft
      draftNote="The checklist itself is usable. The sections marked TODO need operator input — specifically anything involving contract mechanics, legal steps, or numbers that vary by state and market. Nothing here is legal or financial advice."
    >
      <ArticleSectionHeading id="the-number">1. The number</ArticleSectionHeading>
      <Prose>
        Everything else on this page is cheap compared to getting this wrong. If you haven&apos;t
        already, read{" "}
        <Link
          to="/resources/verifying-comps"
          className="text-[hsl(229_94%_82%)] underline-offset-2 hover:underline"
        >
          how to verify a comp
        </Link>{" "}
        first.
      </Prose>
      <CheckList checks={NUMBER_CHECKS} />
      <TodoStub
        label="Your offer standard"
        asks={[
          "What margin or spread do you require before an offer is worth making, and how do you express it?",
          "Does that standard change by strategy (flip vs BRRRR vs hold)? Show each.",
          "State whether the skills apply this standard automatically or whether the user sets it themselves.",
        ]}
      />

      <ArticleSectionHeading id="the-property">2. The property</ArticleSectionHeading>
      <CheckList checks={PROPERTY_CHECKS} />
      <TodoStub
        label="Walkthrough specifics"
        asks={[
          "List what you personally check on a first walkthrough, in the order you check it.",
          "Note which conditions make you walk immediately rather than price around.",
          "Say when you'd pay for a professional inspection before offering versus during the contingency period.",
        ]}
      />

      <ArticleSectionHeading id="the-paperwork">3. The paperwork</ArticleSectionHeading>
      <Prose>
        This section describes what should be settled, not how to settle it — contract mechanics and
        title practice vary by state, and this page will not guess at yours.
      </Prose>
      <CheckList checks={PAPERWORK_CHECKS} />
      <TodoStub
        label="Contract and title"
        asks={[
          "Name the states or markets this guide should speak to, so the contract language can be specific rather than generic.",
          "Describe how you structure contingencies on a typical offer, and which you'll waive under what conditions.",
          "Explain who orders title in your market and at what point in the process.",
          "Confirm the disclaimer wording you want on this section — this is procedural, not legal advice.",
        ]}
      />

      <ArticleSectionHeading id="the-money">4. The money</ArticleSectionHeading>
      <CheckList checks={MONEY_CHECKS} />
      <TodoStub
        label="Reserves and funding"
        asks={[
          "How much reserve do you require beyond the rehab budget, and how do you express it?",
          "What does a beginner realistically need lined up before their first offer, in order?",
        ]}
      />

      <ArticleSectionHeading id="the-exit">5. The exit</ArticleSectionHeading>
      <CheckList checks={EXIT_CHECKS} />

      <ArticleSectionHeading id="walk-away">Before you sign</ArticleSectionHeading>
      <Prose>
        Read your own assumptions back. Not the conclusion — the assumptions. If more than a couple
        of them are things you were told rather than things you checked, the deal isn&apos;t ready,
        however good the spread looks.
      </Prose>
      <Prose>
        The Walk-Away Checklist and Assumption Audit skills exist to run this argument against you
        properly, and they&apos;ll refuse to bless a deal whose inputs are too thin. That refusal is
        the point.
      </Prose>
    </ResourceArticleLayout>
  );
}
