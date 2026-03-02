import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import ExamList from "./pages/ExamList";
import ExamSession from "./pages/ExamSession";
import ExamResults from "./pages/ExamResults";
import ReviewPage from "./pages/ReviewPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import AdminPage from "./pages/AdminPage";
import AdminQuestionsPage from "./pages/AdminQuestionsPage";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import CertificationsPage from "./pages/CertificationsPage";
import BoardPage from "./pages/BoardPage";
import BoardDetailPage from "./pages/BoardDetailPage";
import BlogListPage from "./pages/BlogListPage";
import BlogPostPage from "./pages/BlogPostPage";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FontSizeProvider } from "./contexts/FontSizeContext";
import AuthModal from "./components/AuthModal";

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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </FontSizeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
