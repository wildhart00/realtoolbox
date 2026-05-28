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

  const blobs = [
    { color: base, top: "-20%", left: "-10%", size: "70%", anim: `${animId}-a`, dur: "22s" },
    { color: complement, top: "30%", left: "55%", size: "75%", anim: `${animId}-b`, dur: "26s" },
    { color: accent, top: "40%", left: "10%", size: "60%", anim: `${animId}-c`, dur: "19s" },
    { color: base, top: "-10%", left: "60%", size: "55%", anim: `${animId}-d`, dur: "24s" },
  ];

  return (
    <div
      className="h-[200px] rounded-2xl border border-foreground/[0.07] relative overflow-hidden flex items-center justify-center"
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
            opacity: 0.7,
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

      <div
        className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(10,11,15,0.6), transparent)" }}
      />

      <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-2xl">
        <ToolLogo
          domain={domain}
          name={tool.name}
          customUrl={tool.logo_url}
          size={96}
        />
      </div>
    </div>
  );
}
