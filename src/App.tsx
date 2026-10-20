import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import TeacherDashboard from "./pages/TeacherDashboard.tsx";
import Announcements from "./pages/Announcements.tsx";
import NewAnnouncement from "./pages/NewAnnouncement.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Menu from "./pages/Menu.tsx";
import { AuthProvider } from "./contexts/AuthContext"; // Usando a versão limpa
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Reminders from "./pages/Reminders.tsx";
import Turmas from "./pages/Turmas.tsx";
import Settings from "./pages/Settings.tsx";
import Help from "./pages/Help.tsx";
import CadastroGeral from "./pages/CadastroGeral.tsx";
import { DataProvider } from "./contexts/DataContext";

// Novas Páginas Implementadas
import { AdminDashboardGlassPage as AdminDashboardNewPage } from "./pages/AdminDashboardGlass";
import { UsersListGlassPage as UsersListPage } from "./pages/UsersListGlass";
import { UserProfilePage } from "./pages/UserProfile";
import { SocialRecordPage } from "./pages/SocialRecord";
import { AttendanceGlassPage as AttendanceAdvancedPage } from "./pages/AttendanceGlass";
import { BenefitsGlassPage as BenefitsManagementPage } from "./pages/BenefitsGlass";
import { CommunicationsPage } from "./pages/Communications";
import { SmartCalendarPage } from "./pages/SmartCalendar";
import { DocumentScanningPage } from "./pages/DocumentScanning";
import { ReportsGenerationPage } from "./pages/ReportsGeneration";
import { ParentPortalPage } from "./pages/ParentPortal";
import VolunteerDashboardPage from "./pages/VolunteerDashboard";
import { SecurityAndLGPDPage } from "./pages/SecurityAndLGPD";
import { ColorPalettePageGlass } from "./pages/ColorPalettePage";
import { ImpactDashboardPage } from "./pages/ImpactDashboard";
import { AdminDashboardSkillPathPage } from "./pages/AdminDashboardSkillPath";
import { StudentDashboardSkillPathPage } from "./pages/StudentDashboardSkillPath";
import ParticipantFile from "./pages/ParticipantFile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" richColors closeButton />
      <BrowserRouter>
        <SupabaseAuthProvider>
          <AuthProvider>
            <DataProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                
                {/* Rotas Administrativas Modernas */}
                <Route path="/admin/dashboard" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboardNewPage /></ProtectedRoute>} />
                <Route path="/admin/dashboard-skillpath" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboardSkillPathPage /></ProtectedRoute>} />
                <Route path="/admin/impact" element={<ProtectedRoute roles={["ADMIN"]}><ImpactDashboardPage /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute roles={["ADMIN"]}><UsersListPage /></ProtectedRoute>} />
                <Route path="/admin/users/new" element={<ProtectedRoute roles={["ADMIN"]}><Navigate to="/admin/users" replace /></ProtectedRoute>} />
                <Route path="/admin/users/:userId" element={<ProtectedRoute roles={["ADMIN"]}><UserProfilePage /></ProtectedRoute>} />
                <Route path="/admin/users/:userId/record" element={<ProtectedRoute roles={["ADMIN", "TEACHER"]}><SocialRecordPage /></ProtectedRoute>} />
                <Route path="/admin/users/:userId/ficha" element={<ProtectedRoute roles={["ADMIN"]}><ParticipantFile /></ProtectedRoute>} />
                <Route path="/admin/attendance" element={<ProtectedRoute roles={["ADMIN", "TEACHER"]}><AttendanceAdvancedPage /></ProtectedRoute>} />
                <Route path="/admin/benefits" element={<ProtectedRoute roles={["ADMIN"]}><BenefitsManagementPage /></ProtectedRoute>} />
                <Route path="/admin/communications" element={<ProtectedRoute roles={["ADMIN", "TEACHER"]}><CommunicationsPage /></ProtectedRoute>} />
                <Route path="/admin/calendar" element={<ProtectedRoute roles={["ADMIN", "TEACHER"]}><SmartCalendarPage /></ProtectedRoute>} />
                <Route path="/admin/scanning" element={<ProtectedRoute roles={["ADMIN"]}><DocumentScanningPage /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute roles={["ADMIN"]}><ReportsGenerationPage /></ProtectedRoute>} />
                <Route path="/admin/security" element={<ProtectedRoute><SecurityAndLGPDPage /></ProtectedRoute>} />
                <Route path="/admin/colors" element={<ProtectedRoute roles={["ADMIN"]}><ColorPalettePageGlass /></ProtectedRoute>} />
                
                {/* Rotas de Alunos/Assistidos */}
                <Route path="/aluno/dashboard" element={<ProtectedRoute roles={["STUDENT"]}><StudentDashboardSkillPathPage /></ProtectedRoute>} />
                
                {/* Portal do Responsável */}
                <Route path="/parent/portal" element={<ProtectedRoute roles={["PARENT"]}><ParentPortalPage /></ProtectedRoute>} />
                <Route path="/voluntario" element={<ProtectedRoute roles={["VOLUNTEER"]}><VolunteerDashboardPage /></ProtectedRoute>} />

                {/* Rotas Legadas/Existentes */}
                <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><Navigate to="/admin/dashboard" replace /></ProtectedRoute>} />
                <Route path="/professor" element={<ProtectedRoute roles={["TEACHER", "ADMIN"]}><TeacherDashboard /></ProtectedRoute>} />
                <Route path="/aluno" element={<ProtectedRoute roles={["STUDENT"]}><Navigate to="/aluno/dashboard" replace /></ProtectedRoute>} />
                <Route path="/responsavel" element={<ProtectedRoute roles={["PARENT"]}><Navigate to="/parent/portal" replace /></ProtectedRoute>} />
                <Route path="/chamada" element={<ProtectedRoute roles={["TEACHER", "ADMIN"]}><Navigate to="/admin/attendance" replace /></ProtectedRoute>} />
                <Route path="/agenda" element={<ProtectedRoute><SmartCalendarPage readOnly /></ProtectedRoute>} />
                <Route path="/cadastro" element={<ProtectedRoute roles={["TEACHER", "ADMIN"]}><CadastroGeral /></ProtectedRoute>} />
                <Route path="/comunicados" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
                <Route path="/comunicados/novo" element={<ProtectedRoute roles={["TEACHER", "ADMIN"]}><NewAnnouncement /></ProtectedRoute>} />
                <Route path="/lembretes" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
                <Route path="/turmas" element={<ProtectedRoute roles={["TEACHER", "ADMIN"]}><Turmas /></ProtectedRoute>} />
                <Route path="/configuracoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/ajuda" element={<ProtectedRoute><Help /></ProtectedRoute>} />
                <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
                <Route path="/blog/:id" element={<ProtectedRoute><BlogPost /></ProtectedRoute>} />
                <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DataProvider>
          </AuthProvider>
        </SupabaseAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
