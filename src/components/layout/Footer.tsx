import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent">
                <Sparkles className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-bold">RealToolbox<span className="text-accent">.ai</span></span>
            </Link>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              The premium directory of AI tools built for real estate professionals.
              Discover, compare, and adopt the tech that closes more deals.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">Browse Tools</Link></li>
              <li><Link to="/submit" className="hover:text-foreground">Submit a Tool</Link></li>
              <li><Link to="/members" className="hover:text-foreground">Members Hub</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
              <li><a href="#" className="hover:text-foreground">Newsletter</a></li>
              <li><a href="#" className="hover:text-foreground">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RealToolbox.ai — Built for the future of real estate.
          </p>
          <p className="text-xs text-muted-foreground">
            Some links are affiliate. We only recommend tools we'd use ourselves.
          </p>
        </div>
      </div>
    </footer>
  );
}
