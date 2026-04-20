import { Link, useLocation } from "react-router-dom";
import { Search, Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Tools", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "Members Hub", href: "/members" },
  { name: "Submit Tool", href: "/submit" },
];

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-accent shadow-glow">
            <Sparkles className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            RealToolbox<span className="text-accent">.ai</span>
          </span>
        </Link>

        <div className="hidden flex-1 max-w-xl mx-4 lg:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search 200+ AI tools for real estate..."
              className="h-10 pl-10 bg-muted/50 border-border/60 focus-visible:bg-background"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
              ⌘K
            </kbd>
          </div>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => {
            const active = location.pathname === l.href;
            return (
              <Link
                key={l.href}
                to={l.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-base",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l.name}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild variant="accent" size="sm">
            <Link to="/auth?mode=signup">Join Hub</Link>
          </Button>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((s) => !s)}
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted lg:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-background lg:hidden animate-fade-in">
          <div className="space-y-1 p-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search tools..." className="h-10 pl-10 bg-muted/50" />
            </div>
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {l.name}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild variant="accent" size="sm" className="flex-1">
                <Link to="/auth?mode=signup">Join Hub</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
