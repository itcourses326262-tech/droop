import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { useEffect } from 'react';
import { BrowserRouter, MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { PREVIEW } from '@/lib/previewData';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import ProtectedRoute from '@/components/ProtectedRoute';
import Messages from '@/pages/Messages';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Professionals from '@/pages/Professionals';
import ProfessionalProfile from '@/pages/ProfessionalProfile';
import RequestDetails from '@/pages/RequestDetails';
import Admin from '@/pages/Admin';

// نسخة المعاينة (ملف واحد يُعرض داخل Claude أو يُفتح من الكمبيوتر) لا تعتمد على رابط الصفحة.
const Router = PREVIEW ? MemoryRouter : BrowserRouter;

function PreviewBanner() {
  const navigate = useNavigate();
  useEffect(() => {
    const go = (e) => navigate(e.detail);
    window.addEventListener('droob:navigate', go);
    return () => window.removeEventListener('droob:navigate', go);
  }, [navigate]);
  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] bg-[#0c1a19] text-white/85 text-xs text-center px-4 py-2" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}>
      نسخة معاينة — البيانات المعروضة أمثلة، وتسجيل الدخول والمراسلة يعملان في الموقع المنشور فقط.
    </div>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/pros" element={<Professionals />} />
      <Route path="/pros/:uid" element={<ProfessionalProfile />} />
      <Route path="/requests/:id" element={<RequestDetails />} />

      {/* صفحات تتطلب تسجيل الدخول */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:cid" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* لوحة الإدارة: للأدمن فقط (والقواعد في Firestore تمنع غيره على أي حال) */}
      <Route element={<ProtectedRoute requireAdmin />}>
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          {PREVIEW && <PreviewBanner />}
          <AuthenticatedApp />
          {PREVIEW && <div className="h-10 bg-[#0c1a19]" />}
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App