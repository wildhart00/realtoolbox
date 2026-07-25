/**
 * The trust story, in one place.
 *
 * This copy appears on the homepage, /how-it-works, and the toolbox pages. Keeping
 * it in a single module is deliberate: before this file existed the same four
 * claims were written four slightly different ways across the site.
 *
 * `short` is for the homepage cards. `long` is for /how-it-works, where a visitor
 * has opted in to the detail.
 */
export type Guardrail = {
  key: string;
  title: string;
  short: string;
  long: string;
};

export const GUARDRAILS: Guardrail[] = [
  {
    key: "no-invented-numbers",
    title: "It never invents a number",
    short:
      "Comps, taxes, rents, and public records are inputs you supply — not things the AI makes up to fill a gap.",
    long:
      "General-purpose AI will happily produce a comp, a tax figure, or a market rent that sounds right and isn't. These skills are written to treat those as inputs, not outputs. If a number isn't in front of it, the skill asks for it or leaves the field open. It does not guess and it does not round a guess into a fact.",
  },
  {
    key: "flags-unverified",
    title: "Unverified inputs get flagged",
    short:
      "Anything you estimated stays labelled as an estimate all the way through to the final answer.",
    long:
      "Every figure carries its provenance. If you typed in a rent you heard from a wholesaler, that rent is marked unverified in the working and in the summary — so you can see exactly which parts of the conclusion are resting on something you still need to check.",
  },
  {
    key: "refuses-weak-inputs",
    title: "It refuses a verdict on weak inputs",
    short:
      "Too little to go on and you get a list of what's missing instead of a confident wrong answer.",
    long:
      "The failure mode that costs money is a clean-looking verdict built on three assumptions and a hope. When the inputs are too thin to support a call, the skill says so and tells you what it needs. A refusal is a result — it's the difference between not knowing and thinking you know.",
  },
  {
    key: "cross-model-tested",
    title: "Torture-tested across four models",
    short:
      "Run against ChatGPT, Claude, Gemini, and Meta until the answers converge — then shipped.",
    long:
      "Each skill is run against ChatGPT, Claude, Gemini, and Meta on the same deals. Where the models disagree, the instructions are tightened until they converge. Models that answer the same question four different ways are models that aren't being told enough — convergence is the test that the skill is doing the work rather than the model's mood.",
  },
];
