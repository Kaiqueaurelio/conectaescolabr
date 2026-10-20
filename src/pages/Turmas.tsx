import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, CalendarDays, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import EmptyState from "@/components/EmptyState";

interface ActivityItem {
  id: string;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export default function Turmas() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const loadActivities = async () => {
      const { data, error: queryError } = await supabase
        .from("activities")
        .select("id,name,description,start_date,end_date")
        .order("name", { ascending: true });
      if (!active) return;
      if (queryError) {
        console.error("Erro ao carregar atividades:", queryError);
        setError(true);
        setActivities([]);
      } else {
        setError(false);
        setActivities((data ?? []) as ActivityItem[]);
      }
      setLoading(false);
    };
    void loadActivities().catch((cause) => {
      console.error("Erro inesperado ao carregar atividades:", cause);
      if (active) { setError(true); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  return (
    <AppLayout>
      <PageHeader title="Atividades e turmas" subtitle="Atividades cadastradas no banco de dados" />
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
        <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
        A estrutura atual não confirma vínculos de docentes e matrículas por turma. Esta tela mostra somente atividades reais, sem inventar listas de alunos ou responsáveis.
      </div>
      {loading ? (
        <Card className="p-6 text-sm text-muted-foreground">Carregando atividades...</Card>
      ) : error ? (
        <EmptyState icon={AlertCircle} title="Atividades indisponíveis" description="Não foi possível consultar a tabela de atividades. Verifique a conexão e as permissões do banco." />
      ) : activities.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Nenhuma atividade cadastrada" description="Quando houver atividades salvas no banco, elas aparecerão aqui." />
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id} className="p-5 hover:shadow-elevated transition-smooth">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold leading-tight">{activity.name}</h2>
                    {activity.description && <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>}
                    {(activity.start_date || activity.end_date) && (
                      <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {activity.start_date ? new Date(activity.start_date).toLocaleDateString("pt-BR") : "Data inicial não informada"}
                        {activity.end_date ? ` — ${new Date(activity.end_date).toLocaleDateString("pt-BR")}` : ""}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-[11px]">Atividade</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
