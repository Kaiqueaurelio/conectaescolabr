import React from "react";
import { SkillPathBanner } from "@/components/SkillPathBanner";
import { SkillPathMetricCard } from "@/components/SkillPathMetricCard";
import { SkillPathProgressCard } from "@/components/SkillPathProgressCard";
import { GlassLayout, GlassContainer, GlassGrid, GlassSection } from "@/components/GlassLayout";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BookOpen, Award, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data - será substituído por dados reais do Supabase
const frequencyData = [
  { week: "Sem 1", frequência: 100 },
  { week: "Sem 2", frequência: 85 },
  { week: "Sem 3", frequência: 90 },
  { week: "Sem 4", frequência: 95 },
];

const coursesData = [
  { id: 1, name: "Português Básico", progress: 75, instructor: "Profa. Maria" },
  { id: 2, name: "Matemática Essencial", progress: 60, instructor: "Prof. João" },
  { id: 3, name: "Inglês Iniciante", progress: 45, instructor: "Profa. Ana" },
  { id: 4, name: "Habilidades Digitais", progress: 80, instructor: "Prof. Carlos" },
];

const sidebarItems = [
  { label: "Meu Dashboard", href: "/aluno/dashboard", icon: "📊" },
  { label: "Meus Cursos", href: "/aluno/courses", icon: "📚" },
  { label: "Frequência", href: "/aluno/attendance", icon: "📋" },
  { label: "Certificados", href: "/aluno/certificates", icon: "🏆" },
  { label: "Mensagens", href: "/aluno/messages", icon: "💬" },
  { divider: true },
  { label: "Meu Perfil", href: "/aluno/profile", icon: "👤" },
];

export function StudentDashboardSkillPathPage() {
  return (
    <GlassLayout
      sidebarItems={sidebarItems}
      topBarTitle="Meu Dashboard"
      topBarUser={{
        name: "João Silva",
        email: "joao@example.com",
      }}
    >
      <GlassContainer className="space-y-8">
        {/* Welcome Banner */}
        <SkillPathBanner
          title="Bem-vindo, João! 👋"
          subtitle="Continue sua jornada de aprendizado"
          userName="João"
          gradientFrom="from-primary"
          gradientTo="to-accent"
        />

        {/* Key Metrics */}
        <GlassSection title="Seu Progresso" description="Resumo do seu desempenho">
          <GlassGrid cols={4} gap="medium">
            <SkillPathMetricCard
              title="Frequência"
              value="92%"
              icon={<CheckCircle className="w-6 h-6" />}
              trend="up"
              trendValue="+5% vs mês anterior"
              color="primary"
            />
            <SkillPathMetricCard
              title="Cursos em Andamento"
              value="4"
              icon={<BookOpen className="w-6 h-6" />}
              trend="neutral"
              trendValue="Ativo"
              color="secondary"
            />
            <SkillPathMetricCard
              title="Certificados Obtidos"
              value="3"
              icon={<Award className="w-6 h-6" />}
              trend="up"
              trendValue="+1 este mês"
              color="accent"
            />
            <SkillPathMetricCard
              title="Horas de Estudo"
              value="48"
              icon={<Clock className="w-6 h-6" />}
              trend="up"
              trendValue="+8 horas"
              color="destructive"
            />
          </GlassGrid>
        </GlassSection>

        {/* Progress Cards */}
        <GlassSection title="Metas Pessoais" description="Acompanhe seus objetivos">
          <GlassGrid cols={2} gap="medium">
            <SkillPathProgressCard
              title="Conclusão de Cursos"
              current={2}
              total={4}
              icon="🎓"
              color="primary"
            />
            <SkillPathProgressCard
              title="Frequência Alvo"
              current={92}
              total={100}
              icon="✅"
              color="secondary"
            />
          </GlassGrid>
        </GlassSection>

        {/* Courses Section */}
        <GlassSection title="Meus Cursos" description="Cursos em que você está inscrito">
          <div className="space-y-4">
            {coursesData.map((course) => (
              <div
                key={course.id}
                className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{course.name}</h3>
                    <p className="text-sm text-muted-foreground">Instrutor: {course.instructor}</p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{course.progress}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>

                <Button variant="outline" size="sm">
                  Continuar Aprendendo
                </Button>
              </div>
            ))}
          </div>
        </GlassSection>

        {/* Charts */}
        <GlassSection title="Análises" description="Seu desempenho ao longo do tempo">
          <GlassGrid cols={2} gap="medium">
            {/* Frequency Chart */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <h3 className="text-lg font-semibold text-foreground mb-4">Frequência Semanal</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="frequência"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Course Progress Chart */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <h3 className="text-lg font-semibold text-foreground mb-4">Progresso dos Cursos</h3>
              <div className="space-y-4">
                {coursesData.map((course) => (
                  <div key={course.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{course.name}</span>
                      <span className="text-sm text-muted-foreground">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassGrid>
        </GlassSection>

        {/* Alerts */}
        <GlassSection title="Notificações" description="Informações importantes">
          <div className="space-y-3">
            <div className="flex items-start gap-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Parabéns!</p>
                <p className="text-sm text-muted-foreground">Você atingiu 90% de frequência este mês</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Novo Conteúdo</p>
                <p className="text-sm text-muted-foreground">Português Básico tem novo módulo disponível</p>
              </div>
            </div>
          </div>
        </GlassSection>
      </GlassContainer>
    </GlassLayout>
  );
}

export default StudentDashboardSkillPathPage;
