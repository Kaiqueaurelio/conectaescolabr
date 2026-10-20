import { useEffect, useState } from "react";
import { ModernLayout, ModernCard, ModernEmptyState } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { Calendar, Bell, Clock, AlertCircle, HeartHandshake } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface VolunteerEvent {
  id: string;
  title: string;
  description?: string | null;
  start_datetime: string;
  location?: string | null;
}
interface VolunteerAnnouncement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const sidebarItems = [
  { label: "Meu painel", href: "/voluntario", icon: "🤝" },
  { label: "Eventos", href: "/voluntario", icon: "📅" },
  { label: "Comunicados", href: "/voluntario", icon: "📢" },
];

export default function VolunteerDashboardPage() {
  const { user } = useSupabaseAuth();
  const [events, setEvents] = useState<VolunteerEvent[]>([]);
  const [announcements, setAnnouncements] = useState<VolunteerAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [eventsResult, announcementsResult] = await Promise.all([
        supabase.from("events")
          .select("id,title,description,start_datetime,location")
          .gte("start_datetime", new Date().toISOString())
          .order("start_datetime", { ascending: true })
          .limit(10),
        supabase.from("announcements")
          .select("id,title,content,target_roles,created_at")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      if (!active) return;
      const failed = Boolean(eventsResult.error || announcementsResult.error);
      setError(failed);
      if (failed) console.error("Falha ao carregar painel de voluntariado:", eventsResult.error, announcementsResult.error);
      setEvents(eventsResult.error ? [] : (eventsResult.data ?? []) as VolunteerEvent[]);
      setAnnouncements(announcementsResult.error ? [] : (announcementsResult.data ?? [])
        .filter((item) => Array.isArray(item.target_roles) &&
          (item.target_roles.includes("ALL") || item.target_roles.includes("VOLUNTEERS")))
        .map((item) => ({ id: item.id, title: item.title, content: item.content, created_at: item.created_at })));
      setLoading(false);
    };
    void load().catch((cause) => {
      console.error("Erro inesperado no painel de voluntariado:", cause);
      if (active) { setError(true); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  return (
    <ModernLayout>
      <ModernSidebar items={sidebarItems} />
      <div className="lg:ml-64">
        <ModernTopBar title="Área do Voluntário" user={user ? { name: user.full_name || "Voluntário", email: user.email || "" } : undefined} />
        <div className="p-6 space-y-6">
          <ModernPageHeader
            title={`Olá, ${user?.full_name || "voluntário"}!`}
            description="Acompanhe eventos e comunicados direcionados à equipe de voluntariado."
            icon={<HeartHandshake />}
          />
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              Algumas informações não puderam ser carregadas. Não exibimos dados de demonstração.
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModernCard className="p-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Próximos eventos</h2>
              {loading ? <p className="text-sm text-muted-foreground">Carregando eventos...</p> : events.length === 0 ? (
                <ModernEmptyState icon={<Calendar />} title="Nenhum evento futuro" description="Não há eventos disponíveis para consulta." />
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="rounded-lg border border-border p-4">
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{new Date(event.start_datetime).toLocaleString("pt-BR")}</p>
                      {event.location && <p className="mt-1 text-xs text-muted-foreground">{event.location}</p>}
                      {event.description && <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </ModernCard>
            <ModernCard className="p-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Comunicados</h2>
              {loading ? <p className="text-sm text-muted-foreground">Carregando comunicados...</p> : announcements.length === 0 ? (
                <ModernEmptyState icon={<Bell />} title="Nenhum comunicado" description="Não há comunicados publicados para voluntários." />
              ) : (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="rounded-lg border border-border p-4">
                      <p className="font-medium text-foreground">{announcement.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{announcement.content}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{new Date(announcement.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                  ))}
                </div>
              )}
            </ModernCard>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}
