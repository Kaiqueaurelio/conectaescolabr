import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData, Reminder } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, BellOff, CheckCircle2, AlertTriangle } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/admin/SearchBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";

const priorityClass: Record<Reminder["priority"], string> = {
  HIGH: "bg-coral text-coral-foreground",
  MEDIUM: "bg-secondary text-secondary-foreground",
  LOW: "bg-tertiary text-tertiary-foreground",
};
const priorityLabel: Record<Reminder["priority"], string> = {
  HIGH: "Alta", MEDIUM: "Média", LOW: "Baixa",
};

export default function Reminders() {
  const { user } = useAuth();
  const { reminders, toggleReminder, isOverdue, daysOverdue } = useData();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | "PENDING" | "DONE" | "OVERDUE">("ALL");

  const audience = useMemo(() => reminders.filter((r) => {
    if (r.target === "ALL") return true;
    if (user?.role === "TEACHER" || user?.role === "ADMIN") return r.target === "TEACHERS";
    if (user?.role === "PARENT") return r.target === "PARENTS";
    if (user?.role === "STUDENT") return r.target === "STUDENTS";
    return false;
  }), [reminders, user]);

  const overdue = audience.filter(isOverdue);

  const visible = useMemo(() => audience
    .filter((r) => {
      if (status === "PENDING" && r.done) return false;
      if (status === "DONE" && !r.done) return false;
      if (status === "OVERDUE" && !isOverdue(r)) return false;
      if (q && !`${r.title} ${r.description || ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => Number(a.done) - Number(b.done) || a.due_date.localeCompare(b.due_date)),
    [audience, q, status, isOverdue]);

  const canToggle = user?.role !== "ADMIN" && user?.role !== "TEACHER";

  return (
    <AppLayout>
      <PageHeader title="Lembretes" subtitle="Tarefas e prazos importantes" />

      {overdue.length > 0 && (
        <Card className="p-3 mb-4 border-coral/40 bg-coral/5 flex items-center gap-3 animate-fade-in">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-coral/15 text-coral"><AlertTriangle className="h-4 w-4" /></div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Você tem {overdue.length} {overdue.length === 1 ? "lembrete atrasado" : "lembretes atrasados"}</p>
            <p className="text-[11px] text-muted-foreground">Resolva o quanto antes para manter tudo em dia.</p>
          </div>
        </Card>
      )}

      <div className="mb-4">
        <SearchBar
          value={q} onChange={setQ} placeholder="Buscar..."
          total={audience.length} filtered={visible.length}
          onClear={() => { setQ(""); setStatus("ALL"); }}
          filters={
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger className="w-[140px] h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PENDING">Pendentes</SelectItem>
                <SelectItem value="DONE">Concluídos</SelectItem>
                <SelectItem value="OVERDUE">Atrasados</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={BellOff} title="Sem lembretes no momento." description="Quando houver novas tarefas, aparecem aqui." />
      ) : (
        <div className="space-y-2">
          {visible.map((r) => {
            const od = isOverdue(r);
            return (
              <Card key={r.id} className={`p-4 transition-smooth ${r.done ? "opacity-60" : ""} ${od ? "border-coral/50 bg-coral/5" : ""}`}>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => canToggle && toggleReminder(r.id)}
                    disabled={!canToggle}
                    className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-smooth ${r.done ? "bg-success border-success" : "border-border hover:border-primary"} ${!canToggle && "cursor-default"}`}
                    aria-label="Marcar como concluído"
                  >
                    {r.done && <CheckCircle2 className="h-4 w-4 text-success-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold text-sm ${r.done ? "line-through" : ""}`}>{r.title}</p>
                      <Badge className={`${priorityClass[r.priority]} text-[10px]`}>{priorityLabel[r.priority]}</Badge>
                      {od && <Badge variant="destructive" className="text-[10px]">Atrasado {daysOverdue(r)}d</Badge>}
                    </div>
                    {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                    <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Bell className="h-3 w-3" /> Prazo: {new Date(r.due_date).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long" })}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}