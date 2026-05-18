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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: 0, minStock: 0, unit: "un" });

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

  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      toast.error("Informe o nome do item");
      return;
    }
    const item: BenefitItem = {
      id: `item-${Date.now()}`,
      name: newItem.name.trim(),
      quantity: Number(newItem.quantity) || 0,
      minStock: Number(newItem.minStock) || 0,
      unit: newItem.unit.trim() || "un",
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    setBenefitItems((items) => [item, ...items]);
    setNewItem({ name: "", quantity: 0, minStock: 0, unit: "un" });
    setNewItemOpen(false);
    toast.success("Item adicionado");
  };

  const adjustQuantity = (id: string, delta: number) => {
    setBenefitItems((items) =>
      items.map((it) =>
        it.id === id ? { ...it, quantity: Math.max(0, it.quantity + delta) } : it
      )
    );
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
          <Dialog open={newItemOpen} onOpenChange={setNewItemOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-lg">
                <Plus className="w-4 h-4" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo item de estoque</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Ex: Leite, Cesta básica..."
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="qty">Quantidade</Label>
                    <Input
                      id="qty"
                      type="number"
                      min={0}
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem({ ...newItem, quantity: Number(e.target.value) })
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="min">Mínimo</Label>
                    <Input
                      id="min"
                      type="number"
                      min={0}
                      value={newItem.minStock}
                      onChange={(e) =>
                        setNewItem({ ...newItem, minStock: Number(e.target.value) })
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unidade</Label>
                    <Input
                      id="unit"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      placeholder="un, kg, L"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewItemOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddItem}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                          onClick={() => adjustQuantity(item.id, +1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => adjustQuantity(item.id, -1)}
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
                <GlassCard key={record.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {record.item}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Saída - {record.quantity} un
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-3 py-1 rounded-full font-medium bg-destructive/10 text-destructive">
                        Saída
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
