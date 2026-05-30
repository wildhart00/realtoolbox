import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Hero({ toolCount }: { toolCount: number }) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  };

  return (
    <section className="px-6 lg:px-10 pt-[88px] pb-14 text-center mx-auto" style={{ maxWidth: 780 }}>
      <div className="inline-flex items-center gap-2 bg-accent/[0.08] border border-accent/20 rounded-full px-3.5 py-[5px] mb-[26px]">
        <span className="h-[5px] w-[5px] rounded-full bg-[hsl(229_94%_82%)]" />
        <span className="text-[12px] text-[hsl(229_94%_82%)] font-medium">
          {toolCount} curated tools — updated weekly
        </span>
      </div>

      <h1
        className="font-display font-bold text-foreground mb-[18px]"
        style={{ fontSize: "clamp(38px, 6vw, 62px)", lineHeight: 1.08, letterSpacing: "-0.03em" }}
      >
        The AI toolkit built
        <br />
        <span className="italic text-[hsl(229_94%_82%)]">for real estate pros</span>
      </h1>

      <p className="text-[16px] text-muted-foreground leading-[1.65] mx-auto" style={{ maxWidth: 520 }}>
        Curated tools for agents, investors, property managers, and deal makers — plus the best general AI tools any pro should know about.
      </p>

      <form onSubmit={submit} className="relative mt-9 mx-auto" style={{ maxWidth: 520 }}>
        <button
          type="submit"
          aria-label="Search"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-base"
        >
          <Search className="h-[17px] w-[17px]" />
        </button>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search tools, categories, use cases…"
          className={`w-full bg-foreground/[0.05] border border-foreground/20 rounded-xl py-[14px] text-[15px] text-foreground placeholder:text-foreground/50 outline-none focus:border-accent/40 transition-base ${
            value ? "pl-[46px] pr-5 text-left" : "px-[46px] text-center"
          }`}
        />
      </form>
    </section>
  );
}
