import {
  ResourceArticleLayout,
  ArticleSectionHeading,
  Prose,
  TodoStub,
} from "@/components/resources/ResourceArticleLayout";

const SECTIONS = [
  { id: "why", title: "Why this is the one to get right" },
  { id: "what-counts", title: "What actually counts as a comp" },
  { id: "where", title: "Where to pull them" },
  { id: "adjusting", title: "Adjusting for differences" },
  { id: "red-flags", title: "Red flags" },
  { id: "handing-to-a-skill", title: "Handing comps to a skill" },
];

/**
 * DRAFT. Structure is complete; the operator's actual standards are not.
 *
 * Everything specific to a market — search radius, how far back to look, dollar
 * adjustments, which data sources to trust in which county — is left as a TODO
 * rather than filled with plausible-sounding numbers.
 */
export default function VerifyingCompsPage() {
  return (
    <ResourceArticleLayout
      eyebrow="Guide"
      title="How to verify a comp"
      intro="ARV is the number every other number in a deal leans on, and it is built entirely out of comps. This guide is the process for making sure the comps you feed a skill are evidence rather than wishful thinking."
      metaDescription="How to verify comparable sales before you use them to set ARV — what counts as a comp, where to pull them, how to adjust, and the red flags that disqualify one."
      sections={SECTIONS}
      draft
      draftNote="The structure and reasoning here are final. The specific standards — search radius, lookback window, adjustment amounts, and which data sources to trust — are market-dependent and still need operator input. Sections marked TODO are not yet usable."
    >
      <ArticleSectionHeading id="why">Why this is the one to get right</ArticleSectionHeading>
      <Prose>
        Almost every mistake that costs a first-time investor real money traces back to an ARV that
        was too high. Rehab overruns hurt. A soft rental market hurts. But an ARV that was wrong by
        a wide margin means the deal was never there at all, and every careful calculation
        downstream was carefully calculating the wrong thing.
      </Prose>
      <Prose>
        The skills will not invent a comp for you. That is a feature, and it means the quality of
        what comes out depends on the quality of what you put in. This is how to put in something
        good.
      </Prose>

      <ArticleSectionHeading id="what-counts">What actually counts as a comp</ArticleSectionHeading>
      <Prose>
        A comp is a piece of evidence about what a buyer paid for something similar. Three things
        have to be true before it qualifies:
      </Prose>
      <ul className="mt-4 flex flex-col gap-2.5">
        {[
          "It closed. A listing price is an asking price; a pending sale is an opinion. Only a recorded, closed sale is evidence.",
          "It is genuinely similar — comparable in property type, size, bed and bath count, lot, and, critically, finished condition.",
          "It is recent enough that the market it sold into is the market you'll be selling into.",
        ].map((t) => (
          <li key={t} className="flex items-start gap-3 text-[14.5px] text-muted-foreground leading-[1.7]">
            <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(229_94%_82%)]" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <TodoStub
        label="Your standards"
        asks={[
          "What search radius do you use, and how does it change between dense urban, suburban, and rural?",
          "How far back will you look for a closed sale before you consider it stale?",
          "How do you handle a neighbourhood with too few closed sales to build a set from — what's the fallback?",
          "What's your minimum number of comps before you'll trust an ARV at all?",
        ]}
      />

      <ArticleSectionHeading id="where">Where to pull them</ArticleSectionHeading>
      <Prose>
        Sources vary in what they cover and how current they are, and the right one depends on where
        you're buying and what access you have.
      </Prose>
      <TodoStub
        label="Source list"
        asks={[
          "List the sources you actually use, in order of preference, and what each one is good and bad at.",
          "Note which require an agent, a licence, or a paid subscription, so a beginner knows what's realistically available to them.",
          "Explain how to pull recorded sales from a county assessor or recorder site, since that's free and available to everyone.",
          "Say plainly which consumer-facing automated valuations you would and would not lean on, and why.",
        ]}
      />

      <ArticleSectionHeading id="adjusting">Adjusting for differences</ArticleSectionHeading>
      <Prose>
        No comp is identical to your subject property. The work is in accounting for the differences
        honestly — and the honest direction is usually downward. If your subject is smaller, older,
        on a busier street, or finished to a lower standard than the comp, the comp is telling you
        about a better property than yours.
      </Prose>
      <TodoStub
        label="Adjustment method"
        asks={[
          "Describe how you adjust for square footage — per-foot, bracketing, or something else — and when that breaks down.",
          "Describe how you adjust for condition and finish level, which is the adjustment beginners get most wrong.",
          "List the property attributes you treat as non-adjustable (i.e. disqualify the comp entirely rather than adjust for).",
          "Give one fully worked example: a subject, three comps, the adjustments, and the ARV you land on.",
        ]}
      />

      <ArticleSectionHeading id="red-flags">Red flags</ArticleSectionHeading>
      <Prose>
        Some sales look like comps and aren't. A transfer between family members, a foreclosure or
        estate sale, a cash sale at a steep discount, or a sale that closed with unusual seller
        concessions are all recorded as sales but none of them tell you what an ordinary buyer would
        pay on the open market.
      </Prose>
      <TodoStub
        label="Disqualifiers"
        asks={[
          "List the sale types you throw out on sight, and how to spot each one in the record.",
          "Explain how you detect seller concessions that inflate a recorded price.",
          "Note the local quirks worth warning about in the markets you operate in.",
        ]}
      />

      <ArticleSectionHeading id="handing-to-a-skill">Handing comps to a skill</ArticleSectionHeading>
      <Prose>
        Once you have a set you trust, give the skill the raw sales rather than your conclusion.
        Address, close date, close price, beds, baths, square footage, and a one-line note on
        condition for each. Say explicitly which figures you verified yourself and which you took
        from a screen — the skill will carry that distinction through to its answer, and it will
        tell you if what you&apos;ve given it isn&apos;t enough to support a call.
      </Prose>
      <TodoStub
        label="Input format"
        asks={[
          "Provide the exact paste-in format the skills handle best for a comp set.",
          "Show a filled-in example alongside the blank template.",
        ]}
      />
    </ResourceArticleLayout>
  );
}
