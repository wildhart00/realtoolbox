import { Plug } from "lucide-react";
import { Link } from "react-router-dom";

export function McpDifferentiatorCallout({ className = "" }: { className?: string }) {
  return (
    <div
      className={
        "rounded-2xl border border-[hsl(239_84%_67%)]/25 bg-gradient-to-br from-[hsl(239_84%_60%)]/8 via-foreground/[0.02] to-[hsl(265_84%_60%)]/8 px-5 py-4 sm:px-6 sm:py-5 flex items-start gap-4 " +
        className
      }
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(239_84%_60%)]/15 text-[hsl(229_94%_82%)]">
        <Plug className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.14em] text-[hsl(229_94%_82%)] font-semibold">
          MCP built-in
        </p>
        <p className="mt-1 text-[14px] text-foreground/90 leading-[1.6]">
          Your toolbox connects directly to Claude, ChatGPT, and other AI apps — so your skills load themselves,
          stay current automatically, and are always the real version. Copy-paste still works everywhere as a fallback.
        </p>
        {/*
          Points at the public /how-it-works, not /setup-guide. This callout renders
          on /toolbox and /toolbox/investor, both of which signed-out visitors reach
          — and /setup-guide redirects to signup, so the old link walked a browsing
          visitor straight into an auth wall.
        */}
        <Link
          to="/how-it-works#connect-your-toolbox"
          className="mt-2 inline-block text-[12.5px] font-semibold text-[hsl(229_94%_82%)] underline-offset-2 hover:underline"
        >
          How the connection works →
        </Link>
      </div>
    </div>
  );
}
