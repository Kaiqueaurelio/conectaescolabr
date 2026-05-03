import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Megaphone, Users, Calendar, ChevronRight, Clock, Bell, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import StatCard from "@/components/dashboard/StatCard";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { events, turmas, reminders, isOverdue } = useData();
  const myClasses = turmas.filter((t) => t.teacher_id === user?.id);
  const today = new Date().toISOString().slice(0, 10);
  const todayEvents = events.filter((e) => e.date >= today).slice(0, 4);
  const totalStudents = myClasses.reduce((sum, c) => sum + c.studentIds.length, 0);
  const myReminders = reminders.filter((r) => r.target === "ALL" || r.target === "TEACHERS");
  const overdue = myReminders.filter(isOverdue).length;

  return (
    <AppLayout>
      <section className="mb-6 rounded-3xl gradient-brand p-6 text-primary-foreground shadow-elevated relative overflow-hidden">
        <p className="text-sm opacity-90">Olá, professor(a)</p>
        <h1 className="text-2xl font-bold mt-1">{user?.name}</h1>
        <p className="mt-1 text-sm opacity-95">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</p>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Users} label="Alunas" value={totalStudents} tone="primary" />
        <StatCard icon={Calendar} label="Turmas" value={myClasses.length} tone="tertiary" />
        <StatCard icon={Bell} label="Lembretes" value={myReminders.filter(r => !r.done).length} tone="secondary" />
        <StatCard icon={AlertTriangle} label="Atrasados" value={overdue} tone="coral" alert={overdue > 0} />
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Ações rápidas</h2>
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Link to="/chamada">
          <Card className="p-5 hover:shadow-elevated transition-smooth cursor-pointer h-full bg-card border-2 hover:border-primary/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary mb-3">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <p className="font-semibold text-sm">Chamada</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Registrar presença</p>
          </Card>
        </Link>
        <Link to="/comunicados/novo">
          <Card className="p-5 hover:shadow-warm transition-smooth cursor-pointer h-full bg-card border-2 hover:border-secondary/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary mb-3">
              <Megaphone className="h-6 w-6" />
            </div>
            <p className="font-semibold text-sm">Comunicado</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Enviar aviso</p>
          </Card>
        </Link>
        <Link to="/turmas">
          <Card className="p-5 hover:shadow-soft transition-smooth cursor-pointer h-full bg-card border-2 hover:border-tertiary/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary/15 text-tertiary mb-3">
              <Users className="h-6 w-6" />
            </div>
            <p className="font-semibold text-sm">Turmas</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ver alunas</p>
          </Card>
        </Link>
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Minhas turmas</h2>
      <div className="space-y-3 mb-8">
        {myClasses.map((t) => (
          <Card key={t.id} className="p-4 flex items-center justify-between hover:shadow-soft transition-smooth">
            <div>
              <p className="font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.studentIds.length} alunos</p>
            </div>
            <Link to="/chamada">
              <Button variant="ghost" size="sm">Chamada <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </Card>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Próximos eventos</h2>
      <div className="space-y-2">
        {todayEvents.map((e) => (
          <Card key={e.id} className="p-4 flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-accent/30 text-accent-foreground">
              <Clock className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{e.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}</p>
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}