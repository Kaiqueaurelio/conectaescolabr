import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck, Megaphone, CalendarDays, ArrowRight, ArrowLeft, CheckCircle2, Sparkles,
} from "lucide-react";
import { Role } from "@/lib/mockData";

const KEY = (id: string) => `camila_onboarding_seen_${id}`;

interface Step {
  icon: any;
  badge: string;
  title: string;
  desc: string;
  cta?: { label: string; to: string };
  tone: string;
}

function stepsFor(role: Role): Step[] {
  const chamada: Step = {
    icon: ClipboardCheck, badge: "Passo 1 — Chamada",
    title: "Registre a presença em segundos",
    desc: "Em Chamada você seleciona a turma e marca presença, falta ou justificada com um toque. Os dados ficam disponíveis para coordenação e responsáveis automaticamente.",
    cta: { label: "Abrir Chamada", to: "/chamada" },
    tone: "from-primary to-primary-glow",
  };
  const comunicados: Step = {
    icon: Megaphone, badge: "Passo 2 — Comunicados",
    title: "Comunique-se com toda a comunidade",
    desc: "Envie avisos para professores, alunas, responsáveis ou todos. Use filtros por destinatário e mantenha o histórico organizado.",
    cta: { label: "Ver Comunicados", to: "/comunicados" },
    tone: "from-secondary to-accent",
  };
  const agenda: Step = {
    icon: CalendarDays, badge: "Passo 3 — Agenda",
    title: "Tudo da ONG num calendário só",
    desc: "Aulas, reuniões, oficinas e eventos abertos às famílias. Veja a semana inteira e nunca perca uma data importante.",
    cta: { label: "Abrir Agenda", to: "/agenda" },
    tone: "from-tertiary to-primary",
  };

  // Ajusta o passo 1 conforme o papel — todos seguem chamada/comunicados/agenda
  // mas para perfis sem acesso à Chamada, trocamos por uma orientação compatível.
  if (role === "STUDENT" || role === "PARENT") {
    return [
      {
        icon: ClipboardCheck, badge: "Passo 1 — Acompanhamento",
        title: role === "STUDENT" ? "Acompanhe sua jornada" : "Acompanhe seu(sua) filho(a)",
        desc: role === "STUDENT"
          ? "Veja seus comunicados, próximas atividades e lembretes em um painel feito para você."
          : "Visualize frequência, comunicados e lembretes do(a) seu(sua) filho(a) em tempo real.",
        cta: { label: "Ir ao painel", to: role === "STUDENT" ? "/aluno" : "/responsavel" },
        tone: "from-primary to-primary-glow",
      },
      comunicados,
      agenda,
    ];
  }
  return [chamada, comunicados, agenda];
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!user) return;
    if (!localStorage.getItem(KEY(user.id))) {
      const t = setTimeout(() => setOpen(true), 350);
      return () => clearTimeout(t);
    }
  }, [user]);

  if (!user) return null;
  const steps = stepsFor(user.role);
  const step = steps[i];
  const Icon = step.icon;
  const last = i === steps.length - 1;

  const finish = () => {
    localStorage.setItem(KEY(user.id), "1");
    setOpen(false);
    setI(0);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) finish(); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-floating">
        <div className={`bg-gradient-to-br ${step.tone} text-primary-foreground p-6 relative`}>
          <Sparkles className="absolute right-4 top-4 h-4 w-4 opacity-60" />
          <div className="text-[11px] uppercase tracking-wider font-semibold opacity-95">{step.badge}</div>
          <div className="mt-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Icon className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold leading-tight">{step.title}</h2>
        </div>

        <div className="p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>

          <div className="mt-5 flex justify-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-1.5 bg-muted"}`}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-2">
            <Button
              variant="ghost" size="sm"
              onClick={() => (i === 0 ? finish() : setI(i - 1))}
              className="text-muted-foreground"
            >
              {i === 0 ? "Pular" : (<><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</>)}
            </Button>

            <div className="flex items-center gap-2">
              {step.cta && (
                <Button
                  variant="outline" size="sm"
                  onClick={() => { finish(); navigate(step.cta!.to); }}
                >
                  {step.cta.label}
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => (last ? finish() : setI(i + 1))}
                className="gradient-primary text-primary-foreground"
              >
                {last ? (<><CheckCircle2 className="h-4 w-4 mr-1" /> Começar</>) : (<>Próximo <ArrowRight className="h-4 w-4 ml-1" /></>)}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
