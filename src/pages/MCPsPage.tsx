import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Target,
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  Calendar,
  FolderOpen,
  LayoutGrid,
  Zap,
  Slack,
  ArrowRight,
  Plug,
  MessageSquare,
  Download,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MCPCard, type MCPItem } from "@/components/mcps/MCPCard";

const realEstateMcps: MCPItem[] = [
  {
    name: "Real Estate MCP",
    description:
      "Search properties, rentals and home valuations across Zillow, Redfin and Realtor.com",
    category: "Property Data",
    difficulty: "Beginner",
    url: "https://apify.com/nexgendata/real-estate-mcp-server",
    icon: Home,
  },
  {
    name: "Redfin MCP",
    description:
      "Property search, price history, comparable sales and neighborhood analysis direct from Redfin",
    category: "Property Data",
    difficulty: "Beginner",
    url: "https://mcpservers.org/servers/apify-com-nexgendata-redfin-mcp-server",
    icon: Home,
  },
  {
    name: "BatchData MCP",
    description:
      "Property data, address verification, skip tracing, geocoding and advanced search via BatchData.io",
    category: "Prospecting",
    difficulty: "Intermediate",
    url: "https://batchdata.io",
    icon: Target,
  },
  {
    name: "Cotality MCP",
    description:
      "Property and location intelligence for underwriting, risk analysis and valuation workflows",
    category: "Analytics",
    difficulty: "Advanced",
    url: "https://cotality.com/platforms/mcp-server",
    icon: BarChart3,
  },
  {
    name: "RealVest MCP",
    description:
      "31 professional calculators including affordability, portfolio analysis, Monte Carlo simulations and tax optimization",
    category: "Investing",
    difficulty: "Beginner",
    url: "https://glama.ai/mcp/servers?query=realvest",
    icon: TrendingUp,
  },
  {
    name: "RealEstateCRM MCP",
    description:
      "Integrate CRM leads, contacts and deal pipeline directly into Claude conversations",
    category: "CRM",
    difficulty: "Intermediate",
    url: "https://smithery.ai/server/@recrmio/recrmio-mcp-server",
    icon: Users,
  },
];

const stackMcps: MCPItem[] = [
  {
    name: "Gmail",
    description: "Read, draft and send emails without leaving Claude",
    category: "Communication",
    difficulty: "Beginner",
    url: "https://claude.ai/settings",
    icon: Mail,
  },
  {
    name: "Google Calendar",
    description: "Schedule showings, set reminders and manage appointments",
    category: "Productivity",
    difficulty: "Beginner",
    url: "https://claude.ai/settings",
    icon: Calendar,
  },
  {
    name: "Google Drive",
    description: "Access contracts, marketing materials and documents",
    category: "Storage",
    difficulty: "Beginner",
    url: "https://claude.ai/settings",
    icon: FolderOpen,
  },
  {
    name: "Notion",
    description: "Manage deal pipelines, client notes and property databases",
    category: "Organization",
    difficulty: "Beginner",
    url: "https://claude.ai/settings",
    icon: LayoutGrid,
  },
  {
    name: "HubSpot",
    description: "CRM contacts, deals and pipeline management inside Claude",
    category: "CRM",
    difficulty: "Intermediate",
    url: "https://claude.ai/settings",
    icon: Users,
  },
  {
    name: "Zapier",
    description: "Connect Claude to 8,000+ apps without writing any code",
    category: "Automation",
    difficulty: "Beginner",
    url: "https://claude.ai/settings",
    icon: Zap,
  },
  {
    name: "n8n",
    description: "Visual workflow automation with a built-in AI agent builder",
    category: "Automation",
    difficulty: "Intermediate",
    url: "https://n8n.io",
    icon: Zap,
  },
  {
    name: "Slack",
    description: "Team communication and deal notifications from inside Claude",
    category: "Communication",
    difficulty: "Beginner",
    url: "https://claude.ai/settings",
    icon: Slack,
  },
];

const steps = [
  {
    n: "1",
    title: "Install an MCP server",
    blurb: "Grab a server from the directory below — a one-time setup per tool.",
    icon: Download,
  },
  {
    n: "2",
    title: "Connect it to Claude",
    blurb: "Add the connection in Claude's settings. Auth once, stay connected.",
    icon: Plug,
  },
  {
    n: "3",
    title: "Talk to your tools in plain English",
    blurb: "Ask Claude to read, write or take action. No copy-paste, no tab-switching.",
    icon: MessageSquare,
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

export default function MCPsPage() {
  useEffect(() => {
    document.title = "MCPs for Real Estate — RealToolbox.ai";
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
      "A curated directory of MCP servers for real estate — connect Claude to property data, CRMs, email, calendars and your existing stack.",
    );
  }, []);

  return (
    <AppLayout>
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-16 lg:pt-24 pb-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            MCP Directory
          </div>
          <h1 className="mt-5 font-display text-5xl lg:text-[64px] font-bold leading-[1.02] tracking-[-0.03em] text-foreground">
            Connect Claude to{" "}
            <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
              anything
            </span>
          </h1>
          <p className="mt-6 text-[17px] lg:text-lg text-muted-foreground leading-[1.65] max-w-3xl">
            MCP stands for Model Context Protocol — an open standard created by Anthropic. Think of
            it as USB-C for AI. Once you install an MCP server for a tool, Claude can read from it,
            write to it, and take actions inside it — all in plain English. No copy-paste. No
            tab-switching. Just ask.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-20">
        <div className="grid gap-4 md:gap-5 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.n}
                className="relative rounded-2xl p-6 surface-card"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-accent text-[12px] font-bold text-white">
                    {s.n}
                  </span>
                  <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                </div>
                <div className="text-[15px] font-semibold text-foreground leading-tight">
                  {s.title}
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground leading-[1.6]">{s.blurb}</p>

                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 1 */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-16">
        <SectionLabel>Purpose-built for real estate</SectionLabel>
        <div className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {realEstateMcps.map((m) => (
            <MCPCard key={m.name} item={m} />
          ))}
        </div>
      </section>

      {/* Section 2 */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-20">
        <SectionLabel>Connect your existing stack</SectionLabel>
        <div className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {stackMcps.map((m) => (
            <MCPCard key={m.name} item={m} />
          ))}
        </div>
      </section>

      {/* Submit callout */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.01] px-8 py-10 lg:px-12 lg:py-12 text-center">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/40 to-transparent" />
          <h2 className="font-display text-2xl lg:text-3xl font-bold tracking-[-0.02em] text-foreground">
            Know an MCP we missed?
          </h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Help us keep this list sharp. Submissions reviewed weekly.
          </p>
          <Link
            to="/submit"
            className="mt-6 inline-flex items-center gap-1.5 rounded-[10px] bg-foreground px-5 py-2.5 text-[13.5px] font-semibold text-background hover:bg-foreground/90 transition-base"
          >
            Submit it <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}
