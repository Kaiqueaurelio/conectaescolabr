import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { users } from "@/lib/mockData";
import { useData } from "@/contexts/DataContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Calendar as CalIcon, TrendingUp, CheckCircle2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "@/components/EmptyState";

export default function ParentDashboard() {
  const { user, selectedChildId, switchChild } = useAuth();
  const { announcements, events, turmas, reminders, isOverdue, studentFrequency, studentPoints } = useData();
  const children = users.filter((u) => user?.childrenIds?.includes(u.id));
  const child = children.find((c) => c.id === selectedChildId) || children[0];
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.date >= today && (!e.class_id || child?.classIds?.includes(e.class_id))).slice(0, 3);
  const parentNotices = announcements.filter((a) => a.target === "ALL" || a.target === "PARENTS").slice(0, 3);
  const initials = child?.name.split(" ").map((n) => n[0]).slice(0, 2).join("") || "";
  const childTurma = turmas.find((t) => child?.classIds?.includes(t.id));
  const overdue = reminders.filter((r) => isOverdue(r) && (r.target === "ALL" || r.target === "PARENTS")).length;
  const freq = child ? studentFrequency(child.id) : { rate: 0, total: 0, present: 0 };
  const points = child ? studentPoints[child.id] || 0 : 0;

  return (
    <AppLayout>
      <section className="mb-6 rounded-3xl gradient-primary p-6 text-primary-foreground shadow-elevated">
        <p className="text-sm opacity-90">Olá, {user?.name?.split(" ")[0]}</p>
        <h1 className="text-xl font-bold mt-1">Acompanhe seu(s) filho(s)</h1>
        {children.length > 1 && (
          <Select value={selectedChildId || child?.id} onValueChange={switchChild}>
            <SelectTrigger className="mt-4 bg-white/20 border-white/30 text-primary-foreground backdrop-blur">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {children.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
        )}
      </section>

      {child && (
        <Card className="p-5 mb-6 flex items-center gap-4 shadow-soft">
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-bold text-lg">{child.name}</p>
            <p className="text-xs text-muted-foreground">{childTurma?.name || "Sem turma cadastrada"}</p>
          </div>
        </Card>
      )}

      {overdue > 0 && (
        <Card className="p-3 mb-4 border-coral/40 bg-coral/5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-coral/15 text-coral">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{overdue} lembrete{overdue > 1 ? "s" : ""} atrasado{overdue > 1 ? "s" : ""}</p>
            <p className="text-[11px] text-muted-foreground">Veja em "Lembretes" no menu inferior.</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 mb-8">
        <Card className="p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15 text-success mb-2">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">{freq.total === 0 ? "—" : `${freq.rate}%`}</p>
          <p className="text-xs text-muted-foreground">{freq.total === 0 ? "Sem chamadas" : `${freq.present}/${freq.total} aulas`}</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/15 text-secondary mb-2">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">{points}</p>
          <p className="text-xs text-muted-foreground">Pontos em atividades</p>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Comunicados</h2>
        <Link to="/comunicados" className="text-xs font-medium text-primary">Ver todos</Link>
      </div>
      <div className="space-y-2 mb-8">
        {parentNotices.length === 0 ? (
          <EmptyState icon={Megaphone} title="Nenhum comunicado no momento." />
        ) : parentNotices.map((a) => (
          <Card key={a.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12 text-primary flex-shrink-0">
                <Megaphone className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{a.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{a.content}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Próximos eventos</h2>
        <Link to="/agenda" className="text-xs font-medium text-primary">Ver agenda</Link>
      </div>
      <div className="space-y-2">
        {upcoming.map((e) => (
          <Card key={e.id} className="p-4 flex items-center gap-3">
            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-accent/30 text-accent-foreground flex-shrink-0">
              <CalIcon className="h-4 w-4" />
              <span className="text-[10px] font-bold mt-0.5">{new Date(e.date).getDate()}/{new Date(e.date).getMonth() + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{e.title}</p>
              <p className="text-xs text-muted-foreground truncate">{e.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}