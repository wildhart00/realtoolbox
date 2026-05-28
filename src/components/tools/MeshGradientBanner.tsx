import { useState } from "react";
import { ToolLogo, domainFromUrl } from "@/components/tools/ToolLogo";
import { getBrandPalette } from "@/lib/brandColor";
import type { Tool } from "@/lib/types";

interface Props {
  tool: Tool;
}

export function MeshGradientBanner({ tool }: Props) {
  const domain = domainFromUrl(tool.website_url);
  const { base, complement, accent } = getBrandPalette(domain);
  const gridId = `grid-${tool.id}`;
  const animId = `mesh-${tool.id.replace(/[^a-z0-9]/gi, "")}`;
  const [shotFailed, setShotFailed] = useState(false);

  const shotUrl = domain
    ? `https://s.wordpress.com/mshots/v1/${encodeURIComponent(
        `https://${domain}`,
      )}?w=1600&h=900`
    : null;

  const blobs = [
    { color: base, top: "-20%", left: "-10%", size: "70%", anim: `${animId}-a`, dur: "22s" },
    { color: complement, top: "30%", left: "55%", size: "75%", anim: `${animId}-b`, dur: "26s" },
    { color: accent, top: "40%", left: "10%", size: "60%", anim: `${animId}-c`, dur: "19s" },
    { color: base, top: "-10%", left: "60%", size: "55%", anim: `${animId}-d`, dur: "24s" },
  ];

  const showScreenshot = shotUrl && !shotFailed;

  return (
    <div
      className="h-[220px] sm:h-[280px] lg:h-[340px] rounded-2xl border border-foreground/[0.07] relative overflow-hidden flex items-center justify-center"
      style={{ background: "#0a0b0f" }}
    >
      <style>{`
        @keyframes ${animId}-a { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,30px) scale(1.15)} }
        @keyframes ${animId}-b { 0%,100%{transform:translate(0,0) scale(1.1)} 50%{transform:translate(-50px,-20px) scale(0.95)} }
        @keyframes ${animId}-c { 0%,100%{transform:translate(0,0) scale(0.95)} 50%{transform:translate(30px,-40px) scale(1.1)} }
        @keyframes ${animId}-d { 0%,100%{transform:translate(0,0) scale(1.05)} 50%{transform:translate(-30px,40px) scale(0.9)} }
        @media (prefers-reduced-motion: reduce) {
          .${animId}-blob { animation: none !important; }
        }
      `}</style>

      {blobs.map((b, i) => (
        <div
          key={i}
          className={`${animId}-blob absolute rounded-full pointer-events-none`}
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            background: b.color,
            opacity: showScreenshot ? 0.5 : 0.7,
            filter: "blur(60px)",
            animation: `${b.anim} ${b.dur} ease-in-out infinite`,
            willChange: "transform",
          }}
        />
      ))}

      <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={gridId} width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gridId})`} />
      </svg>

      {showScreenshot ? (
        <div className="relative z-10 w-[88%] max-w-[760px] aspect-[16/9] rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          {/* Browser chrome */}
          <div className="absolute top-0 inset-x-0 h-6 bg-[#1a1b22] border-b border-white/10 flex items-center px-3 gap-1.5 z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-[10px] text-white/40 truncate">{domain}</span>
          </div>
          <img
            src={shotUrl}
            alt={`${tool.name} website screenshot`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-top pt-6 bg-white"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth < 50) {
                // mShots placeholder — retry once
                setTimeout(() => {
                  img.src = shotUrl + `&cb=${Date.now()}`;
                }, 2500);
              }
            }}
            onError={() => setShotFailed(true)}
          />
          {/* Logo badge */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-md rounded-lg pl-1.5 pr-3 py-1.5 border border-white/10">
            <ToolLogo domain={domain} name={tool.name} customUrl={tool.logo_url} size={28} />
            <span className="text-[12px] font-semibold text-white">{tool.name}</span>
          </div>
        </div>
      ) : (
        <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-2xl">
          <ToolLogo domain={domain} name={tool.name} customUrl={tool.logo_url} size={96} />
        </div>
      )}
    </div>
  );
}
