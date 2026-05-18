import { useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useData, Reminder } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Announcement, EventItem, BlogPost, Turma, User, users as seedUsers, Role } from "@/lib/mockData";
import { toast } from "sonner";
import StatCard from "@/components/dashboard/StatCard";
import SearchBar from "@/components/admin/SearchBar";
import EmptyState from "@/components/EmptyState";
import {
  Megaphone, CalendarDays, Bell, Newspaper, Users as UsersIcon,
  Plus, Trash2, RotateCcw, ShieldCheck, Send, Save, Pencil, AlertTriangle,
  Activity, GraduationCap, UserPlus, ChevronRight, FileText, Sparkles, CheckCircle, XCircle, Clock
} from "lucide-react";

type Target = "ALL" | "TEACHERS" | "PARENTS" | "STUDENTS";
const targetLabel: Record<Target, string> = {
  ALL: "Todos", TEACHERS: "Professores", PARENTS: "Responsáveis", STUDENTS: "Alunos",
};
const priorityLabel: Record<Reminder["priority"], string> = { HIGH: "Alta", MEDIUM: "Média", LOW: "Baixa" };
const priorityClass: Record<Reminder["priority"], string> = {
  HIGH: "bg-coral text-coral-foreground",
  MEDIUM: "bg-secondary text-secondary-foreground",
  LOW: "bg-tertiary text-tertiary-foreground",
};

