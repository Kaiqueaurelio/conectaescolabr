import { useState } from "react";
import { ModernLayout, ModernCard, ModernSection } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader, ModernTabs } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Shield, Lock, Eye, EyeOff, Download, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface DataRequest {
  id: string;
  type: "export" | "deletion";
  status: "pending" | "processing" | "completed";
  requested_at: string;
  completed_at?: string;
}

export function SecurityAndLGPDPage() {
  const { user: currentUser } = useSupabaseAuth();

  const [activeTab, setActiveTab] = useState("security");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([
    {
      id: "1",
      type: "export",
      status: "completed",
      requested_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      completed_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
  ]);

  const handleChangePassword = () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    toast.success("Senha alterada com sucesso!");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleExportData = () => {
    const newRequest: DataRequest = {
      id: `req-${Date.now()}`,
      type: "export",
      status: "processing",
      requested_at: new Date().toISOString(),
    };

    setDataRequests([...dataRequests, newRequest]);
    toast.success("Solicitação de exportação criada. Você receberá um e-mail em breve.");

    // Simular conclusão
    setTimeout(() => {
      setDataRequests((prev) =>
        prev.map((r) =>
          r.id === newRequest.id
            ? {
                ...r,
                status: "completed",
                completed_at: new Date().toISOString(),
              }
            : r
        )
      );
      toast.success("Seus dados estão prontos para download!");
    }, 3000);
  };

  const handleRequestDeletion = () => {
    const newRequest: DataRequest = {
      id: `req-${Date.now()}`,
      type: "deletion",
      status: "pending",
      requested_at: new Date().toISOString(),
    };

    setDataRequests([...dataRequests, newRequest]);
    toast.success("Solicitação de exclusão de dados criada. A coordenação será notificada.");
  };

  const handleDownloadData = (id: string) => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        `Dados Pessoais Exportados\nData: ${new Date().toLocaleString("pt-BR")}\n\nNome: ${currentUser?.full_name}\nE-mail: ${currentUser?.email}`,
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `dados-pessoais-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Arquivo baixado com sucesso!");
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

                  <Button onClick={handleChangePassword} className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </Button>
                </div>
              </ModernCard>

              {/* Sessões Ativas */}
              <ModernCard className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Sessões Ativas</h3>
                <div className="space-y-3">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">Navegador Atual</p>
                        <p className="text-sm text-muted-foreground">Chrome - Windows 10</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Última atividade: agora
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
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
                    onClick={handleExportData}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center"
                  >
                    <Download className="w-6 h-6 mb-2" />
                    <span>Exportar Meus Dados</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Receba uma cópia de todos os seus dados
                    </span>
                  </Button>

                  <Button
                    onClick={handleRequestDeletion}
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
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadData(req.id)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ModernCard>

              {/* Política de Privacidade */}
              <ModernCard className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Política de Privacidade</h3>
                <Textarea
                  value="Política de Privacidade da ONG Camila\n\nNós respeitamos sua privacidade e nos comprometemos a proteger seus dados pessoais. Esta política descreve como coletamos, usamos e protegemos suas informações...\n\nPara mais informações, entre em contato com nossa coordenação."
                  readOnly
                  rows={6}
                  className="mb-4"
                />
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Política Completa
                </Button>
              </ModernCard>
            </div>
          )}

          {/* Aba: Auditoria */}
          {activeTab === "audit" && (
            <div className="space-y-6 mt-6">
              <ModernSection title="Log de Atividades">
                <div className="space-y-2">
                  {[
                    {
                      action: "Login realizado",
                      timestamp: new Date().toISOString(),
                      ip: "192.168.1.100",
                    },
                    {
                      action: "Perfil atualizado",
                      timestamp: new Date(Date.now() - 3600000).toISOString(),
                      ip: "192.168.1.100",
                    },
                    {
                      action: "Senha alterada",
                      timestamp: new Date(Date.now() - 86400000).toISOString(),
                      ip: "192.168.1.100",
                    },
                  ].map((log, index) => (
                    <ModernCard key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{log.action}</p>
                          <p className="text-xs text-muted-foreground">
                            IP: {log.ip}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </ModernCard>
                  ))}
                </div>
              </ModernSection>
            </div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
}
