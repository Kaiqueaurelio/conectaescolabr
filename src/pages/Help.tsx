import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Globe, MessageCircle, BookOpen, Send } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const faqs = [
  { q: "Como faço para registrar a chamada?", a: "Acesse 'Fazer Chamada' no menu, escolha a turma e a data, marque cada aluna como Presente, Falta ou Justificada e toque em Salvar Chamada. Os registros ficam salvos e contam para a frequência da aluna." },
  { q: "Como envio um comunicado?", a: "Em 'Comunicados', toque no botão + (canto superior direito) — disponível para professores e administração. Escolha o público (todos, responsáveis, alunos ou professores) e publique." },
  { q: "Onde vejo a frequência do meu filho?", a: "No painel do responsável a frequência aparece automaticamente assim que a professora registra a chamada. Você também pode acompanhar comunicados e próximos eventos." },
  { q: "Esqueci minha senha, e agora?", a: "Entre em contato com a coordenação pelo telefone ou e-mail abaixo. Em breve teremos redefinição automática." },
  { q: "O app funciona offline?", a: "Sim — depois de aberto pela primeira vez, o app pode ser instalado no celular (Adicionar à tela inicial) e continua funcionando offline para visualizar conteúdo já carregado." },
  { q: "Como uso o app no celular?", a: "Abra o link no Chrome (Android) ou Safari (iPhone), toque em Compartilhar → Adicionar à Tela Inicial. Pronto, o app fica como ícone normal." },
];

export default function Help() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) return toast.error("Escreva uma mensagem com pelo menos 10 caracteres.");
    const subject = encodeURIComponent(`[Suporte App] Mensagem de ${name || "usuário"}`);
    const body = encodeURIComponent(`${message}\n\n—\n${name}\n${email}`);
    window.location.href = `mailto:contato@associacaocamila.org.br?subject=${subject}&body=${body}`;
    toast.success("Abrindo seu app de e-mail...");
  };

  return (
    <AppLayout>
      <PageHeader title="Ajuda e Suporte" subtitle="Encontre respostas rápidas ou fale com a gente" />

      <Card className="p-5 mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-3"><BookOpen className="h-4 w-4 text-primary" /> Perguntas frequentes</h2>
        <Accordion type="single" collapsible>
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`}>
              <AccordionTrigger className="text-sm text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      <Card className="p-5 mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-3"><MessageCircle className="h-4 w-4 text-secondary" /> Fale com a coordenação</h2>
        <form onSubmit={send} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" /></div>
            <div><Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" /></div>
          </div>
          <div><Label>Mensagem</Label><Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Como podemos ajudar?" /></div>
          <Button type="submit" className="gradient-primary text-primary-foreground"><Send className="h-4 w-4 mr-2" /> Enviar</Button>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold mb-3">Contatos diretos</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +55 11 3592-0330</li>
          <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> contato@associacaocamila.org.br</li>
          <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> <a className="hover:underline" href="https://www.associacaocamila.org.br/" target="_blank" rel="noreferrer">associacaocamila.org.br</a></li>
          <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Osasco — SP</li>
        </ul>
      </Card>
    </AppLayout>
  );
}