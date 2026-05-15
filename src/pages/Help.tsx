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
  { q: "Como registrar a chamada?", a: "Acesse 'Fazer Chamada' no menu, selecione a turma e a data, marque a situação de cada aluna (Presente, Falta ou Justificada) e toque em 'Salvar Chamada'. Os registros são salvos e computados para a frequência da aluna." },
  { q: "Como enviar um comunicado?", a: "Na seção 'Comunicados', toque no botão '+' (canto superior direito) — disponível para professores e administradores. Selecione o público-alvo (todos, responsáveis, alunos ou professores) e publique." },
  { q: "Onde visualizar a frequência do meu filho(a)?", a: "No painel do responsável, a frequência é atualizada automaticamente após o registro da chamada pela professora. Você também pode acompanhar comunicados e próximos eventos." },
  { q: "Esqueci minha senha, o que fazer?", a: "Entre em contato com a coordenação através do telefone ou e-mail fornecidos abaixo. Em breve, teremos uma opção de redefinição automática de senha." },
  { q: "O aplicativo funciona offline?", a: "Sim. Após o primeiro acesso, o aplicativo pode ser instalado no celular (opção 'Adicionar à tela inicial') e continuará funcionando offline para visualização de conteúdo já carregado." },
  { q: "Como instalar o aplicativo no celular?", a: "Abra o link no navegador (Chrome para Android ou Safari para iPhone), toque em 'Compartilhar' e selecione 'Adicionar à Tela Inicial'. O aplicativo será adicionado como um ícone na sua tela inicial." },
];

export default function Help() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) return toast.error("Por favor, escreva uma mensagem com pelo menos 10 caracteres.");
    const subject = encodeURIComponent(`[Suporte App] Mensagem de ${name || "usuário"}`);
    const body = encodeURIComponent(`${message}\n\n—\n${name}\n${email}`);
    window.location.href = `mailto:contato@associacaocamila.org.br?subject=${subject}&body=${body}`;
    toast.success("Abrindo seu aplicativo de e-mail...");
  };

  return (
    <AppLayout>
      <PageHeader title="Ajuda e Suporte" subtitle="Encontre respostas rápidas para suas dúvidas ou entre em contato conosco." />

      <Card className="p-5 mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-3"><BookOpen className="h-4 w-4 text-primary" /> Perguntas Frequentes</h2>
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
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-3"><MessageCircle className="h-4 w-4 text-secondary" /> Fale com a Coordenação</h2>
        <form onSubmit={send} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" /></div>
            <div><Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" /></div>
          </div>
          <div><Label>Mensagem</Label><Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Descreva como podemos ajudar." /></div>
          <Button type="submit" className="gradient-primary text-primary-foreground"><Send className="h-4 w-4 mr-2" /> Enviar Mensagem</Button>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold mb-3">Contatos Diretos</h2>
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