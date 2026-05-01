import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { announcements } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Plus, RefreshCw, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import EmptyState from "@/components/EmptyState";
import { toast } from "sonner";

export default function Announcements() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const visible = announcements.filter((a) => {
    if (a.target === "ALL") return true;
    if (user?.role === "TEACHER") return a.target === "TEACHERS";
    if (user?.role === "PARENT") return a.target === "PARENTS";
    if (user?.role === "STUDENT") return a.target === "STUDENTS";
    return true;
  });

  const refresh = async () => {
    setRefreshing(true);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
    setLoading(false);
    toast.success("Comunicados atualizados!");
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
            {user?.role === "TEACHER" && (
              <Link to="/comunicados/novo">
                <Button size="icon" className="gradient-primary text-primary-foreground"><Plus className="h-4 w-4" /></Button>
              </Link>
            )}
          </div>
        }
      />

      {loading ? (
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
                    {a.unread && <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary text-[10px] h-5">Novo</Badge>}
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