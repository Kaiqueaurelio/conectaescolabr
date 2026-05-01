import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import TeacherDashboard from "./pages/TeacherDashboard.tsx";
import StudentDashboard from "./pages/StudentDashboard.tsx";
import ParentDashboard from "./pages/ParentDashboard.tsx";
import Attendance from "./pages/Attendance.tsx";
import Agenda from "./pages/Agenda.tsx";
import Announcements from "./pages/Announcements.tsx";
import NewAnnouncement from "./pages/NewAnnouncement.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Menu from "./pages/Menu.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" richColors closeButton />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/professor" element={<ProtectedRoute roles={["TEACHER", "ADMIN"]}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/aluno" element={<ProtectedRoute roles={["STUDENT"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/responsavel" element={<ProtectedRoute roles={["PARENT"]}><ParentDashboard /></ProtectedRoute>} />
            <Route path="/chamada" element={<ProtectedRoute roles={["TEACHER", "ADMIN"]}><Attendance /></ProtectedRoute>} />
            <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
            <Route path="/comunicados" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
            <Route path="/comunicados/novo" element={<ProtectedRoute roles={["TEACHER", "ADMIN"]}><NewAnnouncement /></ProtectedRoute>} />
            <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
            <Route path="/blog/:id" element={<ProtectedRoute><BlogPost /></ProtectedRoute>} />
            <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
