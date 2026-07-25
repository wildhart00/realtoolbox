import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { SearchProvider } from "@/hooks/useSearch";
import Index from "./pages/Index.tsx";
import BrowsePage from "./pages/BrowsePage.tsx";
import NotFound from "./pages/NotFound.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import SpecialtyPage from "./pages/SpecialtyPage.tsx";
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
import IntegrationsPage from "./pages/IntegrationsPage.tsx";
import IntegrationsAdmin from "./pages/admin/IntegrationsAdmin.tsx";
import SkillsAdmin from "./pages/admin/SkillsAdmin.tsx";
import { Navigate } from "react-router-dom";
import AgentsPage from "./pages/AgentsPage.tsx";
import ResourcesPage from "./pages/ResourcesPage.tsx";
import GlossaryPage from "./pages/resources/GlossaryPage.tsx";
import VerifyingCompsPage from "./pages/resources/VerifyingCompsPage.tsx";
import OfferChecklistPage from "./pages/resources/OfferChecklistPage.tsx";
import HowItWorksPage from "./pages/HowItWorksPage.tsx";

import SkillDetailPage from "./pages/SkillDetailPage.tsx";
import ToolboxIndexPage from "./pages/ToolboxIndexPage.tsx";
import InvestorToolboxPage from "./pages/InvestorToolboxPage.tsx";
import AgentToolboxPage from "./pages/AgentToolboxPage.tsx";
import SkillsSlugRedirect from "./pages/SkillsSlugRedirect.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";
import TermsPage from "./pages/TermsPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import ContactMessagesAdmin from "./pages/admin/ContactMessagesAdmin.tsx";
import { ScrollToTop } from "./components/ScrollToTop.tsx";
import WelcomePage from "./pages/WelcomePage.tsx";
import SetupGuidePage from "./pages/SetupGuidePage.tsx";
import OAuthConsentPage from "./pages/OAuthConsentPage.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import StackPage from "./pages/StackPage.tsx";
import StacksAdmin from "./pages/admin/StacksAdmin.tsx";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <SearchProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/specialty/:slug" element={<SpecialtyPage />} />
              <Route path="/tools/:slug" element={<ToolDetailPage />} />
              <Route path="/go/:slug" element={<GoRedirectPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/mcps" element={<Navigate to="/integrations" replace />} />
              <Route path="/toolbox" element={<ToolboxIndexPage />} />
              <Route path="/toolbox/investor" element={<InvestorToolboxPage />} />
              <Route path="/toolbox/agent" element={<AgentToolboxPage />} />
              <Route path="/toolbox/:slug" element={<SkillDetailPage />} />
              <Route path="/skills" element={<Navigate to="/toolbox" replace />} />
              <Route path="/skills/:slug" element={<SkillsSlugRedirect />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/resources/glossary" element={<GlossaryPage />} />
              <Route path="/resources/verifying-comps" element={<VerifyingCompsPage />} />
              <Route path="/resources/offer-checklist" element={<OfferChecklistPage />} />

              {/*
                Stacks are UNPUBLISHED, not removed. The routes, pages, admin screens,
                and stack data all stay live and working — they're just not linked from
                the topbar, footer, homepage, or sitemap, because the curated stacks
                overlapped confusingly with the tool directory and pulled attention away
                from the toolbox narrative. Re-enable by restoring the nav entries in
                Topbar.tsx / Footer.tsx, dropping <StacksHomeStrip /> back into Index.tsx,
                and re-adding the two /stacks URLs to public/sitemap.xml.
              */}
              <Route path="/stacks/investor" element={<StackPage kind="investor" />} />
              <Route path="/stacks/agent" element={<StackPage kind="agent" />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/setup-guide" element={<SetupGuidePage />} />
              <Route path="/.lovable/oauth/consent" element={<OAuthConsentPage />} />
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
                <Route path="contact-messages" element={<ContactMessagesAdmin />} />
                <Route path="integrations" element={<IntegrationsAdmin />} />
                <Route path="skills" element={<SkillsAdmin />} />
                <Route path="stacks" element={<StacksAdmin />} />
              </Route>
              <Route path="/setup-admin" element={<SetupAdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SearchProvider>
        </AuthProvider>
      </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
