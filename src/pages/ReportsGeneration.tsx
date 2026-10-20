import { useState } from "react";
import { ModernLayout, ModernCard, ModernSection, ModernGrid, ModernEmptyState } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader, ModernTabs } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { Download, FileText, BarChart3, Users, Calendar, TrendingUp, AlertCircle } from "lucide-react";
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
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [format, setFormat] = useState("csv");
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<Array<{ name: string; date: string; format: string }>>(() => {
    try {
      const saved = localStorage.getItem("conectaescola_report_history_v1");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
      description: "Registros de prontuário social no período selecionado",
      type: "social",
      icon: <Users className="w-6 h-6" />,
    },
    {
      id: "3",
      name: "Relatório de Benefícios",
      description: "Registros de distribuição de benefícios no período selecionado",
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

  const handleGenerateReport = async (type: string) => {
    if (!startDate || !endDate) {
      toast.error("Selecione o período do relatório");
      return;
    }
    if (startDate > endDate) {
      toast.error("A data inicial não pode ser posterior à data final.");
      return;
    }
    if (type === "financial" || type === "custom") {
      toast.error(type === "financial"
        ? "Não há uma tabela financeira confirmada no banco. Nenhum relatório foi criado."
        : "Relatórios personalizados ainda não estão conectados a uma definição de campos persistente. Escolha um dos modelos disponíveis.");
      return;
    }

    const selectedTemplate = reportTemplates.find((template) => template.type === type);
    if (!selectedTemplate) {
      toast.error("Modelo de relatório inválido.");
      return;
    }

    // Abrimos a janela de impressão durante o clique do usuário para reduzir
    // bloqueios de pop-up; o conteúdo só é preenchido após a consulta real.
    const printWindow = format === "pdf" ? window.open("", "_blank") : null;
    if (format === "pdf" && !printWindow) {
      toast.error("O navegador bloqueou a janela de impressão. Permita pop-ups e tente novamente.");
      return;
    }

    setGenerating(true);
    let rows: Record<string, unknown>[] = [];
    let queryError: { message: string } | null = null;

    try {
      if (type === "frequency") {
        const result = await supabase
          .from("attendance_records")
          .select("date,status,user_id,activity_id,recorded_by")
          .gte("date", startDate)
          .lte("date", endDate)
          .order("date", { ascending: true });
        rows = (result.data ?? []) as Record<string, unknown>[];
        queryError = result.error;
      } else if (type === "social") {
        const result = await supabase
          .from("social_records")
          .select("user_id,record_type,title,description,record_date,created_by")
          .gte("record_date", startDate)
          .lte("record_date", endDate)
          .order("record_date", { ascending: true });
        rows = (result.data ?? []) as Record<string, unknown>[];
        queryError = result.error;
      } else if (type === "benefits") {
        const result = await supabase
          .from("benefit_distributions")
          .select("distribution_date,quantity,notes,user_id,inventory_item_id,distributed_by")
          .gte("distribution_date", startDate)
          .lte("distribution_date", endDate)
          .order("distribution_date", { ascending: true });
        rows = (result.data ?? []) as Record<string, unknown>[];
        queryError = result.error;
      }
    } catch (error) {
      printWindow?.close();
      console.error("Falha inesperada ao consultar relatório:", error);
      toast.error("A consulta foi interrompida. Nenhum relatório foi gerado.");
      return;
    } finally {
      setGenerating(false);
    }

    if (queryError) {
      printWindow?.close();
      console.error("Falha ao gerar relatório:", queryError);
      toast.error("A consulta falhou. Nenhum relatório foi gerado; verifique a conexão e as permissões do banco.");
      return;
    }
    if (rows.length === 0) {
      printWindow?.close();
      toast.info("Não há registros no período selecionado. Nenhum arquivo foi gerado.");
      return;
    }

    const columns = Object.keys(rows[0]);
    const csvEscape = (value: unknown) => {
      const text = value == null ? "" : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };
    const csv = "\uFEFF" + [
      columns.map(csvEscape).join(","),
      ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
    ].join("\r\n");
    const dateSuffix = `${startDate}_a_${endDate}`;
    const safeName = selectedTemplate.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "").toLowerCase();

    if (format === "csv") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${safeName}_${dateSuffix}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } else if (printWindow) {
      const escapeHtml = (value: unknown) => String(value ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      const tableHead = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
      const tableRows = rows.map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(row[column])}</td>`).join("")}</tr>`).join("");
      printWindow.document.open();
      printWindow.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${escapeHtml(selectedTemplate.name)}</title><style>body{font:12px Arial,sans-serif;margin:24px;color:#111}h1{font-size:20px}p{color:#444}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #bbb;padding:6px;text-align:left;overflow-wrap:anywhere}th{background:#eee}@media print{body{margin:12mm}}</style></head><body><h1>${escapeHtml(selectedTemplate.name)}</h1><p>Período: ${escapeHtml(startDate)} a ${escapeHtml(endDate)} · Registros: ${rows.length}</p><table><thead><tr>${tableHead}</tr></thead><tbody>${tableRows}</tbody></table></body></html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }

    const historyItem = { name: `${selectedTemplate.name} — ${startDate} a ${endDate}`, date: new Date().toISOString(), format: format === "csv" ? "CSV (Excel)" : "PDF / impressão" };
    setHistory((previous) => {
      const next = [historyItem, ...previous].slice(0, 20);
      try { localStorage.setItem("conectaescola_report_history_v1", JSON.stringify(next)); } catch {}
      return next;
    });
    toast.success("Relatório gerado a partir dos dados retornados pelo banco.");
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
            description="Modelos disponíveis para integração. A geração está desabilitada até conectar as consultas aos dados reais."
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
                        <SelectItem value="csv">CSV (abre no Excel)</SelectItem>
                        <SelectItem value="pdf">PDF (imprimir / salvar)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <p className="text-xs text-muted-foreground">O período selecionado será aplicado ao gerar o relatório.</p>
                  </div>
                </div>
              </ModernCard>

              {/* Templates */}
              <ModernSection title="Modelos Disponíveis">
                <ModernGrid cols={2}>
                  {reportTemplates.map((template) => (
                    <ModernCard key={template.id} className="p-6 hover-lift">
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
                        disabled={generating || template.type === "financial"}
                        onClick={() => void handleGenerateReport(template.type)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {generating ? "Gerando..." : template.type === "financial" ? "Indisponível sem dados financeiros" : "Gerar Relatório"}
                      </Button>
                    </ModernCard>
                  ))}
                </ModernGrid>
              </ModernSection>
            </div>
          )}

          {/* Aba: Relatórios Personalizados */}
          {activeTab === "custom" && (
            <div className="mt-6">
              <ModernCard className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <h3 className="font-semibold text-foreground">Relatórios personalizados ainda não disponíveis</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      A seleção de campos ainda não está ligada a um modelo persistente. Para evitar exportar um relatório incompleto como se estivesse correto, use por enquanto os modelos de frequência, cadastros sociais e benefícios.
                    </p>
                  </div>
                </div>
              </ModernCard>
            </div>
          )}

          {/* Aba: Histórico */}
          {activeTab === "history" && (
            <div className="space-y-6 mt-6">
              <ModernSection title="Histórico deste navegador">
                {history.length === 0 ? (
                  <ModernEmptyState
                    icon={<FileText />}
                    title="Nenhum relatório gerado neste dispositivo"
                    description="Os relatórios aparecerão aqui depois que você gerar um arquivo. Este histórico é local e não representa um registro central do servidor."
                  />
                ) : (
                  <div className="space-y-3">
                    {history.map((report, index) => (
                      <ModernCard key={`${report.date}-${index}`} className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">{report.name}</p>
                              <p className="text-xs text-muted-foreground">{new Date(report.date).toLocaleString("pt-BR")}</p>
                            </div>
                          </div>
                          <span className="text-xs bg-muted px-2 py-1 rounded">{report.format}</span>
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
