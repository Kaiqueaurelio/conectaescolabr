import { useState } from "react";
import { ModernLayout, ModernCard, ModernSection, ModernGrid, StatCard } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader, ModernTabs } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Download, FileText, BarChart3, Users, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: "frequency" | "social" | "benefits" | "financial" | "custom";
  icon: React.ReactNode;
}

export function ReportsGenerationPage() {
  const { user: currentUser } = useSupabaseAuth();

  const [activeTab, setActiveTab] = useState("templates");
  const [reportType, setReportType] = useState("frequency");
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [format, setFormat] = useState("pdf");

  const reportTemplates: ReportTemplate[] = [
    {
      id: "1",
      name: "Relatório de Frequência",
      description: "Análise completa de presença e frequência dos alunos",
      type: "frequency",
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      id: "2",
      name: "Relatório Social",
      description: "Dados sobre situação social e benefícios dos usuários",
      type: "social",
      icon: <Users className="w-6 h-6" />,
    },
    {
      id: "3",
      name: "Relatório de Benefícios",
      description: "Distribuição e estoque de benefícios",
      type: "benefits",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      id: "4",
      name: "Relatório Financeiro",
      description: "Análise de custos e despesas",
      type: "financial",
      icon: <BarChart3 className="w-6 h-6" />,
    },
  ];

  const handleGenerateReport = (type: string) => {
    if (!startDate || !endDate) {
      toast.error("Selecione o período do relatório");
      return;
    }

    toast.loading("Gerando relatório...");

    // Simular geração de relatório
    setTimeout(() => {
      const filename = `relatorio-${type}-${new Date().toISOString().split("T")[0]}.${format === "pdf" ? "pdf" : "xlsx"}`;
      
      // Criar um blob simulado
      const content = `Relatório de ${type}\nPeríodo: ${startDate} a ${endDate}\nGerado em: ${new Date().toLocaleString("pt-BR")}`;
      const blob = new Blob([content], { type: format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      
      // Criar link de download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success(`Relatório gerado e baixado: ${filename}`);
    }, 2000);
  };

  const sidebarItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Usuários", href: "/admin/users", icon: "👥" },
    { label: "Presença", href: "/admin/attendance", icon: "✓" },
    { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
  ];

  const tabs = [
    { label: "Modelos de Relatório", value: "templates", icon: <FileText className="w-4 h-4" /> },
    { label: "Relatórios Personalizados", value: "custom", icon: <BarChart3 className="w-4 h-4" /> },
    { label: "Histórico", value: "history", icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <ModernLayout>
      <ModernSidebar items={sidebarItems} />
      <div className="lg:ml-64">
        <ModernTopBar
          title="Geração de Relatórios"
          user={currentUser ? { name: currentUser.full_name, email: currentUser.email } : undefined}
        />

        <div className="p-6">
          <ModernPageHeader
            title="Relatórios"
            description="Gere relatórios automáticos em PDF ou Excel"
            icon={<BarChart3 />}
          />

          <ModernTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Aba: Modelos de Relatório */}
          {activeTab === "templates" && (
            <div className="space-y-6 mt-6">
              {/* Filtros */}
              <ModernCard className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Configurações de Relatório</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="start_date">Data Inicial</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">Data Final</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="format">Formato</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger id="format" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Aplicar Filtros
                    </Button>
                  </div>
                </div>
              </ModernCard>

              {/* Templates */}
              <ModernSection title="Modelos Disponíveis">
                <ModernGrid cols={2}>
                  {reportTemplates.map((template) => (
                    <ModernCard key={template.id} className="p-6 hover-lift cursor-pointer">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleGenerateReport(template.type)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Gerar Relatório
                      </Button>
                    </ModernCard>
                  ))}
                </ModernGrid>
              </ModernSection>
            </div>
          )}

          {/* Aba: Relatórios Personalizados */}
          {activeTab === "custom" && (
            <div className="space-y-6 mt-6">
              <ModernCard className="p-6">
                <h3 className="font-semibold text-foreground mb-6">Criar Relatório Personalizado</h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="custom_name">Nome do Relatório</Label>
                    <Input
                      id="custom_name"
                      placeholder="Ex: Relatório de Frequência - Maio 2026"
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="custom_start">Data Inicial</Label>
                      <Input
                        id="custom_start"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="custom_end">Data Final</Label>
                      <Input
                        id="custom_end"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="custom_fields">Campos a Incluir</Label>
                    <div className="mt-3 space-y-2">
                      {[
                        "Frequência",
                        "Dados Sociais",
                        "Benefícios",
                        "Participação",
                        "Observações",
                      ].map((field) => (
                        <label key={field} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">{field}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button variant="outline">Cancelar</Button>
                    <Button onClick={() => handleGenerateReport("custom")}>
                      <Download className="w-4 h-4 mr-2" />
                      Gerar Relatório Personalizado
                    </Button>
                  </div>
                </div>
              </ModernCard>
            </div>
          )}

          {/* Aba: Histórico */}
          {activeTab === "history" && (
            <div className="space-y-6 mt-6">
              <ModernSection title="Relatórios Gerados Recentemente">
                <div className="space-y-3">
                  {[
                    {
                      name: "Relatório de Frequência - Maio 2026",
                      date: new Date().toISOString(),
                      format: "PDF",
                    },
                    {
                      name: "Relatório Social - Maio 2026",
                      date: new Date(Date.now() - 86400000).toISOString(),
                      format: "Excel",
                    },
                    {
                      name: "Relatório de Benefícios - Abril 2026",
                      date: new Date(Date.now() - 7 * 86400000).toISOString(),
                      format: "PDF",
                    },
                  ].map((report, index) => (
                    <ModernCard key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">{report.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(report.date).toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {report.format}
                          </span>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
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
