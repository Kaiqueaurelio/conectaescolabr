import { useState } from "react";
import {
  GlassLayout,
  GlassContainer,
  GlassGrid,
  GlassSection,
} from "@/components/GlassLayout";
import { GlassCard, GlassStatCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  TrendingDown,
  History,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface BenefitItem {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  unit: string;
  lastUpdated: string;
}

interface DistributionItem {
  id: string;
  user: string;
  item: string;
  quantity: number;
  date: string;
}

export function BenefitsGlassPage() {
  const { user: currentUser } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState("stock");
  const [benefitItems, setBenefitItems] = useState<BenefitItem[]>([]);
  const [distributions, setDistributions] = useState<DistributionItem[]>([]);

  const sidebarItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { label: "Usuários", href: "/admin/users", icon: "👥" },
    { label: "Presença", href: "/admin/attendance", icon: "✓" },
    { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
    { label: "Comunicações", href: "/admin/communications", icon: "💬" },
    { label: "Calendário", href: "/admin/calendar", icon: "📅" },
    { label: "Documentos", href: "/admin/scanning", icon: "📄" },
    { label: "Relatórios", href: "/admin/reports", icon: "📈" },
    { divider: true },
    { label: "Segurança", href: "/admin/security", icon: "🔒" },
  ];

  const lowStockItems = benefitItems.filter((item) => item.quantity <= item.minStock);
  const totalValue = benefitItems.reduce((sum, item) => sum + item.quantity, 0);
  const today = new Date().toISOString().split("T")[0];
  const distributionsToday = distributions.filter((dist) => dist.date === today).length;

  const handleDeleteItem = (id: string) => {
    if (!window.confirm("Remover este item do estoque?")) return;
    setBenefitItems((items) => items.filter((item) => item.id !== id));
    toast.success("Item removido");
  };

  const handleDeleteDistribution = (id: string) => {
    if (!window.confirm("Remover esta distribuição?")) return;
    setDistributions((items) => items.filter((item) => item.id !== id));
    toast.success("Distribuição removida");
  };

  const handleClearAll = () => {
    if (!window.confirm("Remover todos os itens e distribuições desta tela?")) return;
    setBenefitItems([]);
    setDistributions([]);
    toast.success("Benefícios limpos");
  };

  return (
    <GlassLayout
      sidebarItems={sidebarItems}
      topBarTitle="Benefícios"
      topBarUser={
        currentUser
          ? {
              name: currentUser.full_name || "Usuário",
              email: currentUser.email || "",
            }
          : undefined
      }
      showSearch={true}
    >
      <GlassContainer>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Package className="w-8 h-8 text-primary" />
              Gestão de Benefícios
            </h1>
            <p className="text-muted-foreground mt-2">
              Controle de estoque e distribuição de benefícios
            </p>
          </div>
          <div className="flex items-center gap-2">
          {(benefitItems.length > 0 || distributions.length > 0) && (
            <Button variant="destructive" className="gap-2 rounded-lg" onClick={handleClearAll}>
              <Trash2 className="w-4 h-4" />
              Limpar tudo
            </Button>
          )}
          <Button className="gap-2 rounded-lg">
            <Plus className="w-4 h-4" />
            Novo Item
          </Button>
          </div>
        </div>

        {/* Stats */}
        <GlassGrid cols={4} gap="medium" className="mb-8">
          <GlassStatCard
            label="Total em Estoque"
            value={totalValue}
            icon={<Package className="w-6 h-6" />}
            color="primary"
          />
          <GlassStatCard
            label="Itens Cadastrados"
            value={benefitItems.length}
            icon={<Package className="w-6 h-6" />}
            color="secondary"
          />
          <GlassStatCard
            label="Baixo Estoque"
            value={lowStockItems.length}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="warning"
            trend="down"
            trendValue={`${lowStockItems.length} itens`}
          />
          <GlassStatCard
            label="Distribuições Hoje"
            value={distributionsToday}
            icon={<TrendingDown className="w-6 h-6" />}
            color="success"
          />
        </GlassGrid>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: "stock", label: "Estoque" },
            { id: "distributions", label: "Distribuições" },
            { id: "history", label: "Histórico" },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? "default" : "outline"}
              className="rounded-lg"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Stock Tab */}
        {activeTab === "stock" && (
          <GlassSection title="Itens em Estoque">
            <div className="space-y-3">
              {benefitItems.length === 0 ? (
                <GlassCard className="p-8 text-center text-muted-foreground">
                  Nenhum item cadastrado.
                </GlassCard>
              ) : benefitItems.map((item) => {
                const isLowStock = item.quantity <= item.minStock;
                const percentage = (item.quantity / (item.minStock * 2)) * 100;

                return (
                  <GlassCard key={item.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {item.name}
                        </h3>

                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              Quantidade: {item.quantity} {item.unit}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Mínimo: {item.minStock} {item.unit}
                            </span>
                          </div>

                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isLowStock
                                  ? "bg-destructive"
                                  : "bg-gradient-primary"
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        {isLowStock && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-warning">
                            <AlertTriangle className="w-4 h-4" />
                            Estoque baixo - Reposição necessária
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-destructive"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </GlassSection>
        )}

        {/* Distributions Tab */}
        {activeTab === "distributions" && (
          <GlassSection title="Distribuições Recentes">
            <div className="space-y-3">
              {distributions.length === 0 ? (
                <GlassCard className="p-8 text-center text-muted-foreground">
                  Nenhuma distribuição cadastrada.
                </GlassCard>
              ) : distributions.map((dist) => (
                <GlassCard key={dist.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        {dist.user}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dist.item} - {dist.quantity} un
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(dist.date).toLocaleDateString("pt-BR")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-destructive"
                        onClick={() => handleDeleteDistribution(dist.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            <Button className="w-full mt-6 rounded-lg gap-2">
              <Plus className="w-4 h-4" />
              Nova Distribuição
            </Button>
          </GlassSection>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <GlassSection title="Histórico de Movimentações">
            <div className="space-y-3">
              {distributions.length === 0 ? (
                <GlassCard className="p-8 text-center text-muted-foreground">
                  Nenhuma movimentação cadastrada.
                </GlassCard>
              ) : distributions.map((record) => (
                <GlassCard key={idx} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {record.item}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {record.action} - {record.quantity} un
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          record.action === "Entrada"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {record.action}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(record.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </GlassSection>
        )}
      </GlassContainer>
    </GlassLayout>
  );
}
