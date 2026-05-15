import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AttendanceEntry } from "@/lib/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Check, X, FileText, Save, Loader2, History, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";

const statusConfig = {
  PRESENT: { label: "Presente", icon: Check, classes: "bg-success text-success-foreground" },
  ABSENT: { label: "Falta", icon: X, classes: "bg-destructive text-destructive-foreground" },
  EXCUSED: { label: "Justif.", icon: FileText, classes: "bg-warning text-warning-foreground" },
} as const;

export default function Attendance() {
  const { user } = useAuth();
  const { turmas, students: allStudents, saveAttendance, getAttendanceFor, attendance: allRecords } = useData();
  const [classId, setClassId] = useState(turmas[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const turma = turmas.find((t) => t.id === classId);
  const students = useMemo(
    () => (turma ? allStudents.filter((u) => turma.studentIds.includes(u.id)) : []),
    [turma, allStudents]
  );
  const [attendance, setAttendance] = useState<Record<string, AttendanceEntry["status"]>>({});
  const [saving, setSaving] = useState(false);

  // Load existing record (or default all PRESENT) when class/date changes
  useEffect(() => {
    if (!turma) return;
    const existing = getAttendanceFor(date, turma.id);
    if (existing) {
      setAttendance(Object.fromEntries(existing.entries.map((e) => [e.student_id, e.status])));
    } else {
      setAttendance(Object.fromEntries(turma.studentIds.map((sid) => [sid, "PRESENT" as const])));
    }
  }, [classId, date, turma, getAttendanceFor]);

  const lastRecord = useMemo(() => {
    if (!turma) return null;
    return [...allRecords]
      .filter((r) => r.class_id === turma.id)
      .sort((a, b) => b.saved_at.localeCompare(a.saved_at))[0] || null;
  }, [allRecords, turma]);

  const setStatus = (sid: string, status: AttendanceEntry["status"]) => {
    setAttendance((prev) => ({ ...prev, [sid]: status }));
  };

  const counts = Object.values(attendance).reduce(
    (acc, s) => ({ ...acc, [s]: (acc[s] || 0) + 1 }),
    {} as Record<string, number>
  );

  const save = async () => {
    if (!turma) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    saveAttendance({
      date,
      class_id: turma.id,
      entries: Object.entries(attendance).map(([student_id, status]) => ({ student_id, status })),
      saved_by: user?.name,
    });
    setSaving(false);
    toast.success("Chamada salva!", {
      description: `${counts.PRESENT || 0} presente(s), ${counts.ABSENT || 0} falta(s), ${counts.EXCUSED || 0} justificada(s).`,
    });
  };

  const markAllPresent = () => {
    if (!turma) return;
    setAttendance(Object.fromEntries(turma.studentIds.map((sid) => [sid, "PRESENT" as const])));
  };

  if (!turma) {
    return (
      <AppLayout>
        <PageHeader title="Fazer Chamada" />
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Nenhuma turma cadastrada. Crie uma turma no painel administrativo.
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Fazer Chamada" subtitle={new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} />

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {turmas.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12" />
      </div>

      {lastRecord && (
        <Card className="p-3 mb-4 flex items-center gap-3 bg-muted/40">
          <History className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground flex-1">
            Última chamada salva em <strong className="text-foreground">{new Date(lastRecord.saved_at).toLocaleString("pt-BR")}</strong> por {lastRecord.saved_by || "—"}
          </p>
        </Card>
      )}

      <div className="mb-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={markAllPresent}>
          <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> Marcar todas presentes
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-success">{counts.PRESENT || 0}</p>
          <p className="text-[11px] text-muted-foreground">Presentes</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-destructive">{counts.ABSENT || 0}</p>
          <p className="text-[11px] text-muted-foreground">Faltas</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-warning">{counts.EXCUSED || 0}</p>
          <p className="text-[11px] text-muted-foreground">Justificadas</p>
        </Card>
      </div>

      <div className="space-y-2 mb-24">
        {students.map((s) => {
          const current = attendance[s.id];
          const initials = s.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
          return (
            <Card key={s.id} className="p-3">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <p className="font-medium flex-1 truncate">{s.name}</p>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((key) => {
                  const cfg = statusConfig[key];
                  const Icon = cfg.icon;
                  const active = current === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setStatus(s.id, key)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-smooth border-2",
                        active ? `${cfg.classes} border-transparent shadow-soft` : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-4 z-30">
        <div className="mx-auto max-w-3xl">
          <Button onClick={save} disabled={saving} className="w-full h-12 gradient-primary text-primary-foreground font-semibold shadow-floating">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar Chamada</>}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}