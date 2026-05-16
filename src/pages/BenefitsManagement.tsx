import { useState, useMemo } from "react";
import { ModernLayout, ModernCard, ModernGrid, ModernSection, ModernEmptyState, StatCard, ModernBadge } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader, ModernTabs } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useUsers } from "@/hooks/useSupabaseData";
import { Plus, Package, TrendingDown, AlertTriangle, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  last_restock: string;
}

interface Distribution {
  id: string;
  item_name: string;
  user_name: string;
  quantity: number;
  distribution_date: string;
  notes?: string;
}

export function BenefitsManagementPage() {
  const { user: currentUser } = useSupabaseAuth();
  const { users } = useUsers();

  const [activeTab, setActiveTab] = useState("inventory");
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: "1", item_name: "Leite", quantity: 150, unit: "litros", last_restock: "2026-05-10" },
    { id: "2", item_name: "Cesta Básica", quantity: 45, unit: "unidades", last_restock: "2026-05-08" },
    { id: "3", item_name: "Pão", quantity: 200, unit: "unidades", last_restock: "2026-05-14" },
    { id: "4", item_name: "Frutas e Verduras", quantity: 80, unit: "kg", last_restock: "2026-05-12" },
  ]);

  const [distributions, setDistributions] = useState<Distribution[]>([
    {
      id: "1",
      item_name: "Leite",
      user_name: "João Silva",
      quantity: 10,
      distribution_date: "2026-05-14",
      notes: "Entrega regular",
    },
    {
      id: "2",
      item_name: "Cesta Básica",
      user_name: "Maria Santos",
      quantity: 1,
      distribution_date: "2026-05-14",
      notes: "Situação de vulnerabilidade",
    },
  ]);

  const [newItem, setNewItem] = useState({ item_name: "", quantity: 0, unit: "unidades" });
  const [newDistribution, setNewDistribution] = useState({
    item_id: "",
    user_id: "",
    quantity: 0,
    notes: "",
  });

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalDistributions = distributions.length;
    const lowStockItems = inventory.filter((item) => item.quantity < 50).length;

    return {
      totalItems,
      totalDistributions,
      lowStockItems,
      itemTypes: inventory.length,
    };
  }, [inventory, distributions]);

  const handleAddItem = () => {
    if (!newItem.item_name.trim()) {
      toast.error("Nome do item é obrigatório");
      return;
    }

    const item: InventoryItem = {
      id: `item-${Date.now()}`,
      item_name: newItem.item_name,
      quantity: newItem.quantity,
      unit: newItem.unit,
      last_restock: new Date().toISOString().split("T")[0],
    };

    setInventory([...inventory, item]);
    setNewItem({ item_name: "", quantity: 0, unit: "unidades" });
    toast.success("Item adicionado ao estoque!");
  };

  const handleAddDistribution = () => {
    if (!newDistribution.item_id || !newDistribution.user_id || newDistribution.quantity <= 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const item = inventory.find((i) => i.id === newDistribution.item_id);
    const user = users.find((u) => u.id === newDistribution.user_id);

    if (!item || !user) {
      toast.error("Item ou usuário não encontrado");
      return;
    }

    if (item.quantity < newDistribution.quantity) {
      toast.error("Quantidade insuficiente em estoque");
      return;
    }

    // Atualizar estoque
    setInventory(
      inventory.map((i) =>
        i.id === newDistribution.item_id
          ? { ...i, quantity: i.quantity - newDistribution.quantity }
          : i
      )
    );

    // Adicionar distribuição
    const distribution: Distribution = {
      id: `dist-${Date.now()}`,
      item_name: item.item_name,
      user_name: user.full_name,
      quantity: newDistribution.quantity,
      distribution_date: new Date().toISOString().split("T")[0],
      notes: newDistribution.notes,
    };

    setDistributions([...distributions, distribution]);
    setNewDistribution({ item_id: "", user_id: "", quantity: 0, notes: "" });
    toast.success("Distribuição registrada com sucesso!");
  };

  const handleDeleteItem = (id: string) => {
    setInventory(inventory.filter((item) => item.id !== id));
    toast.success("Item removido do estoque");
  };

  const handleRestockItem = (id: string) => {
    const item = inventory.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = item.quantity + 100;
    setInventory(
      inventory.map((i) =>
        i.id === id
          ? { ...i, quantity: newQuantity, last_restock: new Date().toISOString().split("T")[0] }
          : i
      )
    );
    toast.success(`Estoque de ${item.item_name} reabastecido!`);
  };

  const sidebarItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Usuários", href: "/admin/users", icon: "👥" },
    { label: "Presença", href: "/admin/attendance", icon: "✓" },
    { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
  ];

  const tabs = [
    { label: "Estoque", value: "inventory", icon: <Package className="w-4 h-4" /> },
    { label: "Distribuições", value: "distributions", icon: <TrendingDown className="w-4 h-4" /> },
    { label: "Relatórios", value: "reports", icon: <Download className="w-4 h-4" /> },
  ];

  return (
    <ModernLayout>
      <ModernSidebar items={sidebarItems} />
      <div className="lg:ml-64">
        <ModernTopBar
          title="Controle de Benefícios"
          user={currentUser ? { name: currentUser.full_name, email: currentUser.email } : undefined}
        />

        <div className="p-6">
          <ModernPageHeader
            title="Benefícios e Estoque"
            description="Gerencie o estoque de benefícios e distribuições"
            icon={<Package />}
          />

          <ModernTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Aba: Estoque */}
          {activeTab === "inventory" && (
            <div className="space-y-6 mt-6">
              {/* Estatísticas */}
              <ModernGrid cols={4}>
                <StatCard label="Total em Estoque" value={stats.totalItems} color="primary" />
                <StatCard label="Tipos de Itens" value={stats.itemTypes} color="secondary" />
                <StatCard
                  label="Itens com Baixo Estoque"
                  value={stats.lowStockItems}
                  trend="down"
                  trendValue="Ação necessária"
                  color="warning"
                />
                <StatCard label="Distribuições" value={stats.totalDistributions} color="success" />
              </ModernGrid>

              {/* Adicionar Item */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mb-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Item ao Estoque</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="item_name">Nome do Item *</Label>
                      <Input
                        id="item_name"
                        value={newItem.item_name}
                        onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                        placeholder="Ex: Leite, Cesta Básica"
                        className="mt-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quantity">Quantidade *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={newItem.quantity}
                          onChange={(e) =>
                            setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })
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
                          placeholder="Ex: unidades, kg, litros"
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button variant="outline">Cancelar</Button>
                      <Button onClick={handleAddItem}>Adicionar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Lista de Itens */}
              <ModernSection title="Itens em Estoque">
                {inventory.length === 0 ? (
                  <ModernEmptyState
                    icon={<Package />}
                    title="Nenhum item em estoque"
                    description="Comece adicionando itens ao estoque"
                  />
                ) : (
                  <div className="space-y-3">
                    {inventory.map((item) => {
                      const isLowStock = item.quantity < 50;
                      return (
                        <ModernCard key={item.id} className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="w-6 h-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground">{item.item_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Última reposição: {item.last_restock}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className={`text-2xl font-bold ${isLowStock ? "text-warning" : "text-primary"}`}>
                                  {item.quantity}
                                </p>
                                <p className="text-xs text-muted-foreground">{item.unit}</p>
                              </div>

                              {isLowStock && (
                                <ModernBadge variant="warning">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Baixo
                                </ModernBadge>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRestockItem(item.id)}
                                >
                                  Reabastecer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </ModernCard>
                      );
                    })}
                  </div>
                )}
              </ModernSection>
            </div>
          )}

          {/* Aba: Distribuições */}
          {activeTab === "distributions" && (
            <div className="space-y-6 mt-6">
              {/* Adicionar Distribuição */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mb-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Distribuição
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Distribuição de Benefício</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="item_select">Item *</Label>
                      <select
                        id="item_select"
                        value={newDistribution.item_id}
                        onChange={(e) =>
                          setNewDistribution({ ...newDistribution, item_id: e.target.value })
                        }
                        className="w-full mt-2 px-3 py-2 border border-border rounded-md"
                      >
                        <option value="">Selecione um item</option>
                        {inventory.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.item_name} ({item.quantity} {item.unit} disponíveis)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="user_select">Usuário *</Label>
                      <select
                        id="user_select"
                        value={newDistribution.user_id}
                        onChange={(e) =>
                          setNewDistribution({ ...newDistribution, user_id: e.target.value })
                        }
                        className="w-full mt-2 px-3 py-2 border border-border rounded-md"
                      >
                        <option value="">Selecione um usuário</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.full_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="dist_quantity">Quantidade *</Label>
                      <Input
                        id="dist_quantity"
                        type="number"
                        value={newDistribution.quantity}
                        onChange={(e) =>
                          setNewDistribution({
                            ...newDistribution,
                            quantity: parseInt(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Observações</Label>
                      <Input
                        id="notes"
                        value={newDistribution.notes}
                        onChange={(e) =>
                          setNewDistribution({ ...newDistribution, notes: e.target.value })
                        }
                        placeholder="Ex: Situação especial, motivo da distribuição"
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button variant="outline">Cancelar</Button>
                      <Button onClick={handleAddDistribution}>Registrar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Lista de Distribuições */}
              <ModernSection title="Histórico de Distribuições">
                {distributions.length === 0 ? (
                  <ModernEmptyState
                    icon={<TrendingDown />}
                    title="Nenhuma distribuição registrada"
                    description="Comece registrando distribuições de benefícios"
                  />
                ) : (
                  <div className="space-y-3">
                    {distributions.map((dist) => (
                      <ModernCard key={dist.id} className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{dist.item_name}</h3>
                            <p className="text-sm text-muted-foreground">Para: {dist.user_name}</p>
                            {dist.notes && (
                              <p className="text-xs text-muted-foreground mt-1">Obs: {dist.notes}</p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">{dist.quantity}</p>
                            <p className="text-xs text-muted-foreground">{dist.distribution_date}</p>
                          </div>
                        </div>
                      </ModernCard>
                    ))}
                  </div>
                )}
              </ModernSection>
            </div>
          )}

          {/* Aba: Relatórios */}
          {activeTab === "reports" && (
            <div className="space-y-6 mt-6">
              <ModernCard className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Relatório de Benefícios</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{stats.totalItems}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total em Estoque</p>
                    </div>
                    <div className="p-4 bg-secondary/5 rounded-lg">
                      <p className="text-2xl font-bold text-secondary">{stats.itemTypes}</p>
                      <p className="text-xs text-muted-foreground mt-1">Tipos de Itens</p>
                    </div>
                    <div className="p-4 bg-warning/5 rounded-lg">
                      <p className="text-2xl font-bold text-warning">{stats.lowStockItems}</p>
                      <p className="text-xs text-muted-foreground mt-1">Baixo Estoque</p>
                    </div>
                    <div className="p-4 bg-success/5 rounded-lg">
                      <p className="text-2xl font-bold text-success">{stats.totalDistributions}</p>
                      <p className="text-xs text-muted-foreground mt-1">Distribuições</p>
                    </div>
                  </div>

                  <Button className="w-full mt-4">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Relatório (PDF)
                  </Button>
                </div>
              </ModernCard>
            </div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
}
