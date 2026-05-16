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
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  TrendingUp,
  Download,
  QrCode,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const attendanceData = [
  { date: "Seg", present: 45, absent: 5, total: 50 },
  { date: "Ter", present: 48, absent: 2, total: 50 },
  { date: "Qua", present: 46, absent: 4, total: 50 },
  { date: "Qui", present: 49, absent: 1, total: 50 },
  { date: "Sex", present: 47, absent: 3, total: 50 },
];

const frequencyTrend = [
  { week: "Sem 1", frequency: 88 },
  { week: "Sem 2", frequency: 91 },
  { week: "Sem 3", frequency: 89 },
  { week: "Sem 4", frequency: 94 },
];

export function AttendanceGlassPage() {
  const { user: currentUser } = useSupabaseAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

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
      topBarTitle="Presença"
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
              <CheckCircle className="w-8 h-8 text-primary" />
              Sistema de Presença
            </h1>
            <p className="text-muted-foreground mt-2">
              Registre e acompanhe a frequência dos usuários
            </p>
          </div>
          <Button className="gap-2 rounded-lg">
            <QrCode className="w-4 h-4" />
            Gerar QR Code
          </Button>
        </div>

        {/* Stats */}
        <GlassGrid cols={4} gap="medium" className="mb-8">
          <GlassStatCard
            label="Presentes Hoje"
            value="47"
            icon={<CheckCircle className="w-6 h-6" />}
            color="success"
            trend="up"
            trendValue="+2"
          />
          <GlassStatCard
            label="Ausentes"
            value="3"
            icon={<XCircle className="w-6 h-6" />}
            color="destructive"
            trend="down"
            trendValue="-1"
          />
          <GlassStatCard
            label="Taxa de Frequência"
            value="94%"
            icon={<TrendingUp className="w-6 h-6" />}
            color="primary"
            trend="up"
            trendValue="+3%"
          />
          <GlassStatCard
            label="Média Semanal"
            value="91%"
            icon={<Calendar className="w-6 h-6" />}
            color="secondary"
          />
        </GlassGrid>

        {/* Register Attendance */}
        <GlassCard className="p-8 mb-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Registrar Presença
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="date" className="text-foreground">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-2 rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="student" className="text-foreground">
                Selecione o Aluno
              </Label>
              <Input
                id="student"
                placeholder="Digite o nome ou ID..."
                className="mt-2 rounded-lg"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button className="flex-1 rounded-lg gap-2">
                <CheckCircle className="w-4 h-4" />
                Registrar Presença
              </Button>
              <Button variant="outline" className="rounded-lg gap-2">
                <XCircle className="w-4 h-4" />
                Registrar Falta
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Charts */}
        <GlassGrid cols={2} gap="medium" className="mb-8">
          {/* Daily Attendance */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Presença Diária
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis stroke="rgba(0,0,0,0.5)" dataKey="date" />
                <YAxis stroke="rgba(0,0,0,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "12px",
                  }}
                />
                <Legend />
                <Bar dataKey="present" fill="#158f3e" name="Presentes" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="#e74c3c" name="Ausentes" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Frequency Trend */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Tendência de Frequência
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={frequencyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis stroke="rgba(0,0,0,0.5)" dataKey="week" />
                <YAxis stroke="rgba(0,0,0,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="frequency"
                  stroke="#158f3e"
                  strokeWidth={2}
                  dot={{ fill: "#158f3e", r: 4 }}
                  name="Frequência %"
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </GlassGrid>

        {/* Recent Records */}
        <GlassSection title="Registros Recentes">
          <div className="space-y-3">
            {[
              {
                name: "João Silva",
                status: "present",
                time: "08:15",
                date: "Hoje",
              },
              {
                name: "Maria Santos",
                status: "present",
                time: "08:20",
                date: "Hoje",
              },
              {
                name: "Pedro Costa",
                status: "absent",
                time: "-",
                date: "Hoje",
              },
              {
                name: "Ana Oliveira",
                status: "present",
                time: "08:10",
                date: "Hoje",
              },
            ].map((record, idx) => (
              <GlassCard key={idx} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                      record.status === "present"
                        ? "bg-gradient-to-br from-green-400 to-emerald-500"
                        : "bg-gradient-to-br from-red-400 to-pink-500"
                    }`}
                  >
                    {record.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{record.name}</p>
                    <p className="text-xs text-muted-foreground">{record.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {record.status === "present" ? "Presente" : "Ausente"}
                    </p>
                    <p className="text-xs text-muted-foreground">{record.time}</p>
                  </div>
                  {record.status === "present" ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                </div>
              </GlassCard>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4 rounded-lg gap-2">
            <Download className="w-4 h-4" />
            Exportar Relatório
          </Button>
        </GlassSection>
      </GlassContainer>
    </GlassLayout>
  );
}
