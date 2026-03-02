import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FontSizeProvider } from "./contexts/FontSizeContext";
import AuthModal from "./components/AuthModal";
import PWAInstallBanner from "./components/PWAInstallBanner";

// 페이지 로딩 스피너 (Suspense fallback)
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

// Lazy-loaded pages (첫 화면·404 제외)
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ExamList = lazy(() => import("./pages/ExamList"));
const ExamSession = lazy(() => import("./pages/ExamSession"));
const ExamResults = lazy(() => import("./pages/ExamResults"));
const ReviewPage = lazy(() => import("./pages/ReviewPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminQuestionsPage = lazy(() => import("./pages/AdminQuestionsPage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CertificationsPage = lazy(() => import("./pages/CertificationsPage"));
const BoardPage = lazy(() => import("./pages/BoardPage"));
const BoardDetailPage = lazy(() => import("./pages/BoardDetailPage"));
const BlogListPage = lazy(() => import("./pages/BlogListPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <FontSizeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AuthModal />
          <PWAInstallBanner />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<ProfilePage />} />
              <Route path="/certifications" element={<CertificationsPage />} />
              <Route path="/exams" element={<ExamList />} />
              <Route path="/session/:sessionId" element={<ExamSession />} />
              <Route path="/results/:sessionId" element={<ExamResults />} />
              <Route path="/review" element={<ReviewPage />} />
              <Route path="/board" element={<BoardPage />} />
              <Route path="/board/:id" element={<BoardDetailPage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/questions" element={<AdminQuestionsPage />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </FontSizeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
