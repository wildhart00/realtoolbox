import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Browse", href: "/" },
  { name: "MCPs", href: "/category/mcps" },
  { name: "Skills", href: "/category/skills" },
  { name: "Blog", href: "/blog" },
  { name: "Newsletter", href: "/#newsletter" },
];

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNewsletter = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== "/") navigate("/#newsletter");
    else document.getElementById("newsletter")?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-foreground/[0.06] backdrop-blur-xl"
      style={{ background: "hsl(230 22% 5% / 0.9)" }}
    >
      <div className="mx-auto max-w-[1200px] flex items-center justify-between gap-4 h-[60px] px-6 lg:px-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-[9px] shrink-0">
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

        {/* Center nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((l) => {
            const active =
              l.href === "/"
                ? location.pathname === "/"
                : l.href.startsWith("/category")
                  ? false
                  : location.pathname.startsWith(l.href.replace("/#", "/"));
            const isNewsletter = l.href.includes("#newsletter");
            return (
              <Link
                key={l.name}
                to={l.href}
                onClick={isNewsletter ? handleNewsletter : undefined}
                className={cn(
                  "text-[13.5px] font-medium px-2.5 py-1.5 rounded-md transition-base",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]",
                )}
              >
                {l.name}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
            <span className="text-[11px] text-foreground/30">Updated weekly</span>
          </div>
          <Link
            to="/submit"
            className="bg-foreground text-background rounded-[9px] px-4 py-2 text-[13px] font-semibold hover:bg-foreground/90 transition-base"
          >
            Submit a Tool
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-foreground/[0.05]"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-foreground/[0.06] animate-fade-in">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.name}
                to={l.href}
                onClick={l.href.includes("#newsletter") ? handleNewsletter : () => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]"
              >
                {l.name}
              </Link>
            ))}
            <Link
              to="/submit"
              onClick={() => setOpen(false)}
              className="block mt-3 text-center bg-foreground text-background rounded-[9px] px-4 py-2 text-sm font-semibold"
            >
              Submit a Tool
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
