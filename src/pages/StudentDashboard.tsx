import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { events, games, quizQuestions } from "@/lib/mockData";
import { Calculator, FlaskConical, BookOpen, Map, Brain, Sparkles, Sparkle, Star, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const iconMap: Record<string, any> = { Calculator, FlaskConical, BookOpen, Map, Brain, Sparkles };

export default function StudentDashboard() {
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.date >= today).slice(0, 3);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);

  const openGame = (id: string, title: string) => {
    if (id === "g2") {
      setActiveGame("quiz");
      setQIndex(0);
      setScore(0);
    } else {
      toast(`${title} estará disponível em breve!`, { description: "Estamos preparando essa atividade com muito carinho." });
    }
  };

  const answer = (i: number) => {
    const correct = quizQuestions[qIndex].answer === i;
    if (correct) setScore((s) => s + 1);
    if (qIndex < quizQuestions.length - 1) {
      setQIndex((q) => q + 1);
    } else {
      toast.success(`Quiz finalizado! Você acertou ${score + (correct ? 1 : 0)} de ${quizQuestions.length}.`);
      setActiveGame(null);
    }
  };

  return (
    <AppLayout>
      <section className="mb-6 rounded-3xl gradient-warm p-6 text-secondary-foreground shadow-warm relative overflow-hidden">
        <Sparkle className="absolute top-3 right-4 h-5 w-5 opacity-60" />
        <Star className="absolute bottom-4 right-12 h-4 w-4 opacity-50" />
        <p className="text-sm opacity-90">Olá,</p>
        <h1 className="text-2xl font-bold mt-1">{user?.name?.split(" ")[0]} 👋</h1>
        <p className="mt-2 text-sm opacity-95">Pronto(a) para aprender hoje?</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/25 backdrop-blur px-3 py-1.5">
          <Trophy className="h-4 w-4" />
          <span className="text-xs font-semibold">120 pontos esta semana</span>
        </div>
      </section>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Próximas atividades</h2>
      <div className="space-y-2 mb-8">
        {upcoming.map((e) => (
          <Card key={e.id} className="p-4 flex items-center gap-3 hover:shadow-soft transition-smooth">
            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-primary/12 text-primary flex-shrink-0">
              <span className="text-[10px] font-semibold uppercase">{new Date(e.date).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span>
              <span className="text-base font-bold leading-none">{new Date(e.date).getDate()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{e.title}</p>
              <p className="text-xs text-muted-foreground truncate">{e.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-secondary" /> Área de jogos
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {games.map((g) => {
          const Icon = iconMap[g.icon];
          return (
            <button
              key={g.id}
              onClick={() => openGame(g.id, g.title)}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${g.color} p-4 text-left text-primary-foreground shadow-elevated hover:scale-[1.03] active:scale-[0.98] transition-smooth`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/25 backdrop-blur mb-2">
                <Icon className="h-6 w-6" />
              </div>
              <p className="font-bold text-sm">{g.title}</p>
              <p className="text-[11px] opacity-90 mt-0.5">{g.description}</p>
            </button>
          );
        })}
      </div>

      <Dialog open={activeGame === "quiz"} onOpenChange={(o) => !o && setActiveGame(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FlaskConical className="h-5 w-5 text-primary" /> Quiz de Ciências</DialogTitle>
          </DialogHeader>
          {activeGame === "quiz" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Pergunta {qIndex + 1} de {quizQuestions.length}</span>
                <span>Pontos: {score}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full gradient-primary transition-all" style={{ width: `${((qIndex) / quizQuestions.length) * 100}%` }} />
              </div>
              <p className="text-lg font-semibold">{quizQuestions[qIndex].q}</p>
              <div className="space-y-2">
                {quizQuestions[qIndex].options.map((opt, i) => (
                  <Button key={i} variant="outline" className="w-full justify-start h-12" onClick={() => answer(i)}>{opt}</Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}