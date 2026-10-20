import { useState, useMemo, useEffect, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Megaphone, Plus, RefreshCw, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import EmptyState from "@/components/EmptyState";
import { toast } from "sonner";
import SearchBar from "@/components/admin/SearchBar";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  author: string;
  target_roles: string[];
  created_at: string;
}

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [q, setQ] = useState("");

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("id,title,content,author_id,target_roles,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar comunicados:", error);
      setAnnouncements([]);
      setLoadError(true);
      setLoading(false);
      return false;
    }

    const authorIds = [...new Set((data ?? []).map((item) => item.author_id).filter(Boolean))];
    let authors = new Map<string, string>();
    if (authorIds.length > 0) {
      const result = await supabase.from("users").select("id,full_name").in("id", authorIds);
      if (!result.error) authors = new Map((result.data ?? []).map((author) => [author.id, author.full_name]));
    }

    setAnnouncements((data ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      author: authors.get(item.author_id) || "Equipe",
      target_roles: item.target_roles ?? [],
      created_at: item.created_at,
    })));
    setLoadError(false);
    setLoading(false);
    return true;
  }, []);

  useEffect(() => {
    void loadAnnouncements().catch((error) => {
      console.error("Falha inesperada ao carregar comunicados:", error);
      setAnnouncements([]);
      setLoadError(true);
      setLoading(false);
    });
  }, [loadAnnouncements]);

  const audience = useMemo(() => announcements.filter((announcement) => {
    const targets = announcement.target_roles;
    if (targets.includes("ALL")) return true;
    if (user?.role === "TEACHER" || user?.role === "ADMIN") return targets.includes("TEACHERS");
    if (user?.role === "PARENT") return targets.includes("PARENTS");
    if (user?.role === "STUDENT") return targets.includes("STUDENTS");
    return false;
  }), [announcements, user?.role]);
  const visible = useMemo(() => audience.filter((announcement) =>
    !q || `${announcement.title} ${announcement.content}`.toLowerCase().includes(q.toLowerCase())
  ), [audience, q]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const success = await loadAnnouncements();
      if (success) toast.success("Comunicados atualizados a partir do banco.");
      else toast.error("Não foi possível atualizar os comunicados.");
    } catch (error) {
      console.error("Falha inesperada ao atualizar comunicados:", error);
      toast.error("Não foi possível atualizar os comunicados.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Comunicados"
        subtitle="Avisos e novidades da ONG"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={refresh} disabled={refreshing}>
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            {(user?.role === "TEACHER" || user?.role === "ADMIN") && (
              <Link to="/comunicados/novo">
                <Button size="icon" className="gradient-primary text-primary-foreground"><Plus className="h-4 w-4" /></Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="mb-4">
        <SearchBar value={q} onChange={setQ} placeholder="Buscar comunicados..." total={audience.length} filtered={visible.length} onClear={() => setQ("")} />
      </div>

      {loadError ? (
        <EmptyState icon={Megaphone} title="Comunicados indisponíveis" description="Não foi possível consultar os comunicados no banco. Tente atualizar novamente." />
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </Card>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nenhum comunicado no momento." description="Quando houver novidades, elas aparecerão aqui." />
      ) : (
        <div className="space-y-3">
          {visible.map((a) => (
            <Card key={a.id} className="p-4 hover:shadow-soft transition-smooth">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary flex-shrink-0">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight">{a.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-medium">{a.author}</span>
                    <span>•</span>
                    <span>{new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}