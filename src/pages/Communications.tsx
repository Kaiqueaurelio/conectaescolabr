import { useState } from "react";
import { ModernLayout, ModernCard, ModernSection, ModernEmptyState, ModernBadge } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader, ModernTabs } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useUsers } from "@/hooks/useSupabaseData";
import { Bell, Send, MessageSquare, Users, Clock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  target: string[];
  created_at: string;
  priority: "low" | "medium" | "high";
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export function CommunicationsPage() {
  const { user: currentUser } = useSupabaseAuth();
  const { users: realUsers } = useUsers();

  const [activeTab, setActiveTab] = useState("announcements");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    target: [] as string[],
    priority: "medium" as "low" | "medium" | "high",
  });

  const [newMessage, setNewMessage] = useState("");

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }

    if (newAnnouncement.target.length === 0) {
      toast.error("Selecione pelo menos um público-alvo");
      return;
    }

    const announcement: Announcement = {
      id: `ann-${Date.now()}`,
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      author: currentUser?.full_name || "Anônimo",
      target: newAnnouncement.target,
      created_at: new Date().toISOString(),
      priority: newAnnouncement.priority,
    };

    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({ title: "", content: "", target: [], priority: "medium" });
    toast.success("Comunicado publicado com sucesso!");
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast.error("Mensagem não pode estar vazia");
      return;
    }

    const message: Message = {
      id: `msg-${Date.now()}`,
      sender: currentUser?.full_name || "Anônimo",
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true,
    };

    setMessages([...messages, message]);
    setNewMessage("");
    toast.success("Mensagem enviada!");
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!window.confirm("Remover este comunicado?")) return;
    setAnnouncements(announcements.filter((a) => a.id !== id));
    toast.success("Comunicado removido");
  };

  const handleClearAnnouncements = () => {
    if (!window.confirm("Remover todos os comunicados?")) return;
    setAnnouncements([]);
    toast.success("Comunicados removidos");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "muted";
      default:
        return "muted";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Urgente";
      case "medium":
        return "Normal";
      case "low":
        return "Baixa";
      default:
        return "Normal";
    }
  };

  const sidebarItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Usuários", href: "/admin/users", icon: "👥" },
    { label: "Presença", href: "/admin/attendance", icon: "✓" },
    { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
  ];

  const tabs = [
    { label: "Comunicados", value: "announcements", icon: <Bell className="w-4 h-4" /> },
    { label: "Mensagens", value: "messages", icon: <MessageSquare className="w-4 h-4" /> },
    { label: "Grupos", value: "groups", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <ModernLayout>
      <ModernSidebar items={sidebarItems} />
      <div className="lg:ml-64">
        <ModernTopBar
          title="Comunicação Interna"
          user={currentUser ? { name: currentUser.full_name, email: currentUser.email } : undefined}
        />

        <div className="p-6">
          <ModernPageHeader
            title="Comunicação"
            description="Gerencie comunicados, mensagens e grupos internos"
            icon={<MessageSquare />}
          />

          <ModernTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Aba: Comunicados */}
          {activeTab === "announcements" && (
            <div className="space-y-6 mt-6">
              {/* Criar Comunicado */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mb-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Comunicado
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Comunicado</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={newAnnouncement.title}
                        onChange={(e) =>
                          setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                        }
                        placeholder="Título do comunicado"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Conteúdo *</Label>
                      <Textarea
                        id="content"
                        value={newAnnouncement.content}
                        onChange={(e) =>
                          setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
                        }
                        placeholder="Conteúdo do comunicado"
                        rows={6}
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select
                          value={newAnnouncement.priority}
                          onValueChange={(value) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              priority: value as "low" | "medium" | "high",
                            })
                          }
                        >
                          <SelectTrigger id="priority" className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Normal</SelectItem>
                            <SelectItem value="high">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="target">Público-alvo *</Label>
                        <Select
                          value={newAnnouncement.target[0] || ""}
                          onValueChange={(value) =>
                            setNewAnnouncement({ ...newAnnouncement, target: [value] })
                          }
                        >
                          <SelectTrigger id="target" className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            <SelectItem value="TEACHERS">Professores</SelectItem>
                            <SelectItem value="STUDENTS">Alunos</SelectItem>
                            <SelectItem value="PARENTS">Responsáveis</SelectItem>
                            <SelectItem value="VOLUNTEERS">Voluntários</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button variant="outline">Cancelar</Button>
                      <Button onClick={handleAddAnnouncement}>Publicar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              {announcements.length > 0 && (
                <Button variant="destructive" className="mb-4 ml-2" onClick={handleClearAnnouncements}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar tudo
                </Button>
              )}

              {/* Lista de Comunicados */}
              <ModernSection title="Comunicados Recentes">
                {announcements.length === 0 ? (
                  <ModernEmptyState
                    icon={<Bell />}
                    title="Nenhum comunicado"
                    description="Comece criando um novo comunicado"
                  />
                ) : (
                  <div className="space-y-3">
                    {announcements.map((ann) => (
                      <ModernCard key={ann.id} className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">{ann.title}</h3>
                              <ModernBadge variant={getPriorityColor(ann.priority)} size="sm">
                                {getPriorityLabel(ann.priority)}
                              </ModernBadge>
                            </div>
                            <p className="text-sm text-foreground/80 mb-3">{ann.content}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Por: {ann.author}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(ann.created_at), "dd 'de' MMMM 'às' HH:mm", {
                                  locale: ptBR,
                                })}
                              </span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </ModernCard>
                    ))}
                  </div>
                )}
              </ModernSection>
            </div>
          )}

          {/* Aba: Mensagens */}
          {activeTab === "messages" && (
            <div className="space-y-6 mt-6">
              <ModernCard className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Mural Interno</h3>

                {/* Chat */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {msg.sender.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{msg.sender}</p>
                        <p className="text-sm text-foreground/80 mt-1">{msg.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(msg.timestamp), "HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    placeholder="Digite sua mensagem..."
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </ModernCard>
            </div>
          )}

          {/* Aba: Grupos */}
          {activeTab === "groups" && (
            <div className="space-y-6 mt-6">
              <ModernCard className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Grupos Internos</h3>
                <div className="space-y-3">
                  {[
                    { name: "Coordenação", role: "ADMIN" },
                    { name: "Professores / Colaboradores", role: "TEACHER" },
                    { name: "Alunos", role: "STUDENT" },
                    { name: "Responsáveis", role: "PARENT" },
                    { name: "Voluntários", role: "VOLUNTEER" },
                  ].map((g) => ({ ...g, members: realUsers.filter((u) => u.role === g.role).length })).map((group, index) => (
                    <ModernCard key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">{group.name}</p>
                            <p className="text-xs text-muted-foreground">{group.members} membros</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Acessar
                        </Button>
                      </div>
                    </ModernCard>
                  ))}
                </div>
              </ModernCard>
            </div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
}
