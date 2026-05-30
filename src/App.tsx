import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { SearchProvider } from "@/hooks/useSearch";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import ToolDetailPage from "./pages/ToolDetailPage.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.tsx";
import SubmitPage from "./pages/SubmitPage.tsx";
import BlogPage from "./pages/BlogPage.tsx";
import GoRedirectPage from "./pages/GoRedirectPage.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import ToolsAdmin from "./pages/admin/ToolsAdmin.tsx";
import SubmissionsAdmin from "./pages/admin/SubmissionsAdmin.tsx";
import BlogAdmin from "./pages/admin/BlogAdmin.tsx";
import ReviewsAdmin from "./pages/admin/ReviewsAdmin.tsx";
import CategoriesAdmin from "./pages/admin/CategoriesAdmin.tsx";
import AnalyticsAdmin from "./pages/admin/AnalyticsAdmin.tsx";
import SubscribersAdmin from "./pages/admin/SubscribersAdmin.tsx";
import MaintenanceAdmin from "./pages/admin/MaintenanceAdmin.tsx";
import AffiliatesAdmin from "./pages/admin/AffiliatesAdmin.tsx";
import SetupAdminPage from "./pages/SetupAdminPage.tsx";
import ComingSoonPage from "./pages/ComingSoonPage.tsx";
import { ScrollToTop } from "./components/ScrollToTop.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <SearchProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/tools/:slug" element={<ToolDetailPage />} />
              <Route path="/go/:slug" element={<GoRedirectPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPage />} />
              <Route path="/mcps" element={<ComingSoonPage />} />
              <Route path="/skills" element={<ComingSoonPage />} />
              <Route path="/agents" element={<ComingSoonPage />} />
              <Route path="/resources" element={<ComingSoonPage />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="tools" element={<ToolsAdmin />} />
                <Route path="submissions" element={<SubmissionsAdmin />} />
                <Route path="affiliates" element={<AffiliatesAdmin />} />
                <Route path="blog" element={<BlogAdmin />} />
                <Route path="reviews" element={<ReviewsAdmin />} />
                <Route path="categories" element={<CategoriesAdmin />} />
                <Route path="analytics" element={<AnalyticsAdmin />} />
                <Route path="subscribers" element={<SubscribersAdmin />} />
                <Route path="maintenance" element={<MaintenanceAdmin />} />
              </Route>
              <Route path="/setup-admin" element={<SetupAdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SearchProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
