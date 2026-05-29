import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wrench,
  Inbox,
  FileText,
  Star,
  Folder,
  BarChart3,
  Mail,
  RefreshCw,
  ShieldAlert,
  DollarSign,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Tools", url: "/admin/tools", icon: Wrench },
  { title: "Submissions", url: "/admin/submissions", icon: Inbox },
  { title: "Affiliates", url: "/admin/affiliates", icon: DollarSign },
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
  { title: "Categories", url: "/admin/categories", icon: Folder },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Subscribers", url: "/admin/subscribers", icon: Mail },
  { title: "Maintenance", url: "/admin/maintenance", icon: RefreshCw },
];

function AdminSidebar() {
  const { pathname } = useLocation();
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.end
                  ? pathname === item.url
                  : pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.url} end={item.end}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  if (loading || isAdmin === null) {
    return (
      <AppLayout>
        <div className="px-6 py-24 text-center text-sm text-muted-foreground">Loading...</div>
      </AppLayout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-semibold">Admin only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need an admin role to view this page.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SidebarProvider>
        <div className="flex w-full min-h-[calc(100vh-4rem)]">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground">Admin</span>
            </div>
            <div className="flex-1 p-6 overflow-x-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </AppLayout>
  );
}
