import { ReactNode } from "react";
import { Topbar } from "./Topbar";
import { CategorySidebar } from "./CategorySidebar";
import { Footer } from "./Footer";

export function AppLayout({ children, hideSidebar = false }: { children: ReactNode; hideSidebar?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Topbar />
      <div className="flex flex-1 mx-auto w-full max-w-[1400px]">
        {!hideSidebar && <CategorySidebar />}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