const roleLabel: Record<Role, string> = {
  ADMIN: "Administrador",
  TEACHER: "Professor(a)",
  STUDENT: "Aluno(a)",
  PARENT: "Responsável",
  VOLUNTEER: "Voluntário(a)",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
function fmtDate(d: string) {
  return new Date(d + (d.length === 10 ? "T00:00:00" : "")).toLocaleDateString("pt-BR", {
    weekday: "short", day: "2-digit", month: "short",
  }).replace(".", "");
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const data = useData();
  const today = new Date().toISOString().slice(0, 10);
  const in14 = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

  const overdueCount = data.reminders.filter((r) => data.isOverdue(r)).length;
  const upcomingEvents = data.events.filter((e) => e.date >= today && e.date <= in14);
  const totalStudents = data.students.length;
  const dateLong = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

  const pendingUsersCount = seedUsers.filter(u => u.status === "PENDING").length;

  return (
    <AppLayout>
      {/* Hero */}
      <section className="mb-6 rounded-3xl gradient-brand p-6 text-primary-foreground shadow-elevated relative overflow-hidden">
        <ShieldCheck className="absolute -right-6 -bottom-6 h-40 w-40 opacity-10" />
        <div className="flex items-center gap-2 text-[11px] opacity-90 uppercase tracking-wider font-semibold">
          <ShieldCheck className="h-3.5 w-3.5" /> Painel administrativo
        </div>
        <h1 className="text-2xl font-bold mt-2">{greeting()}, {user?.name?.split(" ")[0]}</h1>
        <p className="mt-1 text-sm opacity-95 capitalize">{dateLong}</p>
        <p className="mt-3 text-sm opacity-90 max-w-md">
          Visão geral da Associação Camila — gerencie comunicações, agenda, lembretes, blog e turmas em um só lugar.
        </p>
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Megaphone} label="Comunicados ativos" value={data.announcements.length} tone="primary" />
        <StatCard icon={CalendarDays} label="Eventos próximos (14d)" value={upcomingEvents.length} tone="tertiary" hint={`${data.events.length} no total`} />
        <StatCard
          icon={Clock}
          label="Aprovações pendentes"
          value={pendingUsersCount}
          tone="secondary"
          alert={pendingUsersCount > 0}
          hint={pendingUsersCount > 0 ? "Novos cadastros" : "Tudo revisado"}
        />
        <StatCard icon={GraduationCap} label="Alunas cadastradas" value={totalStudents} tone="secondary" hint={`${data.turmas.length} turmas`} />
      </div>

      {/* Insights row */}
      <div className="grid lg:grid-cols-2 gap-4 mb-8">
        <UpcomingEventsCard />
        <UrgentRemindersCard />
      </div>

      {/* Tabs gestão */}
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Gestão</h2>
      </div>
      <Tabs defaultValue="comunicados" className="w-full">
        <TabsList className="grid grid-cols-6 w-full h-auto">
          <TabsTrigger value="comunicados" className="flex-col gap-1 py-2 text-[10px]"><Megaphone className="h-4 w-4" /> Comunicados</TabsTrigger>
          <TabsTrigger value="eventos" className="flex-col gap-1 py-2 text-[10px]"><CalendarDays className="h-4 w-4" /> Eventos</TabsTrigger>
          <TabsTrigger value="lembretes" className="flex-col gap-1 py-2 text-[10px]"><Bell className="h-4 w-4" /> Lembretes</TabsTrigger>
          <TabsTrigger value="blog" className="flex-col gap-1 py-2 text-[10px]"><Newspaper className="h-4 w-4" /> Blog</TabsTrigger>
          <TabsTrigger value="turmas" className="flex-col gap-1 py-2 text-[10px]"><UsersIcon className="h-4 w-4" /> Turmas</TabsTrigger>
          <TabsTrigger value="aprovacoes" className="flex-col gap-1 py-2 text-[10px] relative">
            <Clock className="h-4 w-4" /> Aprovações
            {pendingUsersCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 bg-coral rounded-full" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comunicados" className="mt-4 space-y-4"><AnnouncementsTab /></TabsContent>
        <TabsContent value="eventos" className="mt-4 space-y-4"><EventsTab /></TabsContent>
        <TabsContent value="lembretes" className="mt-4 space-y-4"><RemindersTab /></TabsContent>
        <TabsContent value="blog" className="mt-4 space-y-4"><BlogTab /></TabsContent>
        <TabsContent value="turmas" className="mt-4 space-y-4"><TurmasTab /></TabsContent>
        <TabsContent value="aprovacoes" className="mt-4 space-y-4"><ApprovalsTab /></TabsContent>
      </Tabs>

    </AppLayout>
  );
}

/* ============== APPROVALS TAB ============== */

function ApprovalsTab() {
  const { approveUser, rejectUser } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<User[]>(seedUsers.filter(u => u.status === "PENDING"));

  const handleApprove = (id: string) => {
    approveUser(id);
    setPendingUsers(prev => prev.filter(u => u.id !== id));
    toast.success("Usuário aprovado com sucesso!");
  };

  const handleReject = (id: string) => {
    rejectUser(id);
    setPendingUsers(prev => prev.filter(u => u.id !== id));
    toast.error("Solicitação recusada.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Solicitações de Cadastro</h3>
        <Badge variant="secondary">{pendingUsers.length} pendentes</Badge>
      </div>

      {pendingUsers.length === 0 ? (
        <EmptyState icon={CheckCircle} title="Nenhuma solicitação pendente." description="Todos os novos cadastros foram revisados." />
      ) : (
        <div className="grid gap-3">
          {pendingUsers.map((u) => (
            <Card key={u.id} className="p-4 flex items-center justify-between hover:shadow-soft transition-smooth">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {u.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  <Badge variant="outline" className="mt-1 text-[10px]">{roleLabel[u.role]}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => handleReject(u.id)}>
                  <XCircle className="h-4 w-4 mr-1" /> Recusar
                </Button>
                <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => handleApprove(u.id)}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Aprovar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============== INSIGHT CARDS ============== */

function UpcomingEventsCard() {
  const { events, turmas } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const list = [...events].filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2"><CalendarDays className="h-4 w-4 text-tertiary" /> Próximos eventos</h3>
      </div>
      {list.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">Sem eventos agendados.</p>
      ) : (
        <ul className="space-y-2.5">
          {list.map((e) => {
            const t = turmas.find((x) => x.id === e.class_id);
            return (
              <li key={e.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-tertiary/15 text-tertiary flex-shrink-0">
                  <span className="text-[9px] font-bold uppercase">{new Date(e.date).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span>
                  <span className="text-sm font-bold leading-none">{new Date(e.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{t?.name || "Aberto a todos"}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function UrgentRemindersCard() {
  const { reminders, isOverdue, daysOverdue } = useData();
  const list = reminders
    .filter((r) => !r.done && (isOverdue(r) || r.priority === "HIGH"))
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 4);
  return (
    <Card className={`p-5 ${list.some(isOverdue) ? "border-coral/40" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-coral" /> Lembretes urgentes</h3>
      </div>
      {list.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">Nada urgente. 🎉</p>
      ) : (
        <ul className="space-y-2.5">
          {list.map((r) => {
            const od = isOverdue(r);
            const days = daysOverdue(r);
            return (
              <li key={r.id} className="flex items-start gap-3">
                <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${od ? "bg-coral" : "bg-secondary"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">{targetLabel[r.target]}</Badge>
                    {od ? (
                      <span className="text-[10px] text-coral font-semibold">Atrasado há {days}d</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Vence {fmtDate(r.due_date)}</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/* ============== ANNOUNCEMENTS ============== */

function AnnouncementsTab() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useData();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<"ALL_F" | Target>("ALL_F");

  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      if (target !== "ALL_F" && a.target !== target) return false;
      if (q && !`${a.title} ${a.content}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [announcements, q, target]);

  return (
    <>
      <SearchBar
        value={q} onChange={setQ}
        placeholder="Buscar comunicados..."
        total={announcements.length} filtered={filtered.length}
        onClear={() => { setQ(""); setTarget("ALL_F"); }}
        filters={
          <Select value={target} onValueChange={(v) => setTarget(v as any)}>
            <SelectTrigger className="w-[160px] h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_F">Todos públicos</SelectItem>
              {Object.entries(targetLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogTrigger asChild>
          <Button className="w-full gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Novo comunicado</Button>
        </DialogTrigger>
        <AnnouncementDialog
          editing={editing}
          onSave={(p) => {
            if (editing) { updateAnnouncement(editing.id, p); toast.success("Comunicado atualizado!"); }
            else { addAnnouncement({ ...p, author: user?.name || "Coordenação" }); toast.success("Comunicado enviado!"); }
            setOpen(false); setEditing(null);
          }}
        />
      </Dialog>

      {filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nenhum comunicado encontrado." />
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <Card key={a.id} className="p-3 flex items-center gap-3 hover:shadow-soft transition-smooth">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary flex-shrink-0">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{a.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{a.content}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5">{targetLabel[a.target]}</Badge>
                  <span className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(a); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <ConfirmDelete onConfirm={() => { deleteAnnouncement(a.id); toast.success("Removido."); }} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function AnnouncementDialog({ editing, onSave }: { editing: Announcement | null; onSave: (p: Omit<Announcement, "id" | "created_at" | "author">) => void }) {
  const [title, setTitle] = useState(editing?.title || "");
  const [content, setContent] = useState(editing?.content || "");
  const [target, setTarget] = useState<Target>(editing?.target || "ALL");
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{editing ? "Editar comunicado" : "Novo comunicado"}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div>
          <Label>Público-alvo</Label>
          <Select value={target} onValueChange={(v) => setTarget(v as Target)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(targetLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Conteúdo</Label><Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} /></div>
      </div>
      <DialogFooter>
        <Button
          className="gradient-primary text-primary-foreground"
          onClick={() => {
            if (title.trim().length < 3) return toast.error("Título muito curto.");
            onSave({ title: title.trim(), content: content.trim(), target });
          }}
        ><Send className="h-4 w-4 mr-2" /> {editing ? "Salvar" : "Publicar"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

/* ============== EVENTS ============== */

function EventsTab() {
  const { events, turmas, addEvent, updateEvent, deleteEvent } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return [...events]
      .filter((e) => !q || e.title.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [events, q]);

  return (
    <>
      <SearchBar
        value={q} onChange={setQ} placeholder="Buscar eventos..."
        total={events.length} filtered={filtered.length}
        onClear={() => setQ("")}
      />

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogTrigger asChild>
          <Button className="w-full gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Novo evento</Button>
        </DialogTrigger>
        <EventDialog
          editing={editing}
          turmas={turmas}
          onSave={(p) => {
            if (editing) { updateEvent(editing.id, p); toast.success("Evento atualizado!"); }
            else { addEvent(p); toast.success("Evento criado!"); }
            setOpen(false); setEditing(null);
          }}
        />
      </Dialog>

      {filtered.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Nenhum evento encontrado." />
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => {
            const t = turmas.find((x) => x.id === e.class_id);
            return (
              <Card key={e.id} className="p-3 flex items-center gap-3 hover:shadow-soft transition-smooth">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-tertiary/15 text-tertiary flex-shrink-0">
                  <span className="text-[10px] font-bold uppercase">{new Date(e.date).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span>
                  <span className="text-base font-bold leading-none">{new Date(e.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{e.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{t?.name || "Aberto a todos"}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(e); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <ConfirmDelete onConfirm={() => { deleteEvent(e.id); toast.success("Removido."); }} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function EventDialog({ editing, turmas, onSave }: { editing: EventItem | null; turmas: Turma[]; onSave: (p: Omit<EventItem, "id">) => void }) {
  const [title, setTitle] = useState(editing?.title || "");
  const [date, setDate] = useState(editing?.date || new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState(editing?.description || "");
  const [classId, setClassId] = useState<string>(editing?.class_id || "none");
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{editing ? "Editar evento" : "Novo evento"}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Data</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div>
            <Label>Turma</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aberto a todos</SelectItem>
                {turmas.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Descrição</Label><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      </div>
      <DialogFooter>
        <Button
          className="gradient-primary text-primary-foreground"
          onClick={() => {
            if (title.trim().length < 3) return toast.error("Título muito curto.");
            onSave({ title: title.trim(), date, description: description.trim(), class_id: classId === "none" ? undefined : classId });
          }}
        ><Save className="h-4 w-4 mr-2" /> Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
}

/* ============== REMINDERS ============== */

function RemindersTab() {
  const { reminders, addReminder, updateReminder, deleteReminder, toggleReminder, isOverdue, daysOverdue } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | "PENDING" | "DONE" | "OVERDUE">("ALL");
  const [priority, setPriority] = useState<"ALL" | Reminder["priority"]>("ALL");

  const filtered = useMemo(() => {
    return [...reminders]
      .filter((r) => {
        if (status === "PENDING" && r.done) return false;
        if (status === "DONE" && !r.done) return false;
        if (status === "OVERDUE" && !isOverdue(r)) return false;
        if (priority !== "ALL" && r.priority !== priority) return false;
        if (q && !`${r.title} ${r.description || ""}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => Number(a.done) - Number(b.done) || a.due_date.localeCompare(b.due_date));
  }, [reminders, q, status, priority, isOverdue]);

  const overdue = reminders.filter(isOverdue);

  return (
    <>
      {overdue.length > 0 && (
        <Card className="p-3 border-coral/40 bg-coral/5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-coral/15 text-coral"><AlertTriangle className="h-4 w-4" /></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{overdue.length} lembrete{overdue.length > 1 ? "s" : ""} atrasado{overdue.length > 1 ? "s" : ""}</p>
            <p className="text-[11px] text-muted-foreground">Use o filtro "Atrasados" para revisá-los.</p>
          </div>
          <Button size="sm" variant="outline" className="border-coral/40 text-coral" onClick={() => setStatus("OVERDUE")}>Ver</Button>
        </Card>
      )}

      <SearchBar
        value={q} onChange={setQ} placeholder="Buscar lembretes..."
        total={reminders.length} filtered={filtered.length}
        onClear={() => { setQ(""); setStatus("ALL"); setPriority("ALL"); }}
        filters={
          <>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger className="w-[130px] h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PENDING">Pendentes</SelectItem>
                <SelectItem value="DONE">Concluídos</SelectItem>
                <SelectItem value="OVERDUE">Atrasados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
              <SelectTrigger className="w-[120px] h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Prioridade</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="MEDIUM">Média</SelectItem>
                <SelectItem value="LOW">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogTrigger asChild>
          <Button className="w-full gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Novo lembrete</Button>
        </DialogTrigger>
        <ReminderDialog
          editing={editing}
          onSave={(p) => {
            if (editing) { updateReminder(editing.id, p); toast.success("Atualizado!"); }
            else { addReminder(p); toast.success("Lembrete criado!"); }
            setOpen(false); setEditing(null);
          }}
        />
      </Dialog>

      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title="Nenhum lembrete encontrado." />
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const od = isOverdue(r);
            return (
              <Card key={r.id} className={`p-3 flex items-start gap-3 transition-smooth ${r.done ? "opacity-60" : ""} ${od ? "border-coral/40 bg-coral/5" : ""}`}>
                <button
                  onClick={() => toggleReminder(r.id)}
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 ${r.done ? "bg-success border-success" : "border-border hover:border-primary"}`}
                >{r.done && <span className="text-[10px] text-success-foreground">✓</span>}</button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-semibold text-sm ${r.done ? "line-through" : ""}`}>{r.title}</p>
                    <Badge className={`${priorityClass[r.priority]} text-[10px]`}>{priorityLabel[r.priority]}</Badge>
                    <Badge variant="outline" className="text-[10px]">{targetLabel[r.target]}</Badge>
                    {od && <Badge variant="destructive" className="text-[10px]">Atrasado {daysOverdue(r)}d</Badge>}
                  </div>
                  {r.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{r.description}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">Prazo: {fmtDate(r.due_date)}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <ConfirmDelete onConfirm={() => { deleteReminder(r.id); toast.success("Removido."); }} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function ReminderDialog({ editing, onSave }: { editing: Reminder | null; onSave: (p: Omit<Reminder, "id" | "created_at" | "done">) => void }) {
  const [title, setTitle] = useState(editing?.title || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [due, setDue] = useState(editing?.due_date || new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<Reminder["priority"]>(editing?.priority || "MEDIUM");
  const [target, setTarget] = useState<Target>(editing?.target || "ALL");
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{editing ? "Editar lembrete" : "Novo lembrete"}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Prazo</Label><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
          <div>
            <Label>Prioridade</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Reminder["priority"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="MEDIUM">Média</SelectItem>
                <SelectItem value="LOW">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Para</Label>
            <Select value={target} onValueChange={(v) => setTarget(v as Target)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(targetLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Descrição</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      </div>
      <DialogFooter>
        <Button
          className="gradient-primary text-primary-foreground"
          onClick={() => {
            if (title.trim().length < 3) return toast.error("Título muito curto.");
            onSave({ title: title.trim(), description: description.trim(), due_date: due, priority, target });
          }}
        ><Bell className="h-4 w-4 mr-2" /> Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
}

/* ============== BLOG ============== */

function BlogTab() {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useData();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [q, setQ] = useState("");
  const [author, setAuthor] = useState<string>("ALL");
  const authors = Array.from(new Set(blogPosts.map((p) => p.author)));

  const filtered = useMemo(() => blogPosts.filter((p) => {
    if (author !== "ALL" && p.author !== author) return false;
    if (q && !`${p.title} ${p.excerpt}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [blogPosts, q, author]);

  return (
    <>
      <SearchBar
        value={q} onChange={setQ} placeholder="Buscar posts..."
        total={blogPosts.length} filtered={filtered.length}
        onClear={() => { setQ(""); setAuthor("ALL"); }}
        filters={
          <Select value={author} onValueChange={setAuthor}>
            <SelectTrigger className="w-[170px] h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos autores</SelectItem>
              {authors.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogTrigger asChild>
          <Button className="w-full gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Novo post</Button>
        </DialogTrigger>
        <BlogDialog
          editing={editing}
          onSave={(p) => {
            if (editing) { updateBlogPost(editing.id, p); toast.success("Post atualizado!"); }
            else { addBlogPost({ ...p, author: user?.name || "Coordenação" }); toast.success("Post publicado!"); }
            setOpen(false); setEditing(null);
          }}
        />
      </Dialog>

      {filtered.length === 0 ? (
        <EmptyState icon={Newspaper} title="Nenhum post encontrado." />
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card key={p.id} className="p-3 flex items-center gap-3 hover:shadow-soft transition-smooth">
              <div className="h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{p.excerpt}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.author} • {new Date(p.published_at).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <ConfirmDelete onConfirm={() => { deleteBlogPost(p.id); toast.success("Removido."); }} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function BlogDialog({ editing, onSave }: { editing: BlogPost | null; onSave: (p: Omit<BlogPost, "id" | "published_at" | "author">) => void }) {
  const [title, setTitle] = useState(editing?.title || "");
  const [cover, setCover] = useState(editing?.cover_image || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop");
  const [excerpt, setExcerpt] = useState(editing?.excerpt || "");
  const [content, setContent] = useState(editing?.content || "");
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>{editing ? "Editar post" : "Novo post"}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><Label>URL da imagem de capa</Label><Input value={cover} onChange={(e) => setCover(e.target.value)} /></div>
        <div><Label>Resumo</Label><Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} /></div>
        <div><Label>Conteúdo</Label><Textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} /></div>
      </div>
      <DialogFooter>
        <Button
          className="gradient-primary text-primary-foreground"
          onClick={() => {
            if (title.trim().length < 3) return toast.error("Título muito curto.");
            if (content.trim().length < 20) return toast.error("Conteúdo muito curto.");
            onSave({ title: title.trim(), cover_image: cover, excerpt: excerpt.trim(), content: content.trim() });
          }}
        ><FileText className="h-4 w-4 mr-2" /> {editing ? "Salvar" : "Publicar"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

/* ============== TURMAS / ALUNAS ============== */

function TurmasTab() {
  const { turmas, students, addTurma, updateTurma, deleteTurma, addStudent, updateStudent, deleteStudent, assignStudentToTurma, removeStudentFromTurma } = useData();
  const teachers = seedUsers.filter((u) => u.role === "TEACHER");
  const [selectedTurma, setSelectedTurma] = useState<string | null>(turmas[0]?.id || null);
  const [turmaDialog, setTurmaDialog] = useState<{ open: boolean; editing: Turma | null }>({ open: false, editing: null });
  const [studentDialog, setStudentDialog] = useState<{ open: boolean; editing: User | null }>({ open: false, editing: null });
  const [qStudent, setQStudent] = useState("");

  const turma = turmas.find((t) => t.id === selectedTurma) || turmas[0];
  const inTurma = students.filter((s) => turma?.studentIds.includes(s.id));
  const filteredInTurma = inTurma.filter((s) => !qStudent || s.name.toLowerCase().includes(qStudent.toLowerCase()));
  const outOfTurma = students.filter((s) => !turma?.studentIds.includes(s.id));

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Turmas */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><UsersIcon className="h-4 w-4 text-primary" /> Turmas</h3>
            <Dialog open={turmaDialog.open} onOpenChange={(o) => setTurmaDialog({ open: o, editing: o ? turmaDialog.editing : null })}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1" /> Nova</Button>
              </DialogTrigger>
              <TurmaDialog
                editing={turmaDialog.editing}
                teachers={teachers}
                onSave={(p) => {
                  if (turmaDialog.editing) { updateTurma(turmaDialog.editing.id, p); toast.success("Turma atualizada!"); }
                  else { addTurma(p); toast.success("Turma criada!"); }
                  setTurmaDialog({ open: false, editing: null });
                }}
              />
            </Dialog>
          </div>
          <ul className="space-y-2">
            {turmas.map((t) => {
              const teacher = teachers.find((x) => x.id === t.teacher_id);
              const active = t.id === turma?.id;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedTurma(t.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-smooth ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40"}`}
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <UsersIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{teacher?.name || "Sem responsável"} • {t.studentIds.length} aluna{t.studentIds.length !== 1 ? "s" : ""}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <div className="flex justify-end gap-1 mt-1">
                    <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setTurmaDialog({ open: true, editing: t })}><Pencil className="h-3 w-3 mr-1" /> Editar</Button>
                    <ConfirmDelete onConfirm={() => { deleteTurma(t.id); if (selectedTurma === t.id) setSelectedTurma(null); toast.success("Turma removida."); }} small />
                  </div>
                </li>
              );
            })}
            {turmas.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">Nenhuma turma cadastrada.</p>}
          </ul>
        </Card>

        {/* Alunas */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><GraduationCap className="h-4 w-4 text-secondary" /> Alunas {turma && <span className="text-muted-foreground font-normal">— {turma.name}</span>}</h3>
            <Dialog open={studentDialog.open} onOpenChange={(o) => setStudentDialog({ open: o, editing: o ? studentDialog.editing : null })}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={!turma}><UserPlus className="h-3.5 w-3.5 mr-1" /> Nova aluna</Button>
              </DialogTrigger>
              <StudentDialog
                editing={studentDialog.editing}
                onSave={(p) => {
                  if (studentDialog.editing) {
                    updateStudent(studentDialog.editing.id, p);
                    toast.success("Aluna atualizada!");
                  } else {
                    addStudent({ ...p, classIds: turma ? [turma.id] : [], status: "APPROVED" });
                    toast.success("Aluna cadastrada!");
                  }
                  setStudentDialog({ open: false, editing: null });
                }}
              />
            </Dialog>
          </div>

          {!turma ? (
            <p className="text-xs text-muted-foreground text-center py-6">Selecione uma turma para ver as alunas.</p>
          ) : (
            <>
              <div className="mb-3">
                <Input placeholder="Buscar aluna..." value={qStudent} onChange={(e) => setQStudent(e.target.value)} className="h-9" />
              </div>
              <ul className="space-y-1.5">
                {filteredInTurma.map((s) => {
                  const initials = s.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
                  return (
                    <li key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-smooth">
                      <Avatar className="h-9 w-9"><AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-xs font-bold">{initials}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{s.email}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setStudentDialog({ open: true, editing: s })}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { removeStudentFromTurma(s.id, turma.id); toast.success("Removida da turma."); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  );
                })}
                {filteredInTurma.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhuma aluna nesta turma.</p>}
              </ul>

              {outOfTurma.length > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Disponíveis para adicionar</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {outOfTurma.map((s) => (
                      <div key={s.id} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-muted/40 text-sm">
                        <span className="truncate">{s.name}</span>
                        <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => { assignStudentToTurma(s.id, turma.id); toast.success("Adicionada à turma."); }}>
                          <Plus className="h-3 w-3 mr-1" /> Adicionar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Lista geral de alunas */}
      {students.length > 0 && (
        <Card className="p-4 mt-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><GraduationCap className="h-4 w-4 text-muted-foreground" /> Todas as alunas ({students.length})</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {students.map((s) => {
              const turmasOfStudent = turmas.filter((t) => t.studentIds.includes(s.id));
              return (
                <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg border text-sm">
                  <Avatar className="h-8 w-8"><AvatarFallback className="bg-muted text-[10px]">{s.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{turmasOfStudent.map(t=>t.name).join(", ") || "Sem turma"}</p>
                  </div>
                  <ConfirmDelete onConfirm={() => { deleteStudent(s.id); toast.success("Aluna removida."); }} small />
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}

function TurmaDialog({ editing, teachers, onSave }: { editing: Turma | null; teachers: User[]; onSave: (p: Omit<Turma, "id" | "studentIds">) => void }) {
  const [name, setName] = useState(editing?.name || "");
  const [teacher, setTeacher] = useState(editing?.teacher_id || teachers[0]?.id || "");
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{editing ? "Editar turma" : "Nova turma"}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Nome da turma</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Turma Sementes — 4º Ano" /></div>
        <div>
          <Label>Professor(a) responsável</Label>
          <Select value={teacher} onValueChange={setTeacher}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button
          className="gradient-primary text-primary-foreground"
          onClick={() => {
            if (name.trim().length < 3) return toast.error("Nome muito curto.");
            onSave({ name: name.trim(), teacher_id: teacher });
          }}
        ><Save className="h-4 w-4 mr-2" /> Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function StudentDialog({ editing, onSave }: { editing: User | null; onSave: (p: { name: string; email: string }) => void }) {
  const [name, setName] = useState(editing?.name || "");
  const [email, setEmail] = useState(editing?.email || "");
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{editing ? "Editar aluna" : "Nova aluna"}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Nome completo</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>E-mail (opcional)</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aluna@ong.org" /></div>
      </div>
      <DialogFooter>
        <Button
          className="gradient-primary text-primary-foreground"
          onClick={() => {
            if (name.trim().length < 3) return toast.error("Nome muito curto.");
            onSave({ name: name.trim(), email: email.trim() });
          }}
        ><Save className="h-4 w-4 mr-2" /> Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
}

/* ============== HELPERS ============== */

function ConfirmDelete({ onConfirm, small }: { onConfirm: () => void; small?: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size={small ? "sm" : "icon"} className={`text-destructive hover:bg-destructive/10 ${small ? "h-7 text-[11px]" : "h-8 w-8"}`}>
          <Trash2 className={small ? "h-3 w-3 mr-1" : "h-4 w-4"} /> {small && "Excluir"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onConfirm}>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
