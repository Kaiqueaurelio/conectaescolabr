import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { GlassLayout, GlassContainer } from "@/components/GlassLayout";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Heart, Zap, AlertCircle } from "lucide-react";

interface ImpactMetric {
  label: string;
  value: number | null;
  change: number | null;
  icon: React.ReactNode;
  color: string;
}

interface TrendData {
  month: string;
  families: number | null;
  baskets: number | null;
  attendance: number | null;
}

export function ImpactDashboardPage() {
  const { user: currentUser } = useSupabaseAuth();
  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      const start = new Date();
      start.setDate(1);
      start.setMonth(start.getMonth() - 5);
      const startIso = start.toISOString();

      const [
        familiesCount,
        benefitsCount,
        attendanceTotal,
        attendancePresent,
        volunteersCount,
        familiesByMonth,
        benefitsByMonth,
        attendanceByMonth,
      ] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "PARENT").eq("status", "APPROVED"),
        supabase.from("benefit_distributions").select("id", { count: "exact", head: true }),
        supabase.from("attendance_records").select("id", { count: "exact", head: true }),
        supabase.from("attendance_records").select("id", { count: "exact", head: true }).eq("status", "PRESENT"),
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "VOLUNTEER").eq("status", "APPROVED"),
        supabase.from("users").select("created_at").eq("role", "PARENT").eq("status", "APPROVED").gte("created_at", startIso),
        supabase.from("benefit_distributions").select("distribution_date,quantity").gte("distribution_date", startIso.slice(0, 10)),
        supabase.from("attendance_records").select("date,status").gte("date", startIso.slice(0, 10)),
      ]);

      if (!active) return;

      const hasErrors = [
        familiesCount.error, benefitsCount.error, attendanceTotal.error,
        attendancePresent.error, volunteersCount.error, familiesByMonth.error,
        benefitsByMonth.error, attendanceByMonth.error,
      ].some(Boolean);
      if (hasErrors) {
        console.error("Falha ao carregar dados do painel de impacto", {
          families: familiesCount.error, benefits: benefitsCount.error,
          attendance: attendanceTotal.error, volunteers: volunteersCount.error,
          familiesByMonth: familiesByMonth.error, benefitsByMonth: benefitsByMonth.error,
          attendanceByMonth: attendanceByMonth.error,
        });
      }

      const totalAttendance = attendanceTotal.error ? null : (attendanceTotal.count ?? 0);
      const presentAttendance = attendancePresent.error ? null : (attendancePresent.count ?? 0);
      const attendanceRate = totalAttendance === null || presentAttendance === null
        ? null
        : totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : null;

      setMetrics([
        {
          label: "Famílias cadastradas",
          value: familiesCount.error ? null : (familiesCount.count ?? 0),
          change: null,
          icon: <Users className="w-6 h-6" />,
          color: "from-green-500 to-emerald-600",
        },
        {
          label: "Distribuições de benefícios",
          value: benefitsCount.error ? null : (benefitsCount.count ?? 0),
          change: null,
          icon: <Heart className="w-6 h-6" />,
          color: "from-orange-500 to-red-600",
        },
        {
          label: "Taxa de presença",
          value: attendanceRate,
          change: null,
          icon: <TrendingUp className="w-6 h-6" />,
          color: "from-blue-500 to-cyan-600",
        },
        {
          label: "Voluntários aprovados",
          value: volunteersCount.error ? null : (volunteersCount.count ?? 0),
          change: null,
          icon: <Zap className="w-6 h-6" />,
          color: "from-purple-500 to-pink-600",
        },
      ]);

      const familyRows = familiesByMonth.data ?? [];
      const benefitRows = benefitsByMonth.data ?? [];
      const attendanceRows = attendanceByMonth.data ?? [];
      const months = Array.from({ length: 6 }, (_, index) => {
        const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const families = familyRows.filter((row) => row.created_at?.slice(0, 7) === monthKey).length;
        const baskets = benefitRows
          .filter((row) => String(row.distribution_date).slice(0, 7) === monthKey)
          .reduce((sum, row) => sum + Number(row.quantity ?? 0), 0);
        const monthAttendance = attendanceRows.filter((row) => String(row.date).slice(0, 7) === monthKey);
        const present = monthAttendance.filter((row) => row.status === "PRESENT").length;
        return {
          month: date.toLocaleDateString("pt-BR", { month: "short" }),
          families: familiesByMonth.error ? null : families,
          baskets: benefitsByMonth.error ? null : baskets,
          attendance: attendanceByMonth.error || monthAttendance.length === 0
            ? null
            : Math.round((present / monthAttendance.length) * 100),
        };
      });

      setTrendData(months);
      setLoading(false);
    };

    void loadDashboard().catch((error) => {
      console.error("Erro inesperado ao carregar painel:", error);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
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
                {metric.change !== null && (
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{metric.change}%</span>
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-white/90 mb-1">{metric.label}</h3>
              <p className="text-3xl font-bold">{loading ? "…" : metric.value === null ? "—" : metric.label === "Presenças registradas" ? `${metric.value}%` : metric.value.toLocaleString()}</p>
              <p className="text-xs text-white/75 mt-2">{metric.change === null ? "Dados do banco de dados" : "vs. mês anterior"}</p>
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

        {/* Alertas fictícios removidos: exibir somente alertas derivados de regras e dados reais. */}
        <div className="bg-card rounded-2xl p-6 shadow-soft-lg">
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
            Integridade dos dados
          </h3>
          <p className="text-sm text-muted-foreground">
            Os indicadores acima são consultados no banco de dados. Um traço (—) indica que a consulta falhou ou que não há registros suficientes para calcular a métrica; os números de demonstração foram removidos.
          </p>
        </div>
      </GlassContainer>
    </GlassLayout>
  );
}
