import { useState, useMemo } from "react";
import { ModernLayout, ModernCard, ModernGrid, ModernSection, ModernEmptyState, StatCard } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader, ModernTabs } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QRCodeAttendance } from "@/components/QRCodeAttendance";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useUsers } from "@/hooks/useSupabaseData";
import { UserProfile } from "@/lib/supabase";
import { CheckCircle, XCircle, AlertCircle, Plus, Calendar, TrendingUp } from "lucide-react";
import { ModernBadge } from "@/components/ModernLayout";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface AttendanceRecord {
  id: string;
  user_id: string;
  user_name: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED";
  recorded_by: string;
}

export function AttendanceAdvancedPage() {
  const { user: currentUser } = useSupabaseAuth();
  const { users } = useUsers();

  const [activeTab, setActiveTab] = useState("register");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedActivity, setSelectedActivity] = useState("activity-1");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [attendanceStatus, setAttendanceStatus] = useState<"PRESENT" | "ABSENT" | "EXCUSED">("PRESENT");

  // Mock de atividades
  const activities = [
    { id: "activity-1", name: "Aula de Matemática" },
    { id: "activity-2", name: "Aula de Português" },
    { id: "activity-3", name: "Atividade Recreativa" },
    { id: "activity-4", name: "Reforço Escolar" },
  ];

  const students = users.filter((u) => u.role === "STUDENT");

  const handleAddAttendance = () => {
    if (!selectedStudent) {
      toast.error("Selecione um aluno");
      return;
    }

    const student = students.find((s) => s.id === selectedStudent);
    if (!student) return;

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      user_id: selectedStudent,
      user_name: student.full_name,
      date: selectedDate,
      status: attendanceStatus,
      recorded_by: currentUser?.id || "",
    };

    setAttendanceRecords([...attendanceRecords, newRecord]);
    toast.success(`Presença de ${student.full_name} registrada!`);
    setSelectedStudent("");
  };

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalRecords = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((r) => r.status === "PRESENT").length;
    const absentCount = attendanceRecords.filter((r) => r.status === "ABSENT").length;
    const excusedCount = attendanceRecords.filter((r) => r.status === "EXCUSED").length;

    return {
      total: totalRecords,
      present: presentCount,
      absent: absentCount,
      excused: excusedCount,
      presentPercentage: totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0,
    };
  }, [attendanceRecords]);

  const sidebarItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Usuários", href: "/admin/users", icon: "👥" },
    { label: "Presença", href: "/admin/attendance", icon: "✓" },
    { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
  ];

  const tabs = [
    { label: "Registrar Presença", value: "register", icon: <CheckCircle className="w-4 h-4" /> },
    { label: "Relatórios", value: "reports", icon: <TrendingUp className="w-4 h-4" /> },
    { label: "QR Code", value: "qrcode", icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <ModernLayout>
      <ModernSidebar items={sidebarItems} />
      <div className="lg:ml-64">
        <ModernTopBar
          title="Sistema de Presença"
          user={currentUser ? { name: currentUser.full_name, email: currentUser.email } : undefined}
        />

        <div className="p-6">
          <ModernPageHeader
            title="Presença"
            description="Registre e acompanhe a frequência dos alunos"
            icon={<CheckCircle />}
          />

          <ModernTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Aba: Registrar Presença */}
          {activeTab === "register" && (
            <div className="space-y-6 mt-6">
              {/* Estatísticas */}
              <ModernGrid cols={4}>
                <StatCard label="Total Registrado" value={stats.total} color="primary" />
                <StatCard
                  label="Presentes"
                  value={stats.present}
                  trend="up"
                  trendValue={`${stats.presentPercentage}%`}
                  color="success"
                />
                <StatCard label="Ausentes" value={stats.absent} color="destructive" />
                <StatCard label="Justificados" value={stats.excused} color="warning" />
              </ModernGrid>

              {/* Formulário de Registro */}
              <ModernCard className="p-6">
                <h3 className="font-semibold text-foreground mb-6">Registrar Presença</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="date">Data *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="activity">Atividade *</Label>
                      <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                        <SelectTrigger id="activity" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {activities.map((act) => (
                            <SelectItem key={act.id} value={act.id}>
                              {act.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="student">Aluno *</Label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger id="student" className="mt-2">
                        <SelectValue placeholder="Selecione um aluno" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Status de Presença *</Label>
                    <div className="flex gap-3 mt-3">
                      <Button
                        variant={attendanceStatus === "PRESENT" ? "default" : "outline"}
                        onClick={() => setAttendanceStatus("PRESENT")}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Presente
                      </Button>
                      <Button
                        variant={attendanceStatus === "ABSENT" ? "default" : "outline"}
                        onClick={() => setAttendanceStatus("ABSENT")}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Ausente
                      </Button>
                      <Button
                        variant={attendanceStatus === "EXCUSED" ? "default" : "outline"}
                        onClick={() => setAttendanceStatus("EXCUSED")}
                        className="flex-1"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Justificado
                      </Button>
                    </div>
                  </div>

                  <Button onClick={handleAddAttendance} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Presença
                  </Button>
                </div>
              </ModernCard>

              {/* Lista de Registros */}
              <ModernSection title="Registros do Dia" subtitle={`${format(new Date(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`}>
                {attendanceRecords.length === 0 ? (
                  <ModernEmptyState
                    icon={<CheckCircle />}
                    title="Nenhum registro"
                    description="Comece registrando a presença dos alunos"
                  />
                ) : (
                  <div className="space-y-2">
                    {attendanceRecords.map((record) => (
                      <ModernCard key={record.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {record.status === "PRESENT" && (
                              <CheckCircle className="w-5 h-5 text-success" />
                            )}
                            {record.status === "ABSENT" && (
                              <XCircle className="w-5 h-5 text-destructive" />
                            )}
                            {record.status === "EXCUSED" && (
                              <AlertCircle className="w-5 h-5 text-warning" />
                            )}
                            <div>
                              <p className="font-medium text-foreground">{record.user_name}</p>
                              <p className="text-xs text-muted-foreground">{record.date}</p>
                            </div>
                          </div>
                          <ModernBadge
                            variant={
                              record.status === "PRESENT"
                                ? "success"
                                : record.status === "ABSENT"
                                  ? "destructive"
                                  : "warning"
                            }
                          >
                            {record.status === "PRESENT"
                              ? "Presente"
                              : record.status === "ABSENT"
                                ? "Ausente"
                                : "Justificado"}
                          </ModernBadge>
                        </div>
                      </ModernCard>
                    ))}
                  </div>
                )}
              </ModernSection>
            </div>
          )}

          {/* Aba: Relatórios */}
          {activeTab === "reports" && (
            <div className="space-y-6 mt-6">
              <ModernCard className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Relatório de Frequência</h3>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Frequência média: <strong>{stats.presentPercentage}%</strong>
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Presentes</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success"
                            style={{ width: `${stats.presentPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.present}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ausentes</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-destructive"
                            style={{ width: `${stats.absent > 0 ? (stats.absent / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.absent}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Justificados</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-warning"
                            style={{ width: `${stats.excused > 0 ? (stats.excused / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.excused}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ModernCard>
            </div>
          )}

          {/* Aba: QR Code */}
          {activeTab === "qrcode" && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <QRCodeAttendance
                  activityId={selectedActivity}
                  activityName={activities.find((a) => a.id === selectedActivity)?.name || "Atividade"}
                />
                <ModernCard className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Instruções</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong>1. Gerar QR Code:</strong> O código é gerado automaticamente para a atividade selecionada.
                    </p>
                    <p>
                      <strong>2. Exibir:</strong> Exiba o QR Code na tela ou imprima-o.
                    </p>
                    <p>
                      <strong>3. Escanear:</strong> Os alunos escaneiam o código com seus dispositivos.
                    </p>
                    <p>
                      <strong>4. Registrar:</strong> A presença é registrada automaticamente.
                    </p>
                  </div>
                </ModernCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
}
