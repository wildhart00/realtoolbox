import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import type { Tool } from "@/lib/types";
import { ToolLogo, domainFromUrl } from "@/components/tools/ToolLogo";
import { PricingBadge } from "@/components/tools/PricingBadge";

interface Props {
  tool: Pick<Tool, "slug" | "name" | "tagline" | "website_url" | "logo_url" | "pricing">;
  whyNote: string | null;
  refTag: string;
}

export function StackToolCard({ tool, whyNote, refTag }: Props) {
  return (
    <article className="surface-card rounded-2xl p-5 flex flex-col gap-4 h-full">
      <div className="flex items-start gap-3.5">
        <ToolLogo
          domain={domainFromUrl(tool.website_url)}
          name={tool.name}
          customUrl={tool.logo_url}
          size={44}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link
              to={`/tools/${tool.slug}`}
              className="font-display text-[16px] font-semibold text-foreground hover:text-[hsl(229_94%_82%)] transition-base truncate"
            >
              {tool.name}
            </Link>
            <PricingBadge pricing={tool.pricing} />
          </div>
          <p className="text-[13px] text-muted-foreground leading-[1.55] line-clamp-2">
            {tool.tagline}
          </p>
        </div>
      </div>

      {whyNote && (
        <blockquote className="relative rounded-xl bg-foreground/[0.03] border-l-2 border-[hsl(229_94%_82%)]/70 px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[hsl(229_94%_82%)]/80 mb-1.5">
            Why this one
          </div>
          <p className="text-[13.5px] text-foreground/80 leading-[1.65] whitespace-pre-line">
            {whyNote}
          </p>
        </blockquote>
      )}

      <div className="mt-auto flex items-center gap-2">
        <a
          href={`/go/${tool.slug}?ref=${refTag}`}
          target="_blank"
          rel="sponsored nofollow noopener"
          className="inline-flex items-center gap-1.5 bg-gradient-accent text-white rounded-[9px] px-4 py-2 text-[13px] font-semibold shadow-glow-indigo hover:opacity-95 transition-base"
        >
          Try {tool.name}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <Link
          to={`/tools/${tool.slug}`}
          className="text-[12.5px] text-muted-foreground hover:text-foreground transition-base px-2"
        >
          Full review →
        </Link>
      </div>
    </article>
  );
}
