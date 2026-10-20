import { useState, useEffect } from "react";
import { ModernLayout, ModernCard, ModernSection, ModernEmptyState, StatCard } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader, ModernTabs } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { Users, Calendar, Bell, FileText, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StudentInfo {
  id: string;
  name: string;
  frequency: number;
  status: "active" | "inactive";
  lastUpdate: string;
}

export function ParentPortalPage() {
  const { user: currentUser } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [announcements, setAnnouncements] = useState<Array<{ id: string; title: string; content: string; date: string }>>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [announcementError, setAnnouncementError] = useState(false);

  // O esquema atual não expõe uma tabela de vínculo responsável-aluno validada.
  // Não inferimos parentesco nem exibimos nomes ou frequências de terceiros.
  const myChildren: StudentInfo[] = [];
  const attendanceData = myChildren.map((child) => ({
    ...child,
    presentDays: 0,
    totalDays: 0,
  }));

  useEffect(() => {
    let active = true;
    const loadAnnouncements = async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id,title,content,target_roles,created_at")
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        console.error("Erro ao carregar comunicados para responsáveis:", error);
        setAnnouncementError(true);
        setAnnouncements([]);
      } else {
        setAnnouncements((data ?? [])
          .filter((item) => Array.isArray(item.target_roles) &&
            (item.target_roles.includes("ALL") || item.target_roles.includes("PARENTS")))
          .map((item) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            date: item.created_at,
          })));
      }
      setLoadingAnnouncements(false);
    };
    void loadAnnouncements().catch((error) => {
      console.error("Erro inesperado ao carregar comunicados:", error);
      if (active) {
        setAnnouncementError(true);
        setLoadingAnnouncements(false);
      }
    });
    return () => { active = false; };
  }, []);

  const sidebarItems = [
    { label: "Visão Geral", href: "/parent", icon: "👁️" },
    { label: "Meus Filhos", href: "/parent/children", icon: "👨‍👩‍👧‍👦" },
    { label: "Presença", href: "/parent/attendance", icon: "✓" },
    { label: "Comunicados", href: "/parent/announcements", icon: "📢" },
    { label: "Mensagens", href: "/parent/messages", icon: "💬" },
  ];

  const tabs = [
    { label: "Visão Geral", value: "overview", icon: <Users className="w-4 h-4" /> },
    { label: "Meus Filhos", value: "children", icon: <Users className="w-4 h-4" /> },
    { label: "Presença", value: "attendance", icon: <CheckCircle className="w-4 h-4" /> },
    { label: "Comunicados", value: "announcements", icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <ModernLayout>
      <ModernSidebar items={sidebarItems} />
      <div className="lg:ml-64">
        <ModernTopBar
          title="Área do Responsável"
          user={currentUser ? { name: currentUser.full_name, email: currentUser.email } : undefined}
        />

        <div className="p-6">
          <ModernPageHeader
            title="Bem-vindo à Área do Responsável"
            description="Acompanhe o desenvolvimento e a frequência de seus filhos"
            icon={<Users />}
          />

          <ModernTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Aba: Visão Geral */}
          {activeTab === "overview" && (
            <div className="space-y-6 mt-6">
              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  label="Filhos Cadastrados"
                  value={myChildren.length}
                  color="primary"
                />
                <StatCard
                  label="Frequência Média"
                  value={myChildren.length > 0 ? Math.round(myChildren.reduce((sum, child) => sum + child.frequency, 0) / myChildren.length) : "—"}
                  trend="up"
                  trendValue="+5%"
                  color="success"
                />
                <StatCard
                  label="Comunicados Recentes"
                  value={announcements.length}
                  color="secondary"
                />
              </div>

              {/* Resumo dos Filhos */}
              <ModernSection title="Resumo dos Meus Filhos">
                {myChildren.length === 0 ? (
                  <ModernEmptyState
                    icon={<Users />}
                    title="Vínculo de alunos não configurado"
                    description="Nenhum dado de criança será exibido até que o vínculo entre responsável e aluno seja validado no banco de dados."
                  />
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myChildren.map((child) => (
                    <ModernCard key={child.id} className="p-6 hover-lift">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground">{child.name}</h3>
                          <p className="text-sm text-muted-foreground">Aluno Ativo</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-success" />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Frequência</p>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-success"
                              style={{ width: `${child.frequency}%` }}
                            />
                          </div>
                          <p className="text-xs text-foreground mt-1 font-medium">
                            {child.frequency}%
                          </p>
                        </div>

                        <Button variant="outline" className="w-full" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    </ModernCard>
                  ))}
                </div>
                )}
              </ModernSection>

              {/* Comunicados Recentes */}
              <ModernSection title="Comunicados Recentes">
                {loadingAnnouncements ? (
                  <p className="text-sm text-muted-foreground">Carregando comunicados...</p>
                ) : announcementError ? (
                  <ModernEmptyState icon={<AlertCircle />} title="Comunicados indisponíveis" description="Não foi possível consultar os comunicados no banco." />
                ) : announcements.length === 0 ? (
                  <ModernEmptyState icon={<Bell />} title="Nenhum comunicado para responsáveis" description="Não há comunicados publicados para este público." />
                ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <ModernCard key={ann.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Bell className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{ann.title}</h4>
                          <p className="text-sm text-foreground/80 mt-1">{ann.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(ann.date), "dd 'de' MMMM 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                    </ModernCard>
                  ))}
                </div>
                )}
              </ModernSection>
            </div>
          )}

          {/* Aba: Meus Filhos */}
          {activeTab === "children" && (
            <div className="space-y-6 mt-6">
              <ModernSection title="Meus Filhos">
                {myChildren.length === 0 ? (
                  <ModernEmptyState
                    icon={<Users />}
                    title="Nenhum filho cadastrado"
                    description="Entre em contato com a coordenação para cadastrar seus filhos"
                  />
                ) : (
                  <div className="space-y-4">
                    {myChildren.map((child) => (
                      <ModernCard key={child.id} className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">{child.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Status: <strong>Ativo</strong>
                            </p>
                          </div>
                          <CheckCircle className="w-6 h-6 text-success" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="p-3 bg-primary/5 rounded-lg">
                            <p className="text-xs text-muted-foreground">Frequência</p>
                            <p className="text-lg font-bold text-primary">{child.frequency}%</p>
                          </div>
                          <div className="p-3 bg-secondary/5 rounded-lg">
                            <p className="text-xs text-muted-foreground">Presença</p>
                            <p className="text-lg font-bold text-secondary">
                              {Math.floor((child.frequency / 100) * 20)}/20
                            </p>
                          </div>
                          <div className="p-3 bg-warning/5 rounded-lg">
                            <p className="text-xs text-muted-foreground">Faltas</p>
                            <p className="text-lg font-bold text-warning">
                              {20 - Math.floor((child.frequency / 100) * 20)}
                            </p>
                          </div>
                          <div className="p-3 bg-success/5 rounded-lg">
                            <p className="text-xs text-muted-foreground">Última Atualização</p>
                            <p className="text-xs font-bold text-success">
                              {format(new Date(child.lastUpdate), "dd/MM", { locale: ptBR })}
                            </p>
                          </div>
                        </div>

                        <Button className="w-full">
                          <FileText className="w-4 h-4 mr-2" />
                          Ver Prontuário Completo
                        </Button>
                      </ModernCard>
                    ))}
                  </div>
                )}
              </ModernSection>
            </div>
          )}

          {/* Aba: Presença */}
          {activeTab === "attendance" && (
            <div className="space-y-6 mt-6">
              <ModernSection title="Presença dos Meus Filhos">
                <div className="space-y-4">
                  {attendanceData.map((child) => (
                    <ModernCard key={child.id} className="p-6">
                      <h3 className="font-semibold text-foreground mb-4">{child.name}</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Frequência</span>
                            <span className="text-sm font-bold">{child.frequency}%</span>
                          </div>
                          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-success"
                              style={{ width: `${child.frequency}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-success" />
                            <span>{child.presentDays} presentes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-warning" />
                            <span>{child.totalDays - child.presentDays} faltas</span>
                          </div>
                        </div>
                      </div>
                    </ModernCard>
                  ))}
                </div>
              </ModernSection>
            </div>
          )}

          {/* Aba: Comunicados */}
          {activeTab === "announcements" && (
            <div className="space-y-6 mt-6">
              <ModernSection title="Todos os Comunicados">
                {loadingAnnouncements ? (
                  <p className="text-sm text-muted-foreground">Carregando comunicados...</p>
                ) : announcementError ? (
                  <ModernEmptyState icon={<AlertCircle />} title="Comunicados indisponíveis" description="Não foi possível consultar os comunicados no banco." />
                ) : announcements.length === 0 ? (
                  <ModernEmptyState icon={<Bell />} title="Nenhum comunicado" description="Não há comunicados publicados para responsáveis." />
                ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <ModernCard key={ann.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Bell className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{ann.title}</h3>
                          <p className="text-sm text-foreground/80 mt-2">{ann.content}</p>
                          <p className="text-xs text-muted-foreground mt-3">
                            {format(new Date(ann.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
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
