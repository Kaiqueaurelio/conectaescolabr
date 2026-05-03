import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth, roleHome } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import heroImg from "@/assets/hero-education.jpg";
import {
  Megaphone, CalendarDays, Bell, Newspaper, Users, GraduationCap,
  Smartphone, Download, Share, Plus, MoreVertical, Apple, MonitorSmartphone,
  Wifi, Zap, Shield, Heart, ArrowRight, CheckCircle2, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Landing() {
  const { user } = useAuth();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBIP = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      const res = await deferred.userChoice;
      if (res.outcome === "accepted") toast.success("App instalado com sucesso!");
      setDeferred(null);
    } else {
      document.getElementById("instalar")?.scrollIntoView({ behavior: "smooth" });
      toast.info("Veja abaixo como instalar no seu dispositivo.");
    }
  };

  const features = [
    { icon: Megaphone, title: "Comunicados", desc: "Avisos da coordenação direto para professores, alunas e responsáveis." },
    { icon: CalendarDays, title: "Agenda integrada", desc: "Aulas, reuniões e eventos da ONG em um calendário único." },
    { icon: Bell, title: "Lembretes inteligentes", desc: "Tarefas com prioridade e alerta automático para itens atrasados." },
    { icon: GraduationCap, title: "Gestão de turmas", desc: "Cadastro de alunas, vínculo com responsáveis e acompanhamento." },
    { icon: Newspaper, title: "Blog institucional", desc: "Histórias, resultados e impacto social publicados em poucos cliques." },
    { icon: Users, function: "Multi-perfil", title: "Multi-perfil", desc: "Áreas dedicadas para Admin, Professor, Aluno e Responsável." },
  ];

  const techs = [
    { name: "React 18", desc: "Interface reativa moderna" },
    { name: "TypeScript", desc: "Código tipado e seguro" },
    { name: "Vite", desc: "Build ultra-rápido" },
    { name: "Tailwind CSS", desc: "Design system consistente" },
    { name: "shadcn/ui", desc: "Componentes acessíveis" },
    { name: "PWA", desc: "Instalável no celular" },
    { name: "Vercel", desc: "Hospedagem global" },
    { name: "Lovable Cloud", desc: "Backend escalável" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-background/85 border-b border-border/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-semibold text-sm hidden sm:inline">Associação Camila</span>
          </div>
          <nav className="flex items-center gap-2">
            <a href="#recursos" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground px-3">Recursos</a>
            <a href="#instalar" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground px-3">Instalar</a>
            <a href="#tecnologias" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground px-3">Tecnologias</a>
            {user ? (
              <Button asChild size="sm" className="gradient-primary text-primary-foreground">
                <Link to={roleHome(user.role)}>Ir para o app <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline">
                <Link to="/login">Entrar</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand opacity-95" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-secondary/30 blur-3xl" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10 grid md:grid-cols-2 gap-10 items-center text-primary-foreground">
          <div>
            <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur border-0">
              <Heart className="h-3 w-3 mr-1" /> Em defesa e valorização da vida
            </Badge>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-balance">
              A plataforma que conecta a Associação Camila à sua comunidade.
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/95 max-w-xl">
              Comunicação, agenda, lembretes e acompanhamento educacional reunidos em um único app — feito para educadores, crianças e famílias.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={handleInstall}
                className="bg-white text-primary hover:bg-white/95 shadow-floating font-semibold h-12"
              >
                <Download className="h-5 w-5 mr-2" />
                {installed ? "App instalado ✓" : "Baixar app (PWA)"}
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white h-12">
                <Link to="/login">Acessar minha conta</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-primary-foreground/90">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Funciona offline</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Sem loja de aplicativos</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Atualização automática</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-white/10 rounded-3xl blur-2xl" />
            <img
              src={heroImg}
              alt="Educação transformando vidas"
              className="relative rounded-3xl shadow-floating bg-white/95 p-2 w-full"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-3"><Sparkles className="h-3 w-3 mr-1" /> Tudo em um só app</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Para que serve o app</h2>
          <p className="mt-3 text-muted-foreground">
            Substitua planilhas, grupos de WhatsApp e bilhetes em papel por um espaço organizado, seguro e fácil de usar.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="p-6 hover:shadow-md transition-smooth border-border/60">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How to use */}
      <section className="bg-muted/40 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Como usar o app</h2>
            <p className="mt-3 text-muted-foreground">Em três passos simples sua ONG já está conectada.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { n: "1", title: "Instale no celular", desc: "Baixe como PWA direto pelo navegador. Sem App Store, sem espera." },
              { n: "2", title: "Faça login", desc: "Cada usuário acessa sua área: administração, professor, aluna ou responsável." },
              { n: "3", title: "Comunique e acompanhe", desc: "Envie avisos, registre eventos, crie lembretes e veja tudo em tempo real." },
            ].map((s) => (
              <Card key={s.n} className="p-6 relative">
                <div className="absolute -top-4 left-6 h-9 w-9 rounded-full gradient-primary text-primary-foreground flex items-center justify-center font-bold shadow-md">{s.n}</div>
                <h3 className="font-semibold mt-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Install / PWA */}
      <section id="instalar" className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <Badge className="bg-secondary/15 text-secondary border-secondary/30">
              <Smartphone className="h-3 w-3 mr-1" /> PWA — Progressive Web App
            </Badge>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Instale o app no seu celular</h2>
            <p className="mt-4 text-muted-foreground">
              Um <strong>PWA</strong> é um aplicativo que você instala direto pelo navegador, sem passar por loja
              de apps. Ele cria um ícone na tela inicial, abre em tela cheia (igual a um app comum), funciona
              mesmo com internet ruim e atualiza sozinho — tudo isso ocupando muito menos espaço no celular.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="text-center p-4 rounded-xl bg-muted">
                <Wifi className="h-5 w-5 mx-auto text-primary" />
                <p className="text-xs mt-2 font-medium">Offline</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted">
                <Zap className="h-5 w-5 mx-auto text-secondary" />
                <p className="text-xs mt-2 font-medium">Rápido</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted">
                <Shield className="h-5 w-5 mx-auto text-tertiary" />
                <p className="text-xs mt-2 font-medium">Seguro (HTTPS)</p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleInstall}
              className="mt-6 gradient-primary text-primary-foreground shadow-elevated h-12 px-6"
            >
              <Download className="h-5 w-5 mr-2" />
              {installed ? "App já instalado ✓" : deferred ? "Instalar agora" : "Ver instruções"}
            </Button>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Apple className="h-5 w-5" />
                <h3 className="font-semibold">iPhone / iPad (Safari)</h3>
              </div>
              <ol className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex gap-3"><span className="font-bold text-foreground">1.</span> Abra o app pelo <strong>Safari</strong>.</li>
                <li className="flex gap-3"><span className="font-bold text-foreground">2.</span> Toque no botão de <Share className="h-4 w-4 inline mx-1" /> <strong>Compartilhar</strong> (parte inferior).</li>
                <li className="flex gap-3"><span className="font-bold text-foreground">3.</span> Escolha <Plus className="h-4 w-4 inline mx-1" /> <strong>Adicionar à Tela de Início</strong>.</li>
                <li className="flex gap-3"><span className="font-bold text-foreground">4.</span> Toque em <strong>Adicionar</strong>. Pronto, o ícone aparece na sua tela.</li>
              </ol>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <MonitorSmartphone className="h-5 w-5" />
                <h3 className="font-semibold">Android (Chrome)</h3>
              </div>
              <ol className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex gap-3"><span className="font-bold text-foreground">1.</span> Abra o app pelo <strong>Chrome</strong>.</li>
                <li className="flex gap-3"><span className="font-bold text-foreground">2.</span> Toque em <MoreVertical className="h-4 w-4 inline mx-1" /> (menu, canto superior direito).</li>
                <li className="flex gap-3"><span className="font-bold text-foreground">3.</span> Selecione <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
                <li className="flex gap-3"><span className="font-bold text-foreground">4.</span> Confirme. O app abre como nativo.</li>
              </ol>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section id="tecnologias" className="bg-muted/40 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="secondary" className="mb-3">Construído com excelência</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Tecnologias do app</h2>
            <p className="mt-3 text-muted-foreground">
              Este app foi construído usando as melhores tecnologias do mercado, garantindo performance,
              segurança e escalabilidade. Hospedado na <strong>Vercel</strong>, com entrega global e HTTPS automático.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {techs.map((t) => (
              <Card key={t.name} className="p-4 text-center hover:shadow-md transition-smooth">
                <p className="font-bold text-primary">{t.name}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{t.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Pronto para começar?</h2>
          <p className="mt-3 text-muted-foreground">
            Instale o app, faça login e leve a Associação Camila para a palma da mão de cada família.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button size="lg" onClick={handleInstall} className="gradient-primary text-primary-foreground h-12">
              <Download className="h-5 w-5 mr-2" /> Baixar como app
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12">
              <Link to="/login">Entrar agora <ArrowRight className="h-5 w-5 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span>© {new Date().getFullYear()} Associação Camila — Em defesa e valorização da vida.</span>
          </div>
          <div className="flex gap-4">
            <Link to="/blog" className="hover:text-foreground">Blog</Link>
            <Link to="/login" className="hover:text-foreground">Entrar</Link>
            <a href="#instalar" className="hover:text-foreground">Instalar</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
