import { useMemo } from "react";
import { ModernLayout, ModernCard, ModernGrid, ModernSection, StatCard } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useUsers } from "@/hooks/useSupabaseData";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, TrendingUp, Award, Zap, Calendar, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminDashboardNewPage() {
  const { user: currentUser } = useSupabaseAuth();
  const { users } = useUsers();

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const teachers = users.filter((u) => u.role === "TEACHER").length;
    const students = users.filter((u) => u.role === "STUDENT").length;
    const parents = users.filter((u) => u.role === "PARENT").length;
    const volunteers = users.filter((u) => u.role === "VOLUNTEER").length;
    const approved = users.filter((u) => u.status === "APPROVED").length;
    const pending = users.filter((u) => u.status === "PENDING").length;

    return {
      total,
      admins,
      teachers,
      students,
      parents,
      volunteers,
      approved,
      pending,
      activePercentage: total > 0 ? Math.round((approved / total) * 100) : 0,
    };
  }, [users]);

  // Dados para gráfico de usuários por perfil
  const roleChartData = useMemo(
    () => [
      { name: "Administradores", value: stats.admins, fill: "#158f3e" },
      { name: "Professores", value: stats.teachers, fill: "#e67e22" },
      { name: "Alunos", value: stats.students, fill: "#3498db" },
      { name: "Responsáveis", value: stats.parents, fill: "#9b59b6" },
      { name: "Voluntários", value: stats.volunteers, fill: "#1abc9c" },
    ],
    [stats]
  );

  // Dados para gráfico de status
  const statusChartData = useMemo(
    () => [
      { name: "Aprovados", value: stats.approved, fill: "#27ae60" },
      { name: "Pendentes", value: stats.pending, fill: "#f39c12" },
      { name: "Rejeitados", value: users.filter((u) => u.status === "REJECTED").length, fill: "#e74c3c" },
    ],
    [stats, users]
  );

  // Dados para gráfico de tendência (mock)
  const trendChartData = [
    { month: "Jan", users: 45, active: 40 },
    { month: "Fev", users: 52, active: 48 },
    { month: "Mar", users: 61, active: 55 },
    { month: "Abr", users: 73, active: 68 },
    { month: "Mai", users: 85, active: 78 },
    { month: "Jun", users: stats.total, active: stats.approved },
  ];

  const sidebarItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Usuários", href: "/admin/users", icon: "👥" },
    { label: "Presença", href: "/admin/attendance", icon: "✓" },
    { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
    { divider: true, label: "divider" },
    { label: "Relatórios", href: "/admin/reports", icon: "📈" },
    { label: "Configurações", href: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <ModernLayout>
      <ModernSidebar items={sidebarItems} />
      <div className="lg:ml-64">
        <ModernTopBar
          title="Dashboard Administrativo"
          user={currentUser ? { name: currentUser.full_name, email: currentUser.email } : undefined}
        />

        <div className="p-6">
          <ModernPageHeader
            title="Bem-vindo ao Dashboard"
            description="Acompanhe as métricas e indicadores da ONG Camila em tempo real"
            icon={<TrendingUp />}
          />

          {/* Métricas Principais */}
          <ModernSection title="Métricas Principais" subtitle="Resumo de atividades e usuários">
            <ModernGrid cols={4}>
              <StatCard
                label="Total de Usuários"
                value={stats.total}
                icon={<Users />}
                trend="up"
                trendValue="+12%"
                color="primary"
              />
              <StatCard
                label="Usuários Ativos"
                value={stats.approved}
                icon={<Zap />}
                trend="up"
                trendValue={`${stats.activePercentage}%`}
                color="success"
              />
              <StatCard
                label="Pendentes de Aprovação"
                value={stats.pending}
                icon={<AlertCircle />}
                trend="neutral"
                trendValue="Ação necessária"
                color="warning"
              />
              <StatCard
                label="Projetos Ativos"
                value={12}
                icon={<Award />}
                trend="up"
                trendValue="+2"
                color="secondary"
              />
            </ModernGrid>
          </ModernSection>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de Usuários por Perfil */}
            <ModernCard className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Usuários por Perfil</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ModernCard>

            {/* Gráfico de Status */}
            <ModernCard className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Status dos Usuários</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ModernCard>
          </div>

          {/* Gráfico de Tendência */}
          <ModernCard className="p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-4">Tendência de Crescimento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--primary)", r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Total de Usuários"
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="var(--secondary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--secondary)", r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Usuários Ativos"
                />
              </LineChart>
            </ResponsiveContainer>
          </ModernCard>

          {/* Resumo de Perfis */}
          <ModernSection title="Distribuição de Perfis" subtitle="Quantidade de usuários por função">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <ModernCard className="p-4 text-center hover-lift">
                <p className="text-2xl font-bold text-primary">{stats.admins}</p>
                <p className="text-xs text-muted-foreground mt-1">Administradores</p>
              </ModernCard>
              <ModernCard className="p-4 text-center hover-lift">
                <p className="text-2xl font-bold text-secondary">{stats.teachers}</p>
                <p className="text-xs text-muted-foreground mt-1">Professores</p>
              </ModernCard>
              <ModernCard className="p-4 text-center hover-lift">
                <p className="text-2xl font-bold text-tertiary">{stats.students}</p>
                <p className="text-xs text-muted-foreground mt-1">Alunos</p>
              </ModernCard>
              <ModernCard className="p-4 text-center hover-lift">
                <p className="text-2xl font-bold text-warning">{stats.parents}</p>
                <p className="text-xs text-muted-foreground mt-1">Responsáveis</p>
              </ModernCard>
              <ModernCard className="p-4 text-center hover-lift">
                <p className="text-2xl font-bold text-success">{stats.volunteers}</p>
                <p className="text-xs text-muted-foreground mt-1">Voluntários</p>
              </ModernCard>
            </div>
          </ModernSection>

          {/* Ações Rápidas */}
          <ModernSection title="Ações Rápidas" subtitle="Acesso rápido às funções principais">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ModernCard className="p-6 hover-lift cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-primary" />
                  <h4 className="font-semibold">Gerenciar Usuários</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione, edite ou remova usuários do sistema
                </p>
                <Button variant="outline" className="w-full">
                  Ir para Usuários
                </Button>
              </ModernCard>

              <ModernCard className="p-6 hover-lift cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-secondary" />
                  <h4 className="font-semibold">Presença</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Registre e acompanhe a frequência dos alunos
                </p>
                <Button variant="outline" className="w-full">
                  Ir para Presença
                </Button>
              </ModernCard>

              <ModernCard className="p-6 hover-lift cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-success" />
                  <h4 className="font-semibold">Relatórios</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Gere relatórios detalhados da ONG
                </p>
                <Button variant="outline" className="w-full">
                  Ir para Relatórios
                </Button>
              </ModernCard>
            </div>
          </ModernSection>
        </div>
      </div>
    </ModernLayout>
  );
}
