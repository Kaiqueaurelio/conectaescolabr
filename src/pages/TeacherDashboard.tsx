import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Megaphone, Users, Calendar, ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { turmas, events } from "@/lib/mockData";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const myClasses = turmas.filter((t) => t.teacher_id === user?.id);
  const today = new Date().toISOString().slice(0, 10);
  const todayEvents = events.filter((e) => e.date >= today).slice(0, 4);
  const totalStudents = myClasses.reduce((sum, c) => sum + c.studentIds.length, 0);

  return (
    <AppLayout>
      <section className="mb-6 rounded-3xl gradient-primary p-6 text-primary-foreground shadow-elevated">
        <p className="text-sm opacity-90">Olá, professor(a)</p>
        <h1 className="text-2xl font-bold mt-1">{user?.name}</h1>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/15 backdrop-blur p-3">
            <Users className="h-5 w-5 mb-1" />
            <p className="text-2xl font-bold">{totalStudents}</p>
            <p className="text-xs opacity-90">Alunos</p>
          </div>
          <div className="rounded-2xl bg-white/15 backdrop-blur p-3">
            <Calendar className="h-5 w-5 mb-1" />
            <p className="text-2xl font-bold">{myClasses.length}</p>
            <p className="text-xs opacity-90">Turmas</p>
          </div>
        </div>
      </section>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Ações rápidas</h2>
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link to="/chamada">
          <Card className="p-5 hover:shadow-elevated transition-smooth cursor-pointer h-full bg-card border-2 hover:border-primary/40">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary mb-3">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <p className="font-semibold">Fazer Chamada</p>
            <p className="text-xs text-muted-foreground mt-0.5">Registrar presença</p>
          </Card>
        </Link>
        <Link to="/comunicados/novo">
          <Card className="p-5 hover:shadow-warm transition-smooth cursor-pointer h-full bg-card border-2 hover:border-secondary/40">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/15 text-secondary mb-3">
              <Megaphone className="h-6 w-6" />
            </div>
            <p className="font-semibold">Novo Comunicado</p>
            <p className="text-xs text-muted-foreground mt-0.5">Enviar aviso</p>
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