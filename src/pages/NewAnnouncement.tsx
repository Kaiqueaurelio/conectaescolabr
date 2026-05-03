import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { z } from "zod";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  title: z.string().trim().min(3, "Título deve ter ao menos 3 caracteres").max(100, "Título muito longo"),
  content: z.string().trim().min(10, "Conteúdo deve ter ao menos 10 caracteres").max(1000, "Conteúdo muito longo"),
  target: z.enum(["ALL", "TEACHERS", "PARENTS", "STUDENTS"]),
});

export default function NewAnnouncement() {
  const navigate = useNavigate();
  const { addAnnouncement } = useData();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState<"ALL" | "TEACHERS" | "PARENTS" | "STUDENTS">("ALL");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ title, content, target });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    addAnnouncement({ title: title.trim(), content: content.trim(), target, author: user?.name || "Equipe" });
    setSubmitting(false);
    toast.success("Comunicado publicado com sucesso!");
    navigate("/comunicados");
  };

  return (
    <AppLayout>
      <PageHeader title="Novo Comunicado" subtitle="Compartilhe um aviso com a comunidade" />
      <Card className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Reunião de pais" maxLength={100} />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="target">Destinatários</Label>
            <Select value={target} onValueChange={(v) => setTarget(v as any)}>
              <SelectTrigger id="target"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PARENTS">Responsáveis</SelectItem>
                <SelectItem value="STUDENTS">Alunos</SelectItem>
                <SelectItem value="TEACHERS">Professores</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Escreva o conteúdo do comunicado..." maxLength={1000} />
            <p className="text-[11px] text-muted-foreground text-right">{content.length}/1000</p>
            {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" disabled={submitting} className="flex-1 gradient-primary text-primary-foreground">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-2" /> Publicar</>}
            </Button>
          </div>
        </form>
      </Card>
    </AppLayout>
  );
}