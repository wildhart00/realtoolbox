import { useState } from "react";
import { Link } from "react-router-dom";
import type { Tool } from "@/lib/types";
import { ToolLogo, domainFromUrl } from "./ToolLogo";
import { PricingBadge } from "./PricingBadge";
import { getBrandPalette } from "@/lib/brandColor";

type Stage = "screenshot" | "hero" | "mshots" | "fallback";

function ToolScreenshot({ tool }: { tool: Tool }) {
  const domain = domainFromUrl(tool.website_url);
  const initial: Stage = tool.screenshot_url
    ? "screenshot"
    : tool.hero_image_url
      ? "hero"
      : tool.website_url
        ? "mshots"
        : "fallback";
  const [stage, setStage] = useState<Stage>(initial);

  const advance = () => {
    setStage((s) =>
      s === "screenshot"
        ? tool.hero_image_url
          ? "hero"
          : tool.website_url
            ? "mshots"
            : "fallback"
        : s === "hero"
          ? tool.website_url
            ? "mshots"
            : "fallback"
          : "fallback",
    );
  };

  if (stage === "fallback") {
    const { base, complement, accent } = getBrandPalette(domain);
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: "#0a0b0f" }}
      >
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: "-20%",
            left: "-10%",
            width: "70%",
            height: "70%",
            background: base,
            opacity: 0.7,
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: "20%",
            left: "55%",
            width: "70%",
            height: "70%",
            background: complement,
            opacity: 0.6,
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: "40%",
            left: "10%",
            width: "55%",
            height: "55%",
            background: accent,
            opacity: 0.5,
            filter: "blur(50px)",
          }}
        />
        <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-xl p-2 shadow-xl">
          <ToolLogo domain={domain} name={tool.name} customUrl={tool.logo_url} size={48} />
        </div>
      </div>
    );
  }

  const src =
    stage === "screenshot"
      ? tool.screenshot_url!
      : stage === "hero"
        ? tool.hero_image_url!
        : `https://s.wordpress.com/mshots/v1/${encodeURIComponent(
            tool.website_url.startsWith("http") ? tool.website_url : `https://${tool.website_url}`,
          )}?w=1280&h=720`;

  return (
    <img
      src={src}
      alt={`${tool.name} screenshot`}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover object-top bg-[#0a0b0f] group-hover:scale-[1.03] transition-transform duration-500 ease-out"
      onLoad={(e) => {
        if (stage === "mshots") {
          const img = e.currentTarget;
          if (img.naturalWidth > 0 && img.naturalWidth < 50) {
            setTimeout(() => {
              if (img.isConnected) img.src = src + `&cb=${Date.now()}`;
            }, 2500);
          }
        }
      }}
      onError={advance}
    />
  );
}

export function ToolCard({ tool, isSaved: _isSaved }: { tool: Tool; isSaved?: boolean }) {
  const domain = domainFromUrl(tool.website_url);
  const category = tool.categories?.[0];

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group block rounded-2xl overflow-hidden surface-card hover:surface-card-hover hover:-translate-y-0.5 transition-base"
    >
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#0a0b0f]">
        <ToolScreenshot tool={tool} />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0a0b0f]/90 via-[#0a0b0f]/30 to-transparent pointer-events-none" />
      </div>

      <div className="px-[18px] pt-[14px] pb-[18px]">
        <div className="flex items-start gap-[10px] mb-[10px]">
          <ToolLogo domain={domain} name={tool.name} customUrl={tool.logo_url} size={32} />
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold text-foreground leading-tight truncate">
              {tool.name}
            </div>
            {category && (
              <div className="text-[11px] text-foreground/40 mt-0.5 truncate">{category.name}</div>
            )}
          </div>
          <PricingBadge pricing={tool.pricing} />
        </div>

        <p className="text-[12.5px] text-muted-foreground leading-[1.55] mb-[12px] line-clamp-2 min-h-[36px]">
          {tool.tagline}
        </p>

        <div className="flex flex-wrap gap-[5px] items-center">
          {tool.tags?.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] px-[7px] py-[2px] rounded bg-foreground/[0.05] text-foreground/40 font-medium"
            >
              {t}
            </span>
          ))}
          {!tool.re_only && (
            <span className="text-[10px] px-[7px] py-[2px] rounded bg-accent/10 text-[hsl(229_94%_82%)] font-medium border border-accent/20">
              General use
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
