import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { blogPosts } from "@/lib/mockData";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

export default function Blog() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);

  return (
    <AppLayout>
      <PageHeader title="Blog da ONG" subtitle="Histórias, conquistas e novidades" />
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {blogPosts.map((p) => (
            <Link key={p.id} to={`/blog/${p.id}`}>
              <Card className="overflow-hidden hover:shadow-elevated transition-smooth h-full group">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img src={p.cover_image} alt={p.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-smooth" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold leading-tight line-clamp-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.excerpt}</p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(p.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
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