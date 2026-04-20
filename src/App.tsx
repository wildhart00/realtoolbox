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
import MembersPage from "./pages/MembersPage.tsx";
import BlogPage from "./pages/BlogPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SearchProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/tools/:slug" element={<ToolDetailPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPage />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SearchProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
