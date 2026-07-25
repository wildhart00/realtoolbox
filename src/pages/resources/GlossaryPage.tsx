import {
  ResourceArticleLayout,
  ArticleSectionHeading,
  Prose,
  TodoStub,
} from "@/components/resources/ResourceArticleLayout";

type Term = { term: string; short?: string; def: string };

/**
 * Plain-language definitions of the vocabulary the skills use.
 *
 * Deliberately definitional only. No thresholds, no rules of thumb, no "typical"
 * ranges — those vary by market and by operator, and inventing them here would be
 * exactly the failure mode the skills are built to avoid. Where an operator
 * standard is needed, there's a TODO stub instead.
 */
const SECTIONS: { id: string; title: string; blurb: string; terms: Term[] }[] = [
  {
    id: "the-deal",
    title: "The deal itself",
    blurb: "Words that describe the property and what you'd do to it.",
    terms: [
      {
        term: "Buy box",
        def: "The written definition of what you are and aren't willing to buy — area, property type, condition, price range, and strategy. Its job is to let you say no quickly.",
      },
      {
        term: "Comp",
        short: "Comparable sale",
        def: "A recently sold property used as evidence for what the subject property is worth. A comp is only as good as its similarity to the subject and how recently it closed.",
      },
      {
        term: "ARV",
        short: "After Repair Value",
        def: "What the property is expected to be worth once the planned renovation is finished. It is an estimate built from comps, not a fact — which is why it's the single most dangerous number in a deal.",
      },
      {
        term: "Scope of work",
        def: "The itemised list of what will actually be done to the property, with a cost against each line. The thing a rehab budget should be built from rather than guessed at.",
      },
      {
        term: "Rehab budget",
        def: "The total expected cost to bring the property to its finished condition, including materials, labour, permits, and contingency.",
      },
      {
        term: "Holding costs",
        def: "Everything you pay while you own the property and it isn't earning — loan interest, taxes, insurance, utilities, and lawn or snow service. They scale with time, so they scale with delay.",
      },
      {
        term: "Closing costs",
        def: "Transaction costs paid at purchase or sale — title, escrow, recording, transfer taxes, lender fees, and commissions. Paid on both ends of a flip.",
      },
      {
        term: "As-is",
        def: "Sold in current condition, with the seller declining to make repairs. It shifts condition risk to you, which is a reason to inspect harder, not a reason to skip inspecting.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns and cash flow",
    blurb: "How a deal's performance gets measured.",
    terms: [
      {
        term: "Gross rent",
        def: "Total rent collected before any expenses. On its own it says almost nothing about whether a property makes money.",
      },
      {
        term: "Operating expenses",
        def: "The recurring cost of running the property — taxes, insurance, management, maintenance, vacancy allowance, and capital reserves. Excludes loan payments.",
      },
      {
        term: "NOI",
        short: "Net Operating Income",
        def: "Income after operating expenses but before debt service. Written out: effective gross income minus operating expenses.",
      },
      {
        term: "Cap rate",
        short: "Capitalisation rate",
        def: "NOI divided by the property's price or value, as a percentage. A way to compare income properties independent of how they're financed.",
      },
      {
        term: "Cash flow",
        def: "What's left each month after every expense including the mortgage payment. The number that determines whether the property funds itself or you fund it.",
      },
      {
        term: "Cash-on-cash return",
        def: "Annual pre-tax cash flow divided by the actual cash you put in. Measures the return on your own money rather than on the purchase price.",
      },
      {
        term: "DSCR",
        short: "Debt Service Coverage Ratio",
        def: "NOI divided by annual debt service. Lenders use it to judge whether the property's income covers its loan payments.",
      },
      {
        term: "Equity",
        def: "The difference between what the property is worth and what's owed against it.",
      },
    ],
  },
  {
    id: "financing",
    title: "Financing",
    blurb: "The terms that come up when someone else is funding the deal.",
    terms: [
      {
        term: "LTV",
        short: "Loan-to-Value",
        def: "The loan amount as a percentage of the property's value. Some renovation lenders quote against ARV instead of the purchase price — always confirm which.",
      },
      {
        term: "Hard money",
        def: "Short-term, asset-backed lending priced above conventional debt, usually used to buy and renovate quickly. Fast to close and expensive to hold.",
      },
      {
        term: "Points",
        def: "An origination fee charged as a percentage of the loan amount, paid up front. Real money, and easy to leave out of a spreadsheet.",
      },
      {
        term: "PITI",
        def: "Principal, Interest, Taxes, and Insurance — the four components usually bundled into a mortgage payment.",
      },
      {
        term: "Refinance",
        def: "Replacing existing debt with a new loan, often to move from short-term renovation financing to long-term debt once the work is done.",
      },
      {
        term: "Seasoning",
        def: "The length of time a lender requires you to have owned a property, or held a loan, before they'll refinance it. It determines when a BRRRR can actually recycle your capital.",
      },
    ],
  },
  {
    id: "strategies",
    title: "Strategies",
    blurb: "The exits the Path Picker skill chooses between.",
    terms: [
      {
        term: "Flip",
        def: "Buy, renovate, and resell. Returns come from the spread between total cost and sale price, and the clock is the main enemy.",
      },
      {
        term: "Buy and hold",
        def: "Buy and keep the property as a rental. Returns come from cash flow, loan paydown, and any appreciation over time.",
      },
      {
        term: "BRRRR",
        short: "Buy, Rehab, Rent, Refinance, Repeat",
        def: "Renovate a property, rent it, then refinance to pull your original cash back out and reuse it on the next deal. Depends entirely on the refinance appraisal landing where you assumed it would.",
      },
      {
        term: "House hack",
        def: "Living in part of a property while renting the rest, so the tenants offset your own housing cost.",
      },
      {
        term: "Wholesale",
        def: "Putting a property under contract and assigning that contract to another buyer for a fee, without taking ownership.",
      },
    ],
  },
  {
    id: "diligence",
    title: "Diligence",
    blurb: "What you check before the money is committed.",
    terms: [
      {
        term: "Title",
        def: "The legal record of ownership. A title search establishes who actually owns the property and what's attached to it.",
      },
      {
        term: "Lien",
        def: "A claim against the property securing a debt — taxes, a contractor's work, a judgment. Liens generally follow the property, not the previous owner.",
      },
      {
        term: "Due diligence period",
        def: "The window written into the contract during which you can investigate the property and, depending on the contingencies, walk away.",
      },
      {
        term: "Contingency",
        def: "A condition in the contract that must be satisfied or you can exit — commonly inspection, financing, or appraisal.",
      },
      {
        term: "Earnest money",
        def: "The deposit that shows you're serious. Whether you get it back if you walk depends entirely on which contingencies are still live.",
      },
    ],
  },
];

export default function GlossaryPage() {
  return (
    <ResourceArticleLayout
      eyebrow="Glossary"
      title="The words the skills use"
      intro="Every term that shows up in a Deal Screen, an Assumption Audit, or a Deal Analyzer output, explained in plain language. Definitions only — no rules of thumb, because the right threshold depends on your market and your risk tolerance, not on a glossary."
      metaDescription="Plain-language definitions of the real estate terms used in the RealToolbox skills — ARV, NOI, cap rate, DSCR, BRRRR, seasoning, and the rest."
      sections={SECTIONS.map((s) => ({ id: s.id, title: s.title }))}
    >
      {SECTIONS.map((section) => (
        <div key={section.id}>
          <ArticleSectionHeading id={section.id}>{section.title}</ArticleSectionHeading>
          <p className="text-[14px] text-muted-foreground/80 leading-[1.65] mb-5">{section.blurb}</p>
          <dl className="flex flex-col gap-3">
            {section.terms.map((t) => (
              <div key={t.term} className="surface-card rounded-xl px-5 py-4">
                <dt className="flex flex-wrap items-baseline gap-2">
                  <span className="font-display text-[16px] font-semibold text-foreground tracking-tight">
                    {t.term}
                  </span>
                  {t.short && (
                    <span className="text-[12px] text-[hsl(229_94%_82%)] font-medium">{t.short}</span>
                  )}
                </dt>
                <dd className="mt-1.5 text-[13.5px] text-muted-foreground leading-[1.7]">{t.def}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}

      <ArticleSectionHeading id="house-terms">RealToolbox terms</ArticleSectionHeading>
      <Prose>
        A few words mean something specific inside the skills rather than in the industry generally.
        These need your definitions before they go live.
      </Prose>
      <TodoStub
        label="House vocabulary"
        asks={[
          'Define "unverified input" exactly as the skills use it — what marks a figure unverified, and what the skill does differently once it is.',
          'Define what a "refusal" looks like in skill output, so a reader recognises one when they get it.',
          'Define "clears" as used in Deal Screen — what the skill is actually testing when it says a deal does or does not clear.',
          "List any other terms the skills output that a first-time investor would not already know.",
        ]}
      />
    </ResourceArticleLayout>
  );
}
