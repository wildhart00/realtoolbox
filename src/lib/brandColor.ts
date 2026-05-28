// Deterministic brand color for tool banners.
// Known brand colors take priority; unknown domains hash to a vibrant HSL.

const BRAND_COLORS: Record<string, string> = {
  "bardeen.ai": "#FF6B6B",
  "jasper.ai": "#6C5CE7",
  "canva.com": "#00C4CC",
  "notion.so": "#000000",
  "figma.com": "#F24E1E",
  "openai.com": "#10A37F",
  "anthropic.com": "#D97757",
  "midjourney.com": "#0099E5",
  "runwayml.com": "#7C3AED",
  "perplexity.ai": "#20808D",
  "loom.com": "#625DF5",
  "linear.app": "#5E6AD2",
  "slack.com": "#4A154B",
  "zapier.com": "#FF4A00",
  "airtable.com": "#FCB400",
  "webflow.com": "#4353FF",
  "framer.com": "#0055FF",
  "vercel.com": "#000000",
  "supabase.com": "#3ECF8E",
  "github.com": "#24292E",
  "stripe.com": "#635BFF",
  "shopify.com": "#96BF48",
  "hubspot.com": "#FF7A59",
  "mailchimp.com": "#FFE01B",
  "intercom.com": "#1F8DED",
  "calendly.com": "#006BFF",
  "typeform.com": "#262627",
  "adcreative.ai": "#FF3D7F",
  "copy.ai": "#7C3AED",
  "writesonic.com": "#9333EA",
};

function normalize(domain: string): string {
  return domain.toLowerCase().replace(/^www\./, "");
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const c = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getBrandColor(domain?: string | null): string {
  if (!domain) return "#4f46e5";
  const key = normalize(domain);
  if (BRAND_COLORS[key]) return BRAND_COLORS[key];
  const root = key.split(".")[0] || key;
  if (BRAND_COLORS[root]) return BRAND_COLORS[root];

  const h = hash(key) % 360;
  const s = 70 + (hash(key + "s") % 21); // 70-90
  const l = 45 + (hash(key + "l") % 21); // 45-65
  return hslToHex(h, s, l);
}

function hexToHsl(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

export function getBrandPalette(domain?: string | null): {
  base: string;
  complement: string;
  accent: string;
} {
  const base = getBrandColor(domain);
  const [h] = hexToHsl(base);
  const s = 80;
  const l = 58;
  return {
    base,
    complement: hslToHex((h + 180) % 360, s, l),
    accent: hslToHex((h + 40) % 360, s, l),
  };
}
