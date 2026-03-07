import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FontSizeProvider } from "./contexts/FontSizeContext";
import AuthModal from "./components/AuthModal";
import PWAInstallBanner from "./components/PWAInstallBanner";

// 전역 에러 경계 — React 렌더링 오류를 잡아 빈 화면 대신 메시지 표시
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "sans-serif" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>페이지 로드 오류</h1>
          <p style={{ color: "#666", marginBottom: "0.5rem" }}>잠시 후 다시 시도하거나 캐시를 지워주세요.</p>
          <pre style={{ fontSize: "0.75rem", background: "#f4f4f4", padding: "1rem", borderRadius: "0.5rem", maxWidth: "600px", overflow: "auto" }}>
            {this.state.error?.message}
          </pre>
          <button
            style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#f97316", color: "#fff", border: "none", borderRadius: "0.375rem", cursor: "pointer" }}
            onClick={() => window.location.reload()}
          >
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
const DisclaimerPage = lazy(() => import("./pages/DisclaimerPage"));
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
  <ErrorBoundary>
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
                <Route element={<ProtectedRoute />}>
                  <Route path="/exams" element={<ExamList />} />
                </Route>
                <Route path="/session/:sessionId" element={<ExamSession />} />
                <Route path="/results/:sessionId" element={<ExamResults />} />
                <Route path="/review" element={<ReviewPage />} />
                <Route path="/board" element={<BoardPage />} />
                <Route path="/board/:id" element={<BoardDetailPage />} />
                <Route path="/blog" element={<BlogListPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
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
  </ErrorBoundary>
);

export default App;
