import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface BenefitItem {
  id: string;
  name: string;
  unit: string;
  low: boolean;
}

async function callBenefits(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("secure-benefits", { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

export function BenefitsGlassPage() {
  const { user: currentUser } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState("stock");
  const [benefitItems, setBenefitItems] = useState<BenefitItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: 0, minStock: 0, unit: "un" });

  const load = useCallback(async () => {
    setLoadingItems(true);
    try {
      const data = await callBenefits({ action: "list" });
      setBenefitItems(data?.items ?? []);
      setLoadError(false);
    } catch (e) {
      console.error("Erro ao carregar estoque:", e);
      setLoadError(true);
      toast.error((e as Error).message || "Não foi possível carregar o estoque.");
    } finally {
      setLoadingItems(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

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

  const lowStockItems = benefitItems.filter((item) => item.low);
  const totalValue = "Protegido";

  const run = async (body: Record<string, unknown>, msg: string): Promise<boolean> => {
    try {
      await callBenefits(body);
      toast.success(msg);
      await load();
      return true;
    } catch (e) {
      console.error("Operação de estoque falhou:", e);
      toast.error((e as Error).message || "A operação não foi concluída.");
      return false;
    }
  };

  const handleDeleteItem = (id: string) => {
    if (!window.confirm("Remover este item do estoque?")) return;
    run({ action: "delete", id }, "Item removido");
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      toast.error("Informe o nome do item");
      return;
    }
    const saved = await run(
      {
        action: "create",
        name: newItem.name.trim(),
        unit: newItem.unit.trim() || "un",
        quantity: Number(newItem.quantity) || 0,
        minStock: Number(newItem.minStock) || 0,
      },
      "Item adicionado (números criptografados)"
    );
    if (saved) {
      setNewItem({ name: "", quantity: 0, minStock: 0, unit: "un" });
      setNewItemOpen(false);
    }
  };

  const adjustQuantity = (id: string, delta: number) => {
    run({ action: "adjust", id, delta }, delta > 0 ? "Entrada registrada" : "Saída registrada");
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
            label="Quantidades protegidas"
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
            label="Distribuições"
            value="—"
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
              {loadingItems ? (
                <GlassCard className="p-8 text-center text-muted-foreground">Carregando estoque...</GlassCard>
              ) : loadError ? (
                <GlassCard className="p-8 text-center text-muted-foreground">Estoque indisponível. Verifique a conexão e as permissões do backend.</GlassCard>
              ) : benefitItems.length === 0 ? (
                <GlassCard className="p-8 text-center text-muted-foreground">Nenhum item cadastrado.</GlassCard>
              ) : benefitItems.map((item) => {
                const isLowStock = item.low;

                return (
                  <GlassCard key={item.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {item.name}
                        </h3>

                        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                          <span>Quantidade: •••• {item.unit} (criptografado)</span>
                          <span>Mínimo: •••• {item.unit}</span>
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

        {/* Distribuições e histórico dependem de operações que ainda não existem no backend seguro. */}
        {activeTab === "distributions" && (
          <GlassSection title="Distribuições">
            <GlassCard className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <div>
                  <p className="font-semibold text-foreground">Distribuição ainda não conectada</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    O backend seguro atual permite consultar e ajustar estoque, mas não registra distribuições. Os controles de criação e exclusão foram desativados para evitar movimentações apenas na tela.
                  </p>
                </div>
              </div>
            </GlassCard>
          </GlassSection>
        )}

        {activeTab === "history" && (
          <GlassSection title="Histórico de movimentações">
            <GlassCard className="p-6 text-sm text-muted-foreground">
              O histórico ainda não está conectado a uma tabela de movimentações. Nenhum registro fictício será exibido.
            </GlassCard>
          </GlassSection>
        )}
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
