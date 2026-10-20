import { useState, useEffect } from "react";
import { ModernLayout, ModernCard, ModernSection, ModernEmptyState } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader, ModernTabs } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { Shield, Lock, Eye, EyeOff, Download, Trash2, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface DataRequest {
  id: string;
  type: "export" | "deletion";
  status: "pending" | "processing" | "completed";
  requested_at: string;
  completed_at?: string;
}

interface AuditLog {
  id: string;
  action: string;
  details?: Record<string, unknown> | null;
  created_at: string;
}

export function SecurityAndLGPDPage() {
  const { user: currentUser } = useSupabaseAuth();

  const [activeTab, setActiveTab] = useState("security");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) {
      setDataRequests([]);
      setAuditLogs([]);
      setLoadingAuditLogs(false);
      return;
    }

    let active = true;
    const loadAuditLogs = async () => {
      setLoadingAuditLogs(true);
      const { data, error } = await supabase
        .from("user_activity_logs")
        .select("id,action,details,created_at")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!active) return;
      if (error) {
        console.error("Erro ao carregar auditoria:", error);
        setAuditLogs([]);
        setDataRequests([]);
        setLoadingAuditLogs(false);
        return;
      }

      const logs = (data ?? []) as AuditLog[];
      setAuditLogs(logs);
      setDataRequests(logs.flatMap((log) => {
        if (log.action !== "LGPD_DATA_EXPORT" && log.action !== "LGPD_DATA_DELETION_REQUEST") return [];
        const details = log.details ?? {};
        return [{
          id: log.id,
          type: details.type === "deletion" ? "deletion" as const : "export" as const,
          status: details.status === "completed" ? "completed" as const : "pending" as const,
          requested_at: typeof details.requested_at === "string" ? details.requested_at : log.created_at,
          ...(typeof details.completed_at === "string" ? { completed_at: details.completed_at } : {}),
        }];
      }));
      setLoadingAuditLogs(false);
    };

    void loadAuditLogs().catch((error) => {
      console.error("Erro inesperado ao carregar auditoria:", error);
      if (active) setLoadingAuditLogs(false);
    });
    return () => { active = false; };
  }, [currentUser?.id]);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast.error("Use pelo menos 8 caracteres, com letras maiúsculas, minúsculas e números.");
      return;
    }

    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error(`Não foi possível alterar a senha: ${error.message}`);
      return;
    }

    const createdAt = new Date().toISOString();
    const { error: auditError } = await supabase.from("user_activity_logs").insert({
      user_id: currentUser?.id,
      action: "PASSWORD_CHANGED",
      details: { changed_at: createdAt },
    });
    setNewPassword("");
    setConfirmPassword("");
    if (auditError) {
      console.error("Senha alterada, mas a auditoria não foi gravada:", auditError);
      toast.warning("Senha alterada, mas não foi possível registrar o evento de auditoria.");
    } else {
      toast.success("Senha alterada com sucesso.");
    }
  };

  const handleExportData = async () => {
    if (!currentUser?.id) {
      toast.error("Sua sessão não foi identificada. Entre novamente.");
      return;
    }

    setExporting(true);
    const [profile, socialRecords, attendanceRecords, benefits] = await Promise.all([
      supabase.from("users").select("*").eq("id", currentUser.id).single(),
      supabase.from("social_records").select("*").eq("user_id", currentUser.id),
      supabase.from("attendance_records").select("*").eq("user_id", currentUser.id),
      supabase.from("benefit_distributions").select("*").eq("user_id", currentUser.id),
    ]);
    setExporting(false);

    const queryError = profile.error || socialRecords.error || attendanceRecords.error || benefits.error;
    if (queryError || !profile.data) {
      console.error("Erro ao exportar dados pessoais:", queryError);
      toast.error("Não foi possível consultar todos os seus dados. Nenhum arquivo foi criado.");
      return;
    }

    const requestedAt = new Date().toISOString();
    const payload = {
      exportado_em: requestedAt,
      observacao: "Exportação dos dados pessoais disponíveis nas tabelas consultadas. Registros de outras tabelas ou vínculos não configurados podem não estar incluídos.",
      perfil: profile.data,
      prontuario_social: socialRecords.data ?? [],
      frequencia: attendanceRecords.data ?? [],
      beneficios_recebidos: benefits.data ?? [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    const { data: auditRecord, error: auditError } = await supabase
      .from("user_activity_logs")
      .insert({
        user_id: currentUser.id,
        action: "LGPD_DATA_EXPORT",
        details: { type: "export", status: "completed", requested_at: requestedAt, completed_at: new Date().toISOString() },
      })
      .select("id,action,details,created_at")
      .single();

    if (auditRecord && !auditError) {
      setAuditLogs((previous) => [auditRecord as AuditLog, ...previous]);
      setDataRequests((previous) => [{
        id: auditRecord.id,
        type: "export",
        status: "completed",
        requested_at: requestedAt,
        completed_at: new Date().toISOString(),
      }, ...previous]);
      toast.success("Arquivo JSON com os dados consultados foi baixado.");
    } else {
      console.error("Exportação concluída, mas a auditoria falhou:", auditError);
      toast.warning("Arquivo baixado, mas não foi possível registrar a exportação no histórico do servidor.");
    }
  };

  const handleRequestDeletion = async () => {
    if (!currentUser?.id) {
      toast.error("Sua sessão não foi identificada. Entre novamente.");
      return;
    }
    const requestedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("user_activity_logs")
      .insert({
        user_id: currentUser.id,
        action: "LGPD_DATA_DELETION_REQUEST",
        details: { type: "deletion", status: "pending", requested_at: requestedAt },
      })
      .select("id,action,details,created_at")
      .single();

    if (error || !data) {
      console.error("Erro ao registrar solicitação de exclusão:", error);
      toast.error("A solicitação não foi registrada. Entre em contato com a coordenação.");
      return;
    }

    setAuditLogs((previous) => [data as AuditLog, ...previous]);
    setDataRequests((previous) => [{
      id: data.id,
      type: "deletion",
      status: "pending",
      requested_at: requestedAt,
    }, ...previous]);
    toast.info("Solicitação registrada no log do servidor. A coordenação ainda precisa consultá-la; nenhum aviso automático foi enviado e os dados não foram apagados.");
  };

  const handleDownloadPrivacyDraft = () => {
    const draft = "RASCUNHO — POLÍTICA DE PRIVACIDADE\n\nEste texto é provisório e precisa ser revisado pela organização antes de ser publicado como política oficial.\n\nA organização deve informar a identidade do controlador, finalidades, bases legais, compartilhamentos, prazos de retenção, direitos dos titulares e canal de contato.\n";
    const url = URL.createObjectURL(new Blob([draft], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "rascunho-politica-de-privacidade.txt";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const sidebarItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Usuários", href: "/admin/users", icon: "👥" },
    { label: "Presença", href: "/admin/attendance", icon: "✓" },
    { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
  ];

  const tabs = [
    { label: "Segurança", value: "security", icon: <Lock className="w-4 h-4" /> },
    { label: "LGPD e Privacidade", value: "lgpd", icon: <Shield className="w-4 h-4" /> },
    { label: "Auditoria", value: "audit", icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <ModernLayout>
      <ModernSidebar items={sidebarItems} />
      <div className="lg:ml-64">
        <ModernTopBar
          title="Segurança e LGPD"
          user={currentUser ? { name: currentUser.full_name, email: currentUser.email } : undefined}
        />

        <div className="p-6">
          <ModernPageHeader
            title="Segurança e Privacidade"
            description="Gerencie suas configurações de segurança e dados pessoais"
            icon={<Shield />}
          />

          <ModernTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Aba: Segurança */}
          {activeTab === "security" && (
            <div className="space-y-6 mt-6">
              {/* Alterar Senha */}
              <ModernCard className="p-6">
                <h3 className="font-semibold text-foreground mb-6">Alterar Senha</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new_password">Nova Senha</Label>
                    <div className="relative mt-2">
                      <Input
                        id="new_password"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Digite sua nova senha"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm_password">Confirmar Senha</Label>
                    <Input
                      id="confirm_password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua nova senha"
                      className="mt-2"
                    />
                  </div>

                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm text-warning">
                      ⚠️ A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números.
                    </p>
                  </div>

                  <Button onClick={handleChangePassword} disabled={changingPassword} className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    {changingPassword ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </div>
              </ModernCard>

              {/* Sessão atual */}
              <ModernCard className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Sessão atual</h3>
                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <div>
                    <p className="font-medium text-foreground">Autenticação ativa</p>
                    <p className="text-sm text-muted-foreground">
                      {currentUser?.email || "Conta autenticada"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      A aplicação não possui permissão para listar todos os dispositivos ou sessões da conta.
                    </p>
                  </div>
                </div>
              </ModernCard>
            </div>
          )}

          {/* Aba: LGPD e Privacidade */}
          {activeTab === "lgpd" && (
            <div className="space-y-6 mt-6">
              {/* Informações sobre LGPD */}
              <ModernCard className="p-6 bg-primary/5 border border-primary/20">
                <h3 className="font-semibold text-foreground mb-3">Lei Geral de Proteção de Dados</h3>
                <p className="text-sm text-foreground/80">
                  Seus dados pessoais são protegidos pela Lei Geral de Proteção de Dados (LGPD). Você tem direito a
                  acessar, corrigir, deletar e exportar seus dados a qualquer momento.
                </p>
              </ModernCard>

              {/* Solicitações de Dados */}
              <ModernCard className="p-6">
                <h3 className="font-semibold text-foreground mb-6">Solicitações de Dados</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Button
                    onClick={() => void handleExportData()}
                    disabled={exporting}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center"
                  >
                    <Download className="w-6 h-6 mb-2" />
                    <span>{exporting ? "Preparando exportação..." : "Exportar Meus Dados"}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Baixe os dados pessoais disponíveis nas tabelas consultadas
                    </span>
                  </Button>

                  <Button
                    onClick={() => void handleRequestDeletion()}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center"
                  >
                    <Trash2 className="w-6 h-6 mb-2" />
                    <span>Solicitar Exclusão</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Solicite a exclusão de seus dados
                    </span>
                  </Button>
                </div>

                {/* Histórico de Solicitações */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Histórico de Solicitações</h4>
                  <div className="space-y-2">
                    {dataRequests.map((req) => (
                      <div key={req.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">
                              {req.type === "export"
                                ? "Exportação de Dados"
                                : "Solicitação de Exclusão"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Solicitado em:{" "}
                              {new Date(req.requested_at).toLocaleString("pt-BR")}
                            </p>
                            {req.completed_at && (
                              <p className="text-sm text-muted-foreground">
                                Concluído em:{" "}
                                {new Date(req.completed_at).toLocaleString("pt-BR")}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                req.status === "completed"
                                  ? "bg-success/10 text-success"
                                  : req.status === "processing"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {req.status === "completed"
                                ? "Concluído"
                                : req.status === "processing"
                                  ? "Processando"
                                  : "Pendente"}
                            </span>

                            {req.status === "completed" && req.type === "export" && (
                              <span className="text-xs text-muted-foreground">Arquivo já baixado</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ModernCard>

              {/* Rascunho da política */}
              <ModernCard className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Política de Privacidade</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ainda não há uma política oficial aprovada pela organização. Não apresentaremos um texto genérico como política completa.
                </p>
                <Button variant="outline" className="w-full" onClick={handleDownloadPrivacyDraft}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar rascunho para revisão
                </Button>
              </ModernCard>
            </div>
          )}

          {/* Aba: Auditoria */}
          {activeTab === "audit" && (
            <div className="space-y-6 mt-6">
              <ModernSection title="Log de Atividades">
                {loadingAuditLogs ? (
                  <p className="text-sm text-muted-foreground">Carregando registros de auditoria...</p>
                ) : auditLogs.length === 0 ? (
                  <ModernEmptyState
                    icon={<AlertCircle />}
                    title="Nenhum registro de auditoria disponível"
                    description="Os registros reais aparecerão aqui quando estiverem acessíveis no banco. Endereços IP e atividades não são inventados."
                  />
                ) : (
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <ModernCard key={log.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {log.action === "PASSWORD_CHANGED" ? "Senha alterada" :
                               log.action === "LGPD_DATA_EXPORT" ? "Exportação de dados" :
                               log.action === "LGPD_DATA_DELETION_REQUEST" ? "Solicitação de exclusão" :
                               log.action.replace(/_/g, " ").toLowerCase()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {log.details?.status === "pending" ? "Status: pendente de análise" : "Evento registrado no servidor"}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </ModernCard>
                    ))}
                  </div>
                )}
              </ModernSection>
            </div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
}
