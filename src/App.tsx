import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import PlacementDashboard from "./pages/dashboard/PlacementDashboard";
import CompanyDashboard from "./pages/dashboard/CompanyDashboard";
import Jobs from "./pages/dashboard/Jobs";
import StudentProfile from "./pages/dashboard/StudentProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            <Route path="/dashboard/placement" element={<PlacementDashboard />} />
            <Route path="/dashboard/company" element={<CompanyDashboard />} />
            <Route path="/dashboard/jobs" element={<Jobs />} />
            <Route path="/dashboard/profile" element={<StudentProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
