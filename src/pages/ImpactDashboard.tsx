import { useState, useEffect } from "react";
import { GlassLayout, GlassContainer } from "@/components/GlassLayout";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Heart, Zap, AlertCircle } from "lucide-react";

interface ImpactMetric {
  label: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface TrendData {
  month: string;
  families: number;
  baskets: number;
  attendance: number;
}

export function ImpactDashboardPage() {
  const { user: currentUser } = useSupabaseAuth();
  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados reais do Supabase
    // Em produção, isso viria de queries ao banco de dados
    setTimeout(() => {
      setMetrics([
        {
          label: "Famílias Atendidas",
          value: 247,
          change: 12,
          icon: <Users className="w-6 h-6" />,
          color: "from-green-500 to-emerald-600",
        },
        {
          label: "Cestas Distribuídas",
          value: 1243,
          change: 28,
          icon: <Heart className="w-6 h-6" />,
          color: "from-orange-500 to-red-600",
        },
        {
          label: "Frequência Média",
          value: 87,
          change: 5,
          icon: <TrendingUp className="w-6 h-6" />,
          color: "from-blue-500 to-cyan-600",
        },
        {
          label: "Voluntários Ativos",
          value: 34,
          change: 8,
          icon: <Zap className="w-6 h-6" />,
          color: "from-purple-500 to-pink-600",
        },
      ]);

      setTrendData([
        { month: "Jan", families: 180, baskets: 850, attendance: 82 },
        { month: "Fev", families: 195, baskets: 920, attendance: 84 },
        { month: "Mar", families: 210, baskets: 1050, attendance: 85 },
        { month: "Abr", families: 225, baskets: 1100, attendance: 86 },
        { month: "Mai", families: 235, baskets: 1150, attendance: 87 },
        { month: "Jun", families: 247, baskets: 1243, attendance: 87 },
      ]);

      setLoading(false);
    }, 500);
  }, []);

  const sidebarItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { label: "Impacto Social", href: "/admin/impact", icon: "❤️" },
    { label: "Usuários", href: "/admin/users", icon: "👥" },
    { label: "Presença", href: "/admin/attendance", icon: "✓" },
    { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
  ];

  return (
    <GlassLayout
      sidebarItems={sidebarItems}
      topBarTitle="Dashboard de Impacto Social"
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
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`bg-gradient-to-br ${metric.color} rounded-2xl p-6 text-white shadow-soft-lg hover:shadow-soft-xl transition-shadow`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
                  {metric.icon}
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{metric.change}%</span>
                </div>
              </div>
              <h3 className="text-sm font-medium text-white/90 mb-1">{metric.label}</h3>
              <p className="text-3xl font-bold">{metric.value.toLocaleString()}</p>
              <p className="text-xs text-white/75 mt-2">vs. mês anterior</p>
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tendência de Crescimento */}
          <div className="bg-card rounded-2xl p-6 shadow-soft-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Tendência de Crescimento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="families"
                  stroke="#01965c"
                  strokeWidth={2}
                  dot={{ fill: "#01965c" }}
                  name="Famílias"
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#f08900"
                  strokeWidth={2}
                  dot={{ fill: "#f08900" }}
                  name="Frequência %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição de Benefícios */}
          <div className="bg-card rounded-2xl p-6 shadow-soft-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição de Benefícios</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="baskets" fill="#01965c" name="Cestas Distribuídas" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alertas e Avisos */}
        <div className="bg-card rounded-2xl p-6 shadow-soft-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-coral" />
            Alertas Importantes
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-coral/10 rounded-lg border border-coral/20">
              <div className="w-2 h-2 rounded-full bg-coral mt-1.5" />
              <div>
                <p className="font-medium text-foreground">Estoque Baixo</p>
                <p className="text-sm text-muted-foreground">Leite em pó: apenas 15 unidades restantes</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-tertiary/10 rounded-lg border border-tertiary/20">
              <div className="w-2 h-2 rounded-full bg-tertiary mt-1.5" />
              <div>
                <p className="font-medium text-foreground">Frequência Crítica</p>
                <p className="text-sm text-muted-foreground">3 alunos com mais de 5 faltas consecutivas</p>
              </div>
            </div>
          </div>
        </div>
      </GlassContainer>
    </GlassLayout>
  );
}
