import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ModernLayout, ModernCard, ModernSection, ModernBadge, ModernEmptyState } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSocialRecords, useUser } from "@/hooks/useSupabaseData";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { SocialRecord as SocialRecordType } from "@/lib/supabase";
import { FileText, Plus, Calendar, User, Paperclip, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function SocialRecordPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useSupabaseAuth();
  const { user, loading: userLoading } = useUser(userId || null);
  const { records, loading: recordsLoading, addRecord } = useSocialRecords(userId || null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    record_type: "OBSERVATION" as SocialRecordType["record_type"],
    title: "",
    description: "",
    record_date: new Date().toISOString().split("T")[0],
  });

  const handleAddRecord = async () => {
    if (!userId || !currentUser) return;

    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    const result = await addRecord({
      user_id: userId,
      record_type: formData.record_type,
      title: formData.title,
      description: formData.description,
      record_date: formData.record_date,
      attachments: [],
      created_by: currentUser.id,
    });

    if (result.success) {
      toast.success("Registro adicionado com sucesso!");
      setFormData({
        record_type: "OBSERVATION",
        title: "",
        description: "",
        record_date: new Date().toISOString().split("T")[0],
      });
      setIsDialogOpen(false);
    } else {
      toast.error(result.error || "Erro ao adicionar registro");
    }
  };

  const getRecordTypeLabel = (type: SocialRecordType["record_type"]): string => {
    const labels: Record<SocialRecordType["record_type"], string> = {
      PARTICIPATION: "Participação",
      BENEFIT: "Benefício",
      EVENT: "Evento",
      OBSERVATION: "Observação",
      DOCUMENT: "Documento",
    };
    return labels[type];
  };

  const getRecordTypeColor = (type: SocialRecordType["record_type"]) => {
    const colors: Record<SocialRecordType["record_type"], "primary" | "secondary" | "success" | "warning" | "destructive"> = {
      PARTICIPATION: "primary",
      BENEFIT: "success",
      EVENT: "secondary",
      OBSERVATION: "warning",
      DOCUMENT: "secondary",
    };
    return colors[type];
  };

  if (userLoading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando prontuário...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (!user) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center h-screen">
          <ModernCard className="p-8 max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <h2 className="text-lg font-semibold">Usuário não encontrado</h2>
            </div>
            <p className="text-muted-foreground">Não foi possível carregar o prontuário do usuário.</p>
          </ModernCard>
        </div>
      </ModernLayout>
    );
  }

  const sidebarItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Usuários", href: "/admin/users", icon: "👥" },
    { label: "Presença", href: "/admin/attendance", icon: "✓" },
    { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
  ];

  return (
    <ModernLayout>
      <ModernSidebar items={sidebarItems} />
      <div className="lg:ml-64">
        <ModernTopBar
          title="Prontuário Digital"
          user={currentUser ? { name: currentUser.full_name, email: currentUser.email } : undefined}
        />

        <div className="p-6 max-w-6xl">
          <ModernPageHeader
            title={`Prontuário de ${user.full_name}`}
            description="Histórico completo de participação, benefícios e observações"
            icon={<FileText />}
            action={
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Registro
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Registro</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="record_type">Tipo de Registro *</Label>
                      <Select
                        value={formData.record_type}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            record_type: value as SocialRecordType["record_type"],
                          })
                        }
                      >
                        <SelectTrigger id="record_type" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PARTICIPATION">Participação</SelectItem>
                          <SelectItem value="BENEFIT">Benefício</SelectItem>
                          <SelectItem value="EVENT">Evento</SelectItem>
                          <SelectItem value="OBSERVATION">Observação</SelectItem>
                          <SelectItem value="DOCUMENT">Documento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Título do registro"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="record_date">Data do Registro *</Label>
                      <Input
                        id="record_date"
                        type="date"
                        value={formData.record_date}
                        onChange={(e) =>
                          setFormData({ ...formData, record_date: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Descreva o registro em detalhes"
                        rows={6}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleAddRecord}>Adicionar Registro</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            }
          />

          {/* Timeline de Registros */}
          <ModernSection title="Linha do Tempo" subtitle="Histórico completo de atividades e eventos">
            {recordsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando registros...</p>
              </div>
            ) : records.length === 0 ? (
              <ModernEmptyState
                icon={<FileText />}
                title="Nenhum registro encontrado"
                description="Comece adicionando o primeiro registro ao prontuário"
              />
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <ModernCard key={record.id} className="p-6 hover-lift">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{record.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(record.record_date), "dd 'de' MMMM 'de' yyyy", {
                                  locale: ptBR,
                                })}
                              </span>
                            </div>
                          </div>
                          <ModernBadge variant={getRecordTypeColor(record.record_type)}>
                            {getRecordTypeLabel(record.record_type)}
                          </ModernBadge>
                        </div>
                        {record.description && (
                          <p className="text-sm text-foreground/80 mt-3 line-clamp-3">
                            {record.description}
                          </p>
                        )}
                        {record.attachments && record.attachments.length > 0 && (
                          <div className="flex items-center gap-2 mt-3">
                            <Paperclip className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {record.attachments.length} anexo(s)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </ModernCard>
                ))}
              </div>
            )}
          </ModernSection>

          {/* Estatísticas */}
          <ModernSection title="Estatísticas" subtitle="Resumo de atividades">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <ModernCard className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{records.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Total de Registros</p>
              </ModernCard>
              <ModernCard className="p-4 text-center">
                <p className="text-2xl font-bold text-secondary">
                  {records.filter((r) => r.record_type === "PARTICIPATION").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Participações</p>
              </ModernCard>
              <ModernCard className="p-4 text-center">
                <p className="text-2xl font-bold text-success">
                  {records.filter((r) => r.record_type === "BENEFIT").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Benefícios</p>
              </ModernCard>
              <ModernCard className="p-4 text-center">
                <p className="text-2xl font-bold text-warning">
                  {records.filter((r) => r.record_type === "EVENT").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Eventos</p>
              </ModernCard>
              <ModernCard className="p-4 text-center">
                <p className="text-2xl font-bold text-tertiary">
                  {records.filter((r) => r.record_type === "OBSERVATION").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Observações</p>
              </ModernCard>
            </div>
          </ModernSection>
        </div>
      </div>
    </ModernLayout>
  );
}
