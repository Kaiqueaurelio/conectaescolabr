import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Users, GraduationCap, ClipboardCheck, CalendarDays, ArrowRight } from "lucide-react";

const sections = [
  {
    to: "/admin/users",
    title: "Pessoas",
    desc: "Cadastro de alunas, responsáveis, professores e voluntários.",
    icon: Users,
    tone: "tone-primary",
  },
  {
    to: "/turmas",
    title: "Turmas",
    desc: "Crie e gerencie turmas, vincule alunas e responsáveis.",
    icon: GraduationCap,
    tone: "tone-tertiary",
  },
  {
    to: "/chamada",
    title: "Chamada",
    desc: "Registre presença, falta ou justificativa por turma e data.",
    icon: ClipboardCheck,
    tone: "tone-secondary",
  },
  {
    to: "/agenda",
    title: "Agenda",
    desc: "Calendário com aulas, reuniões e eventos da ONG.",
    icon: CalendarDays,
    tone: "tone-coral",
  },
];

export default function CadastroGeral() {
  return (
    <AppLayout>
      <PageHeader
        title="Cadastro Geral"
        subtitle="Centro de gestão da ONG — pessoas, turmas, chamada e agenda."
      />
      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.to} to={s.to} className="group">
              <Card
                className={`${s.tone} p-6 hover-lift tone-border-t bg-card/80 backdrop-blur transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl tone-gradient text-white flex items-center justify-center tone-glow-shadow shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{s.title}</h3>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </AppLayout>
  );
}