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
    title: "Designed to ask, not guess",
    short:
      "Comps, taxes, rents and public records are treated as inputs you supply. AI can still make mistakes — check every figure.",
    long:
      "General-purpose AI will happily produce a comp, a tax figure, or a market rent that sounds right and isn't. These skills are written to treat those as inputs, not outputs: when a number is missing, the instructions tell the model to ask for it or leave the field open. That reduces guessing; it cannot guarantee it, so verify figures before you rely on them.",
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
    title: "Works with the AI you already use",
    short:
      "Written as plain instructions for ChatGPT, Claude, Gemini and similar assistants. Results can vary by model.",
    long:
      "The skills are plain-language instructions, not a separate app, so you can load them into the assistant you already use. Different models can still answer the same question differently — treat output as a first pass and check it against your own numbers and sources.",
  },
];
