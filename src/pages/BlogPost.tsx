import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { blogPosts } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <AppLayout>
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</Button>
        <p className="mt-8 text-center text-muted-foreground">Artigo não encontrado.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>
      <article>
        <div className="aspect-[16/9] overflow-hidden rounded-2xl mb-6 shadow-soft">
          <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-balance leading-tight">{post.title}</h1>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {post.author}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(post.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
        </div>
        <p className="mt-6 text-base leading-relaxed text-foreground/90 whitespace-pre-line">{post.content}</p>
      </article>
    </AppLayout>
  );
}