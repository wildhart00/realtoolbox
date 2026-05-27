import { ReactNode } from "react";
import { Topbar } from "./Topbar";
import { Footer } from "./Footer";

export function AppLayout({ children, hideSidebar: _hideSidebar }: { children: ReactNode; hideSidebar?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Topbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
