import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData, Reminder } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, BellOff, CheckCircle2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { useMemo } from "react";

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
  const { reminders, toggleReminder } = useData();

  const visible = useMemo(() => {
    return reminders
      .filter((r) => {
        if (r.target === "ALL") return true;
        if (user?.role === "TEACHER" || user?.role === "ADMIN") return r.target === "TEACHERS";
        if (user?.role === "PARENT") return r.target === "PARENTS";
        if (user?.role === "STUDENT") return r.target === "STUDENTS";
        return false;
      })
      .sort((a, b) => Number(a.done) - Number(b.done) || a.due_date.localeCompare(b.due_date));
  }, [reminders, user]);

  const today = new Date().toISOString().slice(0, 10);
  const canToggle = user?.role !== "ADMIN" && user?.role !== "TEACHER";

  return (
    <AppLayout>
      <PageHeader title="Lembretes" subtitle="Tarefas e prazos importantes" />
      {visible.length === 0 ? (
        <EmptyState icon={BellOff} title="Sem lembretes no momento." description="Quando houver novas tarefas, aparecem aqui." />
      ) : (
        <div className="space-y-2">
          {visible.map((r) => {
            const overdue = !r.done && r.due_date < today;
            return (
              <Card key={r.id} className={`p-4 ${r.done ? "opacity-60" : ""} ${overdue ? "border-coral/50" : ""}`}>
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
                      {overdue && <Badge variant="destructive" className="text-[10px]">Atrasado</Badge>}
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