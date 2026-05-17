import React from "react";
import { SkillPathBanner } from "@/components/SkillPathBanner";
import { SkillPathMetricCard } from "@/components/SkillPathMetricCard";
import { SkillPathProgressCard } from "@/components/SkillPathProgressCard";
import { GlassLayout, GlassContainer, GlassGrid, GlassSection } from "@/components/GlassLayout";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, BookOpen, Heart, TrendingUp, Award, Calendar, AlertCircle, CheckCircle } from "lucide-react";

// Mock data - será substituído por dados reais do Supabase
const chartData = [
  { month: "Jan", assistidos: 45, frequência: 85, benefícios: 120 },
  { month: "Fev", assistidos: 52, frequência: 88, benefícios: 135 },
  { month: "Mar", assistidos: 48, frequência: 82, benefícios: 128 },
  { month: "Abr", assistidos: 61, frequência: 90, benefícios: 150 },
  { month: "Mai", assistidos: 55, frequência: 87, benefícios: 142 },
  { month: "Jun", assistidos: 67, frequência: 92, benefícios: 165 },
];

const sidebarItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
  { label: "Assistidos", href: "/admin/users", icon: "👥" },
  { label: "Presença", href: "/admin/attendance", icon: "📋" },
  { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
  { label: "Comunicados", href: "/admin/communications", icon: "📢" },
  { label: "Relatórios", href: "/admin/reports", icon: "📄" },
  { divider: true },
  { label: "Configurações", href: "/admin/security", icon: "⚙️" },
];

export function AdminDashboardSkillPathPage() {
  return (
    <GlassLayout
      sidebarItems={sidebarItems}
      topBarTitle="Dashboard Administrativo"
      topBarUser={{
        name: "Admin Camila",
        email: "admin@camila.org.br",
      }}
    >
      <GlassContainer className="space-y-8">
        {/* Welcome Banner */}
        <SkillPathBanner
          title="Bem-vindo ao Dashboard"
          subtitle="Acompanhe o impacto social da Associação Camila em tempo real"
          userName="Admin"
          gradientFrom="from-primary"
          gradientTo="to-secondary"
        />

        {/* Key Metrics */}
        <GlassSection title="Métricas Principais" description="Resumo do mês atual">
          <GlassGrid cols={4} gap="medium">
            <SkillPathMetricCard
              title="Total de Assistidos"
              value="67"
              icon={<Users className="w-6 h-6" />}
              trend="up"
              trendValue="+12% vs mês anterior"
              color="primary"
            />
            <SkillPathMetricCard
              title="Frequência Média"
              value="92%"
              icon={<CheckCircle className="w-6 h-6" />}
              trend="up"
              trendValue="+5% vs mês anterior"
              color="secondary"
            />
            <SkillPathMetricCard
              title="Benefícios Distribuídos"
              value="165"
              icon={<Heart className="w-6 h-6" />}
              trend="up"
              trendValue="+23% vs mês anterior"
              color="accent"
            />
            <SkillPathMetricCard
              title="Atividades Realizadas"
              value="28"
              icon={<Calendar className="w-6 h-6" />}
              trend="neutral"
              trendValue="Este mês"
              color="destructive"
            />
          </GlassGrid>
        </GlassSection>

        {/* Progress Cards */}
        <GlassSection title="Progresso das Metas" description="Acompanhe o cumprimento de objetivos">
          <GlassGrid cols={3} gap="medium">
            <SkillPathProgressCard
              title="Meta de Assistidos"
              current={67}
              total={80}
              icon="🎯"
              color="primary"
            />
            <SkillPathProgressCard
              title="Frequência Alvo"
              current={92}
              total={100}
              icon="📈"
              color="secondary"
            />
            <SkillPathProgressCard
              title="Distribuição de Cestas"
              current={165}
              total={200}
              icon="🎁"
              color="accent"
            />
          </GlassGrid>
        </GlassSection>

        {/* Charts */}
        <GlassSection title="Tendências e Análises" description="Evolução dos indicadores ao longo do tempo">
          <GlassGrid cols={2} gap="medium">
            {/* Line Chart - Crescimento de Assistidos */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <h3 className="text-lg font-semibold text-foreground mb-4">Crescimento de Assistidos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="assistidos"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Area Chart - Benefícios Distribuídos */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <h3 className="text-lg font-semibold text-foreground mb-4">Benefícios Distribuídos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="benefícios"
                    fill="hsl(var(--secondary))"
                    stroke="hsl(var(--secondary))"
                    opacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassGrid>
        </GlassSection>

        {/* Alerts and Notices */}
        <GlassSection title="Avisos Importantes" description="Ações que requerem atenção">
          <div className="space-y-3">
            <div className="flex items-start gap-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Estoque Baixo</p>
                <p className="text-sm text-muted-foreground">Leite integral com apenas 5 unidades restantes</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Frequência Crítica</p>
                <p className="text-sm text-muted-foreground">3 alunos com frequência abaixo de 70% este mês</p>
              </div>
            </div>
          </div>
        </GlassSection>
      </GlassContainer>
    </GlassLayout>
  );
}

export default AdminDashboardSkillPathPage;
