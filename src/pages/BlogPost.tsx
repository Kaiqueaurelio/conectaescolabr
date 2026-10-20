import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BlogArticle {
  id: string;
  title: string;
  cover_image_url?: string | null;
  content: string;
  author: string;
  published_at: string;
}

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let active = true;
    const loadPost = async () => {
      const { data, error: queryError } = await supabase
        .from("blog_posts")
        .select("id,title,cover_image_url,content,author_id,published_at")
        .eq("id", id)
        .maybeSingle();
      if (!active) return;
      if (queryError) {
        console.error("Erro ao carregar artigo:", queryError);
        setError(true);
        setPost(null);
        setLoading(false);
        return;
      }
      if (!data) {
        setPost(null);
        setLoading(false);
        return;
      }

      let author = "Equipe";
      if (data.author_id) {
        const authorResult = await supabase.from("users").select("full_name").eq("id", data.author_id).maybeSingle();
        if (!authorResult.error && authorResult.data?.full_name) author = authorResult.data.full_name;
      }
      if (!active) return;
      setPost({
        id: data.id,
        title: data.title,
        cover_image_url: data.cover_image_url,
        content: data.content,
        author,
        published_at: data.published_at,
      });
      setLoading(false);
    };
    void loadPost().catch((cause) => {
      console.error("Erro inesperado ao carregar artigo:", cause);
      if (active) { setError(true); setLoading(false); }
    });
    return () => { active = false; };
  }, [id]);

  return (
    <AppLayout>
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>
      {loading ? (
        <Card className="p-6 text-sm text-muted-foreground">Carregando publicação...</Card>
      ) : error ? (
        <Card className="p-6 flex items-start gap-3 text-sm text-muted-foreground">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          Não foi possível consultar esta publicação no banco.
        </Card>
      ) : !post ? (
        <p className="mt-8 text-center text-muted-foreground">Artigo não encontrado.</p>
      ) : (
        <article>
          {post.cover_image_url ? (
            <div className="aspect-[16/9] overflow-hidden rounded-2xl mb-6 shadow-soft">
              <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="mb-6 flex aspect-[16/9] items-center justify-center rounded-2xl bg-muted">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-balance leading-tight">{post.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(post.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
          </div>
          <p className="mt-6 text-base leading-relaxed text-foreground/90 whitespace-pre-line">{post.content}</p>
        </article>
      )}
    </AppLayout>
  );
}
