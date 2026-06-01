import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, Terminal, Workflow, Zap } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AgentPlatformCard, type AgentPlatformItem } from "@/components/agents/AgentPlatformCard";
import { WorkflowCard, type WorkflowItem } from "@/components/agents/WorkflowCard";

const agentPlatforms: AgentPlatformItem[] = [
  {
    name: "n8n",
    description:
      "Visual workflow automation with AI agent builder, memory and multi-agent coordination",
    category: "Automation",
    pricing: "Open Source",
    url: "https://n8n.io",
    icon: Zap,
  },
  {
    name: "Make.com",
    description:
      "No-code workflow automation with AI-native templates for real estate workflows",
    category: "Automation",
    pricing: "Freemium",
    url: "https://make.com",
    icon: Workflow,
  },
  {
    name: "Zapier Agents",
    description: "AI agents built on top of Zapier's 8,000+ app connections",
    category: "Automation",
    pricing: "Freemium",
    url: "https://zapier.com/agents",
    icon: Zap,
  },
  {
    name: "Lindy",
    description:
      "No-code AI agents for SMBs covering email management, CRM updates and lead routing",
    category: "Agents",
    pricing: "Paid",
    url: "https://lindy.ai",
    icon: Bot,
  },
  {
    name: "Claude Code",
    description:
      "Anthropic's agentic coding environment for building custom agents that write, run and deploy code",
    category: "Development",
    pricing: "Paid",
    url: "https://claude.ai/code",
    icon: Terminal,
  },
];

const workflows: WorkflowItem[] = [
  {
    name: "AI Lead Nurture",
    stack: ["Claude", "n8n", "CRM"],
    description:
      "Automatically follows up with leads based on what listings they viewed, adapting tone and content to their behavior.",
  },
  {
    name: "Weekly Market Report",
    stack: ["Claude", "MLS Export", "Notion"],
    description:
      "Pulls last week's MLS data every Monday and writes a client-ready market update into Notion automatically.",
  },
  {
    name: "Showing Feedback Emails",
    stack: ["Claude", "Gmail MCP"],
    description:
      "Drafts personalized showing feedback emails to sellers after each showing, ready to review and send in one click.",
  },
  {
    name: "Deal Pipeline Updater",
    stack: ["Claude", "HubSpot MCP", "Gmail"],
    description:
      "Reads incoming deal emails and automatically updates your CRM pipeline status and next-action tasks.",
  },
  {
    name: "Seller Outreach Sequences",
    stack: ["Claude", "n8n", "BatchData"],
    description:
      "Pulls motivated seller data, personalizes outreach copy per property, and queues messages for review.",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
      <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {children}
      </span>
    </div>
  );
}

const heroPills = ["No code required", "Works with any AI", "Real workflows"];

export default function AgentsPage() {
  useEffect(() => {
    document.title = "AI Agents for Real Estate — RealToolbox.ai";
    const meta =
      document.querySelector('meta[name="description"]') ??
      (() => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
        return m;
      })();
    meta.setAttribute(
      "content",
      "Agentic AI platforms and real-estate workflows — n8n, Make, Zapier Agents, Lindy, Claude Code and battle-tested agent recipes.",
    );
  }, []);

  return (
    <AppLayout>
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-16 lg:pt-24 pb-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            Agents
          </div>
          <h1 className="mt-5 font-display text-5xl lg:text-[64px] font-bold leading-[1.02] tracking-[-0.03em] text-foreground">
            Agentic AI for{" "}
            <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
              real estate
            </span>
          </h1>
          <p className="mt-6 text-[17px] lg:text-lg text-muted-foreground leading-[1.65] max-w-3xl">
            An AI agent doesn't just answer questions — it takes action. It watches for triggers,
            makes decisions, and completes multi-step tasks automatically. In real estate, that
            means leads followed up, reports written, deals analyzed and calendars managed — while
            you focus on closing.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {heroPills.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3.5 py-1.5 text-[12.5px] font-medium text-foreground/80"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Section 1 — platforms */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-16">
        <SectionLabel>Agent platforms</SectionLabel>
        <div className="flex flex-wrap justify-center gap-4 md:gap-5">
          {agentPlatforms.map((a) => (
            <div
              key={a.name}
              className="flex w-full md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-1.25rem*2)/3)]"
            >
              <AgentPlatformCard item={a} />
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 — workflows */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-20">
        <SectionLabel>Real estate agent workflows</SectionLabel>
        <div className="flex flex-wrap justify-center gap-4 md:gap-5">
          {workflows.map((w) => (
            <div key={w.name} className="flex w-full md:w-[calc((100%-1.25rem)/2)]">
              <WorkflowCard item={w} />
            </div>
          ))}
        </div>
      </section>

      {/* Submit callout */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.01] px-8 py-10 lg:px-12 lg:py-12 text-center">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/40 to-transparent" />
          <h2 className="font-display text-2xl lg:text-3xl font-bold tracking-[-0.02em] text-foreground">
            Running an agent workflow we should feature?
          </h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Share what's working in your business — we showcase the best every month.
          </p>
          <Link
            to="/submit"
            className="mt-6 inline-flex items-center gap-1.5 rounded-[10px] bg-foreground px-5 py-2.5 text-[13.5px] font-semibold text-background hover:bg-foreground/90 transition-base"
          >
            Tell us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}
