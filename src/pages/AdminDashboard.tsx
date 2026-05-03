import { useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useData, Reminder } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Megaphone, CalendarDays, Bell, Newspaper, Users,
  Plus, Trash2, RotateCcw, ShieldCheck, Send, Save,
} from "lucide-react";

type Target = "ALL" | "TEACHERS" | "PARENTS" | "STUDENTS";
const targetLabel: Record<Target, string> = {
  ALL: "Todos", TEACHERS: "Professores", PARENTS: "Responsáveis", STUDENTS: "Alunos",
};
const priorityLabel: Record<Reminder["priority"], string> = {
  HIGH: "Alta", MEDIUM: "Média", LOW: "Baixa",
};
const priorityClass: Record<Reminder["priority"], string> = {
  HIGH: "bg-coral text-coral-foreground",
  MEDIUM: "bg-secondary text-secondary-foreground",
  LOW: "bg-tertiary text-tertiary-foreground",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const data = useData();

  return (
    <AppLayout>
      <section className="mb-6 rounded-3xl gradient-brand p-6 text-primary-foreground shadow-elevated relative overflow-hidden">
        <ShieldCheck className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10" />
        <p className="text-sm opacity-90">Painel administrativo</p>
        <h1 className="text-2xl font-bold mt-1">Olá, {user?.name?.split(" ")[0]}</h1>
        <p className="mt-2 text-sm opacity-95 max-w-md">
          Gerencie comunicados, eventos, lembretes, blog e turmas da Associação Camila.
        </p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          <Stat label="Comunicados" value={data.announcements.length} />
          <Stat label="Eventos" value={data.events.length} />
          <Stat label="Lembretes" value={data.reminders.filter((r) => !r.done).length} />
          <Stat label="Posts" value={data.blogPosts.length} />
        </div>
      </section>

      <Tabs defaultValue="comunicados" className="w-full">
        <TabsList className="grid grid-cols-5 w-full h-auto">
          <TabsTrigger value="comunicados" className="flex-col gap-1 py-2 text-[11px]">
            <Megaphone className="h-4 w-4" /> Comunicados
          </TabsTrigger>
          <TabsTrigger value="eventos" className="flex-col gap-1 py-2 text-[11px]">
            <CalendarDays className="h-4 w-4" /> Eventos
          </TabsTrigger>
          <TabsTrigger value="lembretes" className="flex-col gap-1 py-2 text-[11px]">
            <Bell className="h-4 w-4" /> Lembretes
          </TabsTrigger>
          <TabsTrigger value="blog" className="flex-col gap-1 py-2 text-[11px]">
            <Newspaper className="h-4 w-4" /> Blog
          </TabsTrigger>
          <TabsTrigger value="turmas" className="flex-col gap-1 py-2 text-[11px]">
            <Users className="h-4 w-4" /> Turmas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comunicados" className="mt-4 space-y-4">
          <AnnouncementForm />
          <AnnouncementList />
        </TabsContent>
        <TabsContent value="eventos" className="mt-4 space-y-4">
          <EventForm />
          <EventList />
        </TabsContent>
        <TabsContent value="lembretes" className="mt-4 space-y-4">
          <ReminderForm />
          <ReminderList />
        </TabsContent>
        <TabsContent value="blog" className="mt-4 space-y-4">
          <BlogForm />
          <BlogList />
        </TabsContent>
        <TabsContent value="turmas" className="mt-4 space-y-4">
          <TurmasView />
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5 mr-2" /> Restaurar dados de demonstração
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Restaurar dados?</AlertDialogTitle>
              <AlertDialogDescription>
                Isso apaga tudo que você criou e devolve o app ao estado inicial de demonstração.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => { data.resetAll(); toast.success("Dados restaurados."); }}>
                Restaurar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur p-2.5 text-center">
      <p className="text-xl font-bold leading-none">{value}</p>
      <p className="text-[10px] opacity-90 mt-1">{label}</p>
    </div>
  );
}

