import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Calendar, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BlogListItem {
  id: string;
  title: string;
  cover_image_url?: string | null;
  excerpt?: string | null;
  published_at: string;
}

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const loadPosts = async () => {
      const { data, error: queryError } = await supabase
        .from("blog_posts")
        .select("id,title,cover_image_url,excerpt,published_at")
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false });
      if (!active) return;
      if (queryError) {
        console.error("Erro ao carregar blog:", queryError);
        setError(true);
        setBlogPosts([]);
      } else {
        setError(false);
        setBlogPosts((data ?? []) as BlogListItem[]);
      }
      setLoading(false);
    };
    void loadPosts().catch((cause) => {
      console.error("Erro inesperado ao carregar blog:", cause);
      if (active) { setError(true); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  return (
    <AppLayout>
      <PageHeader title="Blog da ONG" subtitle="Histórias, conquistas e novidades publicadas" />
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-1/2" /></div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-6 flex items-start gap-3 text-sm text-muted-foreground">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          Não foi possível consultar as publicações no banco. Tente novamente mais tarde.
        </Card>
      ) : blogPosts.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="mt-3 font-medium">Nenhuma publicação disponível</p>
          <p className="mt-1 text-sm text-muted-foreground">As publicações aparecerão aqui quando forem salvas no banco de dados.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`}>
              <Card className="overflow-hidden hover:shadow-elevated transition-smooth h-full group">
                <div className="aspect-[16/10] overflow-hidden bg-muted flex items-center justify-center">
                  {post.cover_image_url ? <img src={post.cover_image_url} alt={post.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-smooth" /> : <FileText className="h-10 w-10 text-muted-foreground" />}
                </div>
                <div className="p-4">
                  <h3 className="font-bold leading-tight line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt || "Sem resumo disponível."}</p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
