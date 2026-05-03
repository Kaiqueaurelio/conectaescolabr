import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { users as seedUsers } from "@/lib/mockData";
import { GraduationCap, Users } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function Turmas() {
  const { turmas, students } = useData();
  const teachers = seedUsers.filter((u) => u.role === "TEACHER");

  return (
    <AppLayout>
      <PageHeader title="Turmas" subtitle="Conheça as turmas e alunas atendidas" />
      {turmas.length === 0 ? (
        <EmptyState icon={Users} title="Nenhuma turma cadastrada." description="Crie a primeira turma no painel administrativo." />
      ) : (
        <div className="space-y-4">
          {turmas.map((t) => {
            const teacher = teachers.find((x) => x.id === t.teacher_id);
            const inTurma = students.filter((s) => t.studentIds.includes(s.id));
            return (
              <Card key={t.id} className="p-5 hover:shadow-elevated transition-smooth animate-fade-in">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-bold leading-tight">{t.name}</h2>
                        <p className="text-xs text-muted-foreground">{teacher?.name || "Sem responsável"}</p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[11px]">{inTurma.length} alunas</Badge>
                </div>
                {inTurma.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-3 text-center">Sem alunas matriculadas.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {inTurma.map((s) => {
                      const initials = s.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
                      return (
                        <div key={s.id} className="flex items-center gap-2 rounded-full bg-muted/60 pl-1 pr-3 py-1">
                          <Avatar className="h-7 w-7"><AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-[10px] font-bold">{initials}</AvatarFallback></Avatar>
                          <span className="text-xs font-medium">{s.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}