import { useEffect, useMemo, useState } from "react";
import { GlassLayout, GlassContainer, GlassGrid, GlassSection } from "@/components/GlassLayout";
import { GlassCard, GlassStatCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Clock, AlertCircle, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED";
interface StudentRow { id: string; full_name: string; email: string; }
interface ActivityRow { id: string; name: string; }
interface SavedAttendance { id: string; user_id: string; status: AttendanceStatus; }

const statusLabels: Record<AttendanceStatus, string> = {
  PRESENT: "Presente",
  ABSENT: "Ausente",
  EXCUSED: "Justificado",
};

export function AttendanceGlassPage() {
  const { user: currentUser } = useSupabaseAuth();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    const loadOptions = async () => {
      const [studentResult, activityResult] = await Promise.all([
        supabase.from("users").select("id,full_name,email").eq("role", "STUDENT").eq("status", "APPROVED").order("full_name"),
        supabase.from("activities").select("id,name").order("name"),
      ]);
      if (!active) return;
      if (studentResult.error || activityResult.error) {
        console.error("Erro ao carregar opções de chamada:", studentResult.error, activityResult.error);
        setLoadError(true);
        setLoading(false);
        toast.error("Não foi possível carregar alunos e atividades. Verifique a conexão e as permissões do banco.");
        return;
      }
      setStudents((studentResult.data ?? []) as StudentRow[]);
      const loadedActivities = (activityResult.data ?? []) as ActivityRow[];
      setActivities(loadedActivities);
      setSelectedActivityId((current) => current || loadedActivities[0]?.id || "");
      setLoading(false);
    };
    void loadOptions().catch((error) => {
      console.error("Falha inesperada ao carregar chamada:", error);
      if (active) { setLoadError(true); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedActivityId || !selectedDate) {
      setAttendance({});
      return;
    }
    let active = true;
    const loadRecords = async () => {
      setLoadingRecords(true);
      const { data, error } = await supabase
        .from("attendance_records")
        .select("id,user_id,status")
        .eq("activity_id", selectedActivityId)
        .eq("date", selectedDate);
      if (!active) return;
      setLoadingRecords(false);
      if (error) {
        console.error("Erro ao carregar chamada salva:", error);
        setLoadError(true);
        toast.error("Não foi possível carregar a chamada dessa data.");
        return;
      }
      const next: Record<string, AttendanceStatus> = {};
      for (const row of (data ?? []) as SavedAttendance[]) {
        if (["PRESENT", "ABSENT", "EXCUSED"].includes(row.status)) next[row.user_id] = row.status;
      }
      setAttendance(next);
    };
    void loadRecords().catch((error) => {
      console.error("Falha inesperada ao carregar chamada salva:", error);
      if (active) setLoadingRecords(false);
    });
    return () => { active = false; };
  }, [selectedActivityId, selectedDate]);

  const counts = useMemo(() => {
    const values = Object.values(attendance);
    return {
      present: values.filter((value) => value === "PRESENT").length,
      absent: values.filter((value) => value === "ABSENT").length,
      excused: values.filter((value) => value === "EXCUSED").length,
      marked: values.length,
    };
  }, [attendance]);

  const handleSave = async () => {
    if (currentUser?.role !== "ADMIN" && currentUser?.role !== "TEACHER") {
      toast.error("Somente professores e administradores podem registrar presença.");
      return;
    }
    if (!currentUser?.id) {
      toast.error("Sua sessão não foi identificada. Entre novamente.");
      return;
    }
    if (!selectedActivityId) {
      toast.error("Cadastre uma atividade antes de registrar a chamada.");
      return;
    }
    const unmarked = students.filter((student) => !attendance[student.id]);
    if (unmarked.length > 0) {
      toast.error(`Marque a situação de todos os alunos. Faltam ${unmarked.length}.`);
      return;
    }

    setSaving(true);
    const { data: existing, error: existingError } = await supabase
      .from("attendance_records")
      .select("id,user_id")
      .eq("activity_id", selectedActivityId)
      .eq("date", selectedDate);
    if (existingError) {
      setSaving(false);
      console.error("Erro ao consultar registros existentes:", existingError);
      toast.error("Não foi possível salvar a chamada com segurança.");
      return;
    }

    const existingByUser = new Map((existing ?? []).map((row) => [row.user_id, row.id]));
    const results = await Promise.all(students.map(async (student) => {
      const existingId = existingByUser.get(student.id);
      const query = existingId
        ? supabase.from("attendance_records").update({
            status: attendance[student.id],
            recorded_by: currentUser.id,
          }).eq("id", existingId).select("id").maybeSingle()
        : supabase.from("attendance_records").insert({
            user_id: student.id,
            activity_id: selectedActivityId,
            date: selectedDate,
            status: attendance[student.id],
            recorded_by: currentUser.id,
          }).select("id").maybeSingle();
      return query;
    }));
    setSaving(false);

    const failed = results.filter((result) => result.error || !result.data);
    if (failed.length > 0) {
      console.error("Parte da chamada não foi salva:", failed);
      toast.error(`A chamada foi salva parcialmente (${students.length - failed.length}/${students.length}). Atualize a tela e confira os registros antes de tentar novamente.`);
      return;
    }
    toast.success("Chamada salva no banco de dados.");
  };

  const sidebarItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { label: "Usuários", href: "/admin/users", icon: "👥" },
    { label: "Presença", href: "/admin/attendance", icon: "✓" },
    { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
    { label: "Comunicados", href: "/admin/communications", icon: "💬" },
    { label: "Calendário", href: "/admin/calendar", icon: "📅" },
  ];

  return (
    <GlassLayout
      sidebarItems={sidebarItems}
      topBarTitle="Presença"
      topBarUser={currentUser ? { name: currentUser.full_name || "Usuário", email: currentUser.email || "" } : undefined}
    >
      <GlassContainer>
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            Chamada e frequência
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Registre e consulte presenças persistidas no banco. Nenhum gráfico de demonstração é exibido.
          </p>
        </div>

        <GlassGrid cols={3} gap="medium" className="mb-6">
          <GlassStatCard label="Presentes" value={counts.present} icon={<CheckCircle className="h-5 w-5" />} color="success" />
          <GlassStatCard label="Ausentes" value={counts.absent} icon={<XCircle className="h-5 w-5" />} color="warning" />
          <GlassStatCard label="Justificados" value={counts.excused} icon={<Clock className="h-5 w-5" />} color="secondary" />
        </GlassGrid>

        <GlassSection title="Registrar presença">
          <GlassCard className="p-5">
            <div className="mb-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="attendance-activity">Atividade</Label>
                <select
                  id="attendance-activity"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedActivityId}
                  onChange={(event) => setSelectedActivityId(event.target.value)}
                  disabled={loading || activities.length === 0}
                >
                  <option value="">Selecione uma atividade</option>
                  {activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance-date">Data da chamada</Label>
                <Input id="attendance-date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
              </div>
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Carregando alunos e atividades...</p>
            ) : loadError ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 p-4 text-sm text-muted-foreground">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                A consulta falhou. Os dados não foram substituídos por valores fictícios.
              </div>
            ) : activities.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma atividade cadastrada. Cadastre uma atividade antes de registrar presença.</p>
            ) : students.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhum aluno aprovado encontrado.</p>
            ) : (
              <div className="space-y-3">
                {loadingRecords && <p className="text-sm text-muted-foreground">Carregando registros existentes...</p>}
                {students.map((student) => (
                  <div key={student.id} className="grid items-center gap-3 rounded-lg border border-border p-3 md:grid-cols-[1fr_220px]">
                    <div className="min-w-0">
                      <p className="font-medium">{student.full_name || student.email}</p>
                      <p className="truncate text-xs text-muted-foreground">{student.email}</p>
                    </div>
                    <select
                      aria-label={`Presença de ${student.full_name || student.email}`}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={attendance[student.id] || ""}
                      onChange={(event) => {
                        const value = event.target.value as AttendanceStatus | "";
                        setAttendance((previous) => {
                          const next = { ...previous };
                          if (value) next[student.id] = value;
                          else delete next[student.id];
                          return next;
                        });
                      }}
                      disabled={loadingRecords}
                    >
                      <option value="">Selecione situação</option>
                      <option value="PRESENT">Presente</option>
                      <option value="ABSENT">Ausente</option>
                      <option value="EXCUSED">Justificado</option>
                    </select>
                  </div>
                ))}
                <div className="flex justify-end pt-3">
                  <Button onClick={() => void handleSave()} disabled={saving || loadingRecords}>
                    {saving ? "Salvando..." : "Salvar chamada"}
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </GlassSection>
      </GlassContainer>
    </GlassLayout>
  );
}
