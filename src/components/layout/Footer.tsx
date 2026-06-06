import { Link } from "react-router-dom";
import { NewsletterCard } from "@/components/home/NewsletterCard";

const quickLinks = [
  { name: "Skills", href: "/skills" },
  { name: "Resources", href: "/resources" },
  { name: "Blog", href: "/blog" },
];

const byStage = [
  { name: "First Deal", href: "/skills" },
  { name: "Actively Investing", href: "/skills" },
  { name: "Scaling", href: "/skills" },
];

const linkClass =
  "text-[13px] text-foreground/55 hover:text-[hsl(229_94%_82%)] transition-base";

const headerClass =
  "text-[11px] font-semibold tracking-[0.14em] uppercase text-foreground/40 mb-4";

export function Footer() {
  return (
    <footer className="border-t border-foreground/[0.06] mt-auto">
      {/* Section 1: Newsletter band */}
      <div>
        <NewsletterCard source="newsletter" />
      </div>

      {/* Section 2: 3-column links */}
      <div className="border-t border-foreground/[0.06] mx-auto max-w-[1200px] px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-[9px]">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-accent">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
              </div>
              <span className="font-display text-[17px] font-bold text-foreground tracking-[-0.02em]">
                RealToolbox<span className="text-[hsl(229_94%_82%)]">.ai</span>
              </span>
            </Link>
            <p className="mt-4 text-[13px] text-foreground/50 leading-[1.65] max-w-[280px]">
              The AI toolkit built for real estate investors and operators — workflows drawn from real flipping and rental experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={headerClass}>Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className={linkClass}>{l.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* By Stage */}
          <div>
            <h3 className={headerClass}>By Stage</h3>
            <ul className="space-y-2.5">
              {byStage.map((l) => (
                <li key={l.name}>
                  <Link to={l.href} className={linkClass}>{l.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>


      {/* Section 3: Legal bar */}
      <div className="border-t border-foreground/[0.06]">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-foreground/35">
            © 2026 RealToolbox.ai. All rights reserved.
          </p>
          <nav className="flex items-center gap-2 text-[12px] text-foreground/35">
            <Link to="/privacy" className="hover:text-[hsl(229_94%_82%)] transition-base">Privacy Policy</Link>
            <span className="text-foreground/20">·</span>
            <Link to="/terms" className="hover:text-[hsl(229_94%_82%)] transition-base">Terms of Service</Link>
            <span className="text-foreground/20">·</span>
            <Link to="/contact" className="hover:text-[hsl(229_94%_82%)] transition-base">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
