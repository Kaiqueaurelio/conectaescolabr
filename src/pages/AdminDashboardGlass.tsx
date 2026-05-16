import { useState } from "react";
import {
  GlassLayout,
  GlassContainer,
  GlassGrid,
  GlassSection,
} from "@/components/GlassLayout";
import {
  GlassCard,
  GlassStatCard,
  GlassBanner,
} from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import {
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  BarChart3,
  Calendar,
  Award,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const frequencyData = [
  { month: "Jan", frequency: 85, target: 90 },
  { month: "Fev", frequency: 88, target: 90 },
  { month: "Mar", frequency: 92, target: 90 },
  { month: "Abr", frequency: 89, target: 90 },
  { month: "Mai", frequency: 95, target: 90 },
];

const profileData = [
  { name: "Alunos", value: 45, color: "#158f3e" },
  { name: "Responsáveis", value: 38, color: "#e67e22" },
  { name: "Professores", value: 12, color: "#3498db" },
  { name: "Administradores", value: 5, color: "#9b59b6" },
];

const statusData = [
  { status: "Ativo", count: 78, color: "#2ecc71" },
  { status: "Inativo", count: 12, color: "#e74c3c" },
  { status: "Pendente", count: 8, color: "#f39c12" },
];

export function AdminDashboardGlassPage() {
  const { user: currentUser } = useSupabaseAuth();
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <GlassLayout
      sidebarItems={sidebarItems}
      topBarTitle="Dashboard"
      topBarUser={
        currentUser
          ? {
              name: currentUser.full_name || "Usuário",
              email: currentUser.email || "",
            }
          : undefined
      }
      showSearch={true}
      onSearch={setSearchQuery}
    >
      <GlassContainer>
        {/* Welcome Banner */}
        <GlassBanner
          title={`Bem-vindo, ${currentUser?.full_name?.split(" ")[0]}!`}
          subtitle="Acompanhe o desempenho da ONG Camila em tempo real"
          icon="👋"
          className="mb-8"
        />

        {/* Stats Grid */}
        <GlassGrid cols={4} gap="medium" className="mb-8">
          <GlassStatCard
            label="Total de Usuários"
            value="98"
            icon={<Users className="w-6 h-6" />}
            color="primary"
            trend="up"
            trendValue="+12%"
          />
          <GlassStatCard
            label="Ativos Hoje"
            value="78"
            icon={<UserCheck className="w-6 h-6" />}
            color="success"
            trend="up"
            trendValue="+5%"
          />
          <GlassStatCard
            label="Frequência Média"
            value="91%"
            icon={<TrendingUp className="w-6 h-6" />}
            color="secondary"
            trend="up"
            trendValue="+3%"
          />
          <GlassStatCard
            label="Pendentes"
            value="8"
            icon={<Clock className="w-6 h-6" />}
            color="warning"
            trend="down"
            trendValue="-2%"
          />
        </GlassGrid>

        {/* Charts Section */}
        <GlassGrid cols={2} gap="medium" className="mb-8">
          {/* Frequency Chart */}
          <GlassCard variant="gradient" className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Frequência Mensal
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis stroke="rgba(0,0,0,0.5)" />
                <YAxis stroke="rgba(0,0,0,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "12px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="frequency"
                  stroke="#158f3e"
                  strokeWidth={2}
                  dot={{ fill: "#158f3e", r: 4 }}
                  name="Frequência"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#e67e22"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#e67e22", r: 4 }}
                  name="Meta"
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Status Chart */}
          <GlassCard variant="gradient" className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Status dos Usuários
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis stroke="rgba(0,0,0,0.5)" dataKey="status" />
                <YAxis stroke="rgba(0,0,0,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#158f3e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </GlassGrid>

        {/* Pie Chart and Quick Actions */}
        <GlassGrid cols={2} gap="medium">
          {/* Profile Distribution */}
          <GlassCard variant="gradient" className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Distribuição de Perfis
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={profileData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {profileData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard variant="gradient" className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-6">
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Novo Usuário",
                    icon: <Users className="w-4 h-4" />,
                    href: "/admin/users/new",
                  },
                  {
                    label: "Registrar Presença",
                    icon: <UserCheck className="w-4 h-4" />,
                    href: "/admin/attendance",
                  },
                  {
                    label: "Gerar Relatório",
                    icon: <BarChart3 className="w-4 h-4" />,
                    href: "/admin/reports",
                  },
                  {
                    label: "Agendar Evento",
                    icon: <Calendar className="w-4 h-4" />,
                    href: "/admin/calendar",
                  },
                ].map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start gap-2 rounded-lg"
                  >
                    {action.icon}
                    {action.label}
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                ))}
              </div>
            </div>
          </GlassCard>
        </GlassGrid>

        {/* Recent Activity */}
        <GlassSection
          title="Atividade Recente"
          description="Últimas ações registradas no sistema"
          className="mt-8"
        >
          <div className="space-y-3">
            {[
              {
                action: "Novo usuário cadastrado",
                user: "João Silva",
                time: "há 2 horas",
              },
              {
                action: "Presença registrada",
                user: "Maria Santos",
                time: "há 1 hora",
              },
              {
                action: "Benefício distribuído",
                user: "Pedro Costa",
                time: "há 30 minutos",
              },
            ].map((activity, idx) => (
              <GlassCard key={idx} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </GlassCard>
            ))}
          </div>
        </GlassSection>
      </GlassContainer>
    </GlassLayout>
  );
}