/* ---------------- Comunicados ---------------- */
function AnnouncementForm() {
  const { addAnnouncement } = useData();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState<Target>("ALL");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) return toast.error("Título muito curto.");
    if (content.trim().length < 10) return toast.error("Conteúdo muito curto.");
    addAnnouncement({ title: title.trim(), content: content.trim(), target, author: user?.name || "Coordenação" });
    setTitle(""); setContent(""); setTarget("ALL");
    toast.success("Comunicado publicado!");
  };

  return (
    <Card className="p-4">
      <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Novo comunicado</p>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label htmlFor="ac-title">Título</Label>
          <Input id="ac-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Reunião extraordinária" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Destinatários</Label>
            <Select value={target} onValueChange={(v) => setTarget(v as Target)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(targetLabel).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="ac-content">Mensagem</Label>
          <Textarea id="ac-content" rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escreva o conteúdo..." />
        </div>
        <Button type="submit" className="w-full gradient-primary text-primary-foreground"><Send className="h-4 w-4 mr-2" /> Publicar</Button>
      </form>
    </Card>
  );
}

function AnnouncementList() {
  const { announcements, deleteAnnouncement } = useData();
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Publicados ({announcements.length})</p>
      {announcements.map((a) => (
        <Card key={a.id} className="p-3 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm">{a.title}</p>
              <Badge variant="outline" className="text-[10px]">{targetLabel[a.target]}</Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{a.content}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{a.author} • {new Date(a.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { deleteAnnouncement(a.id); toast.success("Removido."); }} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Eventos ---------------- */
function EventForm() {
  const { addEvent, turmas } = useData();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState<string>("none");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) return toast.error("Título muito curto.");
    addEvent({ title: title.trim(), date, description: description.trim(), class_id: classId === "none" ? undefined : classId });
    setTitle(""); setDescription(""); setClassId("none");
    toast.success("Evento criado!");
  };

  return (
    <Card className="p-4">
      <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Novo evento</p>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label htmlFor="ev-title">Título</Label>
          <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Oficina de teatro" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="ev-date">Data</Label>
            <Input id="ev-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Turma (opcional)</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aberto a todos</SelectItem>
                {turmas.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="ev-desc">Descrição</Label>
          <Textarea id="ev-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do evento..." />
        </div>
        <Button type="submit" className="w-full gradient-primary text-primary-foreground"><Save className="h-4 w-4 mr-2" /> Salvar evento</Button>
      </form>
    </Card>
  );
}

function EventList() {
  const { events, deleteEvent, turmas } = useData();
  const sorted = useMemo(() => [...events].sort((a, b) => a.date.localeCompare(b.date)), [events]);
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agenda ({events.length})</p>
      {sorted.map((e) => {
        const turma = turmas.find((t) => t.id === e.class_id);
        return (
          <Card key={e.id} className="p-3 flex items-center gap-3">
            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-primary/12 text-primary flex-shrink-0">
              <span className="text-[10px] font-semibold uppercase">{new Date(e.date).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span>
              <span className="text-base font-bold leading-none">{new Date(e.date).getDate()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{e.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{e.description}</p>
              {turma && <Badge variant="outline" className="mt-1 text-[10px]">{turma.name}</Badge>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => { deleteEvent(e.id); toast.success("Removido."); }} className="text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------- Lembretes ---------------- */
function ReminderForm() {
  const { addReminder } = useData();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState(new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<Reminder["priority"]>("MEDIUM");
  const [target, setTarget] = useState<Target>("ALL");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) return toast.error("Título muito curto.");
    addReminder({ title: title.trim(), description: description.trim(), due_date: due, priority, target });
    setTitle(""); setDescription(""); setPriority("MEDIUM"); setTarget("ALL");
    toast.success("Lembrete criado!");
  };

  return (
    <Card className="p-4">
      <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Novo lembrete</p>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label htmlFor="r-title">Título</Label>
          <Input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Trazer material de arte" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="r-due">Prazo</Label>
            <Input id="r-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
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
              <SelectContent>
                {Object.entries(targetLabel).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="r-desc">Descrição (opcional)</Label>
          <Textarea id="r-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes adicionais..." />
        </div>
        <Button type="submit" className="w-full gradient-primary text-primary-foreground"><Bell className="h-4 w-4 mr-2" /> Criar lembrete</Button>
      </form>
    </Card>
  );
}

function ReminderList() {
  const { reminders, deleteReminder, toggleReminder } = useData();
  const sorted = useMemo(() => [...reminders].sort((a, b) => a.due_date.localeCompare(b.due_date)), [reminders]);
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ativos</p>
      {sorted.map((r) => (
        <Card key={r.id} className={`p-3 flex items-start gap-3 ${r.done ? "opacity-60" : ""}`}>
          <button
            onClick={() => toggleReminder(r.id)}
            className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 ${r.done ? "bg-success border-success" : "border-border hover:border-primary"}`}
            aria-label="Marcar como concluído"
          >
            {r.done && <span className="text-[10px] text-success-foreground">✓</span>}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-semibold text-sm ${r.done ? "line-through" : ""}`}>{r.title}</p>
              <Badge className={`${priorityClass[r.priority]} text-[10px]`}>{priorityLabel[r.priority]}</Badge>
              <Badge variant="outline" className="text-[10px]">{targetLabel[r.target]}</Badge>
            </div>
            {r.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{r.description}</p>}
            <p className="text-[10px] text-muted-foreground mt-1">Prazo: {new Date(r.due_date).toLocaleDateString("pt-BR")}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { deleteReminder(r.id); toast.success("Removido."); }} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Blog ---------------- */
function BlogForm() {
  const { addBlogPost } = useData();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [cover, setCover] = useState("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) return toast.error("Título muito curto.");
    if (content.trim().length < 20) return toast.error("Conteúdo muito curto.");
    addBlogPost({ title: title.trim(), excerpt: excerpt.trim() || content.trim().slice(0, 120), content: content.trim(), cover_image: cover, author: user?.name || "Coordenação" });
    setTitle(""); setExcerpt(""); setContent("");
    toast.success("Post publicado!");
  };

  return (
    <Card className="p-4">
      <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Novo post no blog</p>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label htmlFor="b-title">Título</Label>
          <Input id="b-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Conquistas de abril" />
        </div>
        <div>
          <Label htmlFor="b-cover">URL da imagem de capa</Label>
          <Input id="b-cover" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <Label htmlFor="b-excerpt">Resumo (opcional)</Label>
          <Input id="b-excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Breve descrição..." />
        </div>
        <div>
          <Label htmlFor="b-content">Conteúdo</Label>
          <Textarea id="b-content" rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escreva o post..." />
        </div>
        <Button type="submit" className="w-full gradient-primary text-primary-foreground"><Send className="h-4 w-4 mr-2" /> Publicar post</Button>
      </form>
    </Card>
  );
}

function BlogList() {
  const { blogPosts, deleteBlogPost } = useData();
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Publicados ({blogPosts.length})</p>
      {blogPosts.map((p) => (
        <Card key={p.id} className="p-3 flex items-center gap-3">
          <div className="h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
            <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{p.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{p.excerpt}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{p.author} • {new Date(p.published_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { deleteBlogPost(p.id); toast.success("Removido."); }} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Turmas ---------------- */
function TurmasView() {
  const { turmas } = useData();
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Turmas cadastradas</p>
      {turmas.map((t) => (
        <Card key={t.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.studentIds.length} alunos cadastrados</p>
            </div>
            <Badge variant="outline" className="text-[10px]">Ativa</Badge>
          </div>
        </Card>
      ))}
      <p className="text-[11px] text-muted-foreground text-center pt-2">
        Para cadastrar novas turmas e alunos, conecte o backend Lovable Cloud.
      </p>
    </div>
  );
}