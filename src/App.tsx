import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/common/ScrollToTop";

import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

/* Pages */
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import PCOSModule from "./pages/PCOSModule";
import MenstrualModule from "./pages/MenstrualModule";
import MenopauseModule from "./pages/MenopauseModule";
import Chatbot from "./pages/Chatbot";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Doctors from "./pages/Doctors";
import Schemes from "./pages/Schemes";
import HealthResources from "./pages/HealthResources";
import Hygiene from "./pages/Hygiene";
import Education from "./pages/Education";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

/* Admin Pages */
import AdminIndex from "./pages/admin/AdminIndex";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminResourcesPage from "./pages/admin/AdminResourcesPage";
import AdminSchemesPage from "./pages/admin/AdminSchemesPage";
import AdminNGOsPage from "./pages/admin/AdminNGOsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        {/* ✅ AUTO SCROLL TO TOP ON PAGE CHANGE */}
        <ScrollToTop />

        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/modules" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
            <Route path="/modules/pcos" element={<ProtectedRoute><PCOSModule /></ProtectedRoute>} />
            <Route path="/modules/menstrual" element={<ProtectedRoute><MenstrualModule /></ProtectedRoute>} />
            <Route path="/modules/menopause" element={<ProtectedRoute><MenopauseModule /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
            <Route path="/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />

            <Route path="/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
            <Route path="/health-resources" element={<ProtectedRoute><HealthResources /></ProtectedRoute>} />
            <Route path="/hygiene" element={<ProtectedRoute><Hygiene /></ProtectedRoute>} />
            <Route path="/education" element={<ProtectedRoute><Education /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminIndex /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/resources" element={<ProtectedRoute requireAdmin><AdminResourcesPage /></ProtectedRoute>} />
            <Route path="/admin/schemes" element={<ProtectedRoute requireAdmin><AdminSchemesPage /></ProtectedRoute>} />
            <Route path="/admin/ngos" element={<ProtectedRoute requireAdmin><AdminNGOsPage /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
