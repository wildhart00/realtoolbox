import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-foreground/[0.06] mt-auto">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <span className="font-display text-base font-bold text-foreground/40">
          RealToolbox<span className="text-[hsl(229_94%_82%)]/60">.ai</span>
        </span>
        <p className="text-[12px] text-foreground/30 max-w-md">
          Curated for real estate professionals. No sponsored listings.
        </p>
        <nav className="flex gap-5 text-[12px] text-foreground/30">
          <Link to="/privacy" className="hover:text-foreground/60 transition-base">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground/60 transition-base">Terms</Link>
          <a href="mailto:hello@realtoolbox.ai" className="hover:text-foreground/60 transition-base">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
