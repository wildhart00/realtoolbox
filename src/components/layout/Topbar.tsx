import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Heart, MessageSquare, Shield, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Browse", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "Newsletter", href: "/#newsletter" },
];

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const handleNewsletter = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== "/") navigate("/#newsletter");
    else document.getElementById("newsletter")?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initial = (user?.email ?? "U")[0].toUpperCase();

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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar className="h-8 w-8 cursor-pointer ring-1 ring-foreground/10 hover:ring-foreground/30 transition-base">
                  <AvatarFallback className="bg-gradient-accent text-[12px] font-semibold text-white">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate text-xs text-muted-foreground font-normal">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/members"><Heart className="h-4 w-4" /> Saved tools</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/members"><MessageSquare className="h-4 w-4" /> My reviews</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin"><Shield className="h-4 w-4" /> Admin</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/auth"
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-base px-2"
            >
              Sign in
            </Link>
          )}
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

            <div className="my-2 border-t border-foreground/[0.06]" />

            {user ? (
              <>
                <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</div>
                <Link to="/members" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
                  <Heart className="h-4 w-4" /> Saved tools
                </Link>
                <Link to="/members" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
                  <MessageSquare className="h-4 w-4" /> My reviews
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
                    <Shield className="h-4 w-4" /> Admin
                  </Link>
                )}
                <button onClick={() => { setOpen(false); handleSignOut(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
            )}

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
