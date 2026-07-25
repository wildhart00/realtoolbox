import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Plug } from "lucide-react";
import { toast } from "sonner";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
export const MCP_URL = projectRef
  ? `https://${projectRef}.supabase.co/functions/v1/mcp`
  : "";

type Variant = "full" | "compact";

/**
 * `showWalkthroughLink` exists because this block renders in two very different
 * contexts. On signed-in surfaces (members, welcome, the setup guide itself) the
 * deep link into the full gated walkthrough is useful. On the public
 * /how-it-works page it isn't: the reader is already on the public explanation,
 * and /setup-guide would bounce them to signup.
 */
export function ConnectMcpBlock({
  variant = "full",
  showWalkthroughLink = true,
}: {
  variant?: Variant;
  showWalkthroughLink?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!MCP_URL) return;
    try {
      await navigator.clipboard.writeText(MCP_URL);
      setCopied(true);
      toast.success("MCP URL copied.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Couldn't copy. Select and copy manually.");
    }
  }

  const compact = variant === "compact";

  return (
    <div
      className={
        "rounded-2xl border border-foreground/10 bg-gradient-to-br from-[hsl(239_84%_60%)]/8 via-foreground/[0.02] to-[hsl(265_84%_60%)]/8 " +
        (compact ? "p-5" : "p-6 lg:p-7")
      }
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[hsl(229_94%_82%)] font-semibold">
        <Plug className="h-3.5 w-3.5" />
        Connect to Claude &amp; ChatGPT
      </div>
      <h3
        className={
          "mt-3 font-display text-foreground tracking-tight leading-tight " +
          (compact ? "text-[20px]" : "text-[22px] lg:text-[26px]")
        }
      >
        Plug your toolbox straight into your AI.
      </h3>
      <p className="mt-2 text-[13.5px] text-muted-foreground leading-[1.65]">
        Your skills load themselves and stay current automatically — no copying, no re-pasting.
        Works with Claude Desktop, ChatGPT apps, Cursor, Windsurf, and any MCP-capable client.
      </p>

      <div className="mt-4">
        <label className="block text-[11px] uppercase tracking-[0.14em] text-foreground/50 font-semibold mb-1.5">
          Your RealToolbox MCP URL
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            readOnly
            value={MCP_URL}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 min-w-0 rounded-[10px] border border-foreground/15 bg-background/60 px-3 py-2.5 text-[13px] font-mono text-foreground/85 focus:outline-none focus:border-[hsl(239_84%_67%)]/50"
          />
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy URL"}
          </button>
        </div>
      </div>

      {showWalkthroughLink && (
        <div className="mt-4">
          <Link
            to="/setup-guide#connect-your-toolbox-via-mcp"
            className="text-[13px] font-semibold text-[hsl(229_94%_82%)] underline-offset-2 hover:underline"
          >
            See the connect walkthrough →
          </Link>
        </div>
      )}
    </div>
  );
}
