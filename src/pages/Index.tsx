import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth, roleHome } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import heroImg from "@/assets/hero-education.jpg";
import { useReveal } from "@/hooks/use-reveal";
import {
  Megaphone, CalendarDays, Bell, Newspaper, Users, GraduationCap,
  Smartphone, Download, Share, Plus, MoreVertical, Apple, MonitorSmartphone,
  Wifi, Zap, Shield, Heart, ArrowRight, CheckCircle2, Sparkles,
  Laptop, HandHeart, Phone, Mail, MapPin, Globe,
  Scale, Sprout, Music, Baby, UserPlus, Gift, ShoppingBag, Receipt,
  Quote, Building2, Target, Eye, Compass,
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
  useReveal();

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
    { icon: Users, title: "Multi-perfil", desc: "Áreas dedicadas para Admin, Professor, Aluno e Responsável." },
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

  const projects = [
    { icon: Users, title: "SCFV", subtitle: "Serviço de Convivência e Fortalecimento de Vínculos",
      desc: "Atividades educativas, culturais e esportivas que promovem desenvolvimento social e convivência comunitária." },
    { icon: Scale, title: "Projeto Interconexão", subtitle: "Medidas socioeducativas",
      desc: "Atendimento a jovens em medidas socioeducativas, com foco em reintegração social e capacitação profissional." },
    { icon: HandHeart, title: "Famílias Fortes", subtitle: "Prevenção e fortalecimento",
      desc: "Programa de fortalecimento de vínculos familiares e prevenção ao uso abusivo de drogas." },
    { icon: Music, title: "Telhado Cultural", subtitle: "Arte e convivência",
      desc: "Espaço de convivência e expressão artística aberto à comunidade do entorno." },
    { icon: Laptop, title: "Computer Clubhouse", subtitle: "Inclusão digital",
      desc: "Formação tecnológica e criativa para jovens em situação de vulnerabilidade social." },
    { icon: Sprout, title: "Meio Ambiente", subtitle: "Sustentabilidade",
      desc: "Ações de educação ambiental e desenvolvimento sustentável junto à comunidade." },
  ];

  const values = [
    { icon: Heart, label: "Cultura de paz" },
    { icon: UserPlus, label: "Dignidade humana" },
    { icon: HandHeart, label: "Solidariedade" },
    { icon: Users, label: "Inclusão social" },
    { icon: Sparkles, label: "Respeito à vida" },
    { icon: Scale, label: "Justiça social" },
  ];

  const audiences = [
    { icon: Baby, title: "Crianças & Adolescentes", desc: "Atividades educativas, culturais e esportivas em contraturno escolar." },
    { icon: GraduationCap, title: "Professores & Educadores", desc: "Ferramentas para chamada, comunicação com famílias e organização das turmas." },
    { icon: Heart, title: "Famílias & Responsáveis", desc: "Acompanhamento próximo da rotina, recados e participação nos eventos." },
    { icon: HandHeart, title: "Voluntários & Apoiadores", desc: "Visibilidade dos projetos, agenda de ações e como contribuir." },
  ];

  const supportWays = [
    { icon: Gift, title: "Doações financeiras", desc: "Contribuições pontuais ou recorrentes que sustentam os projetos." },
    { icon: ShoppingBag, title: "Alimentos e roupas", desc: "Doações que chegam diretamente às famílias atendidas." },
    { icon: HandHeart, title: "Voluntariado", desc: "Doe seu tempo e talento para oficinas, eventos e atendimentos." },
    { icon: Receipt, title: "Notas fiscais", desc: "Cadastre seu CNPJ ao pedir nota e converta em apoio à ONG." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-background/85 border-b border-border/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-fade-in">
            <Logo size="sm" />
            <span className="font-semibold text-sm hidden sm:inline">Associação Camila</span>
          </div>
          <nav className="flex items-center gap-2">
            <a href="#sobre" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground px-3">A ONG</a>
            <a href="#projetos" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground px-3">Projetos</a>
            <a href="#app" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground px-3">App</a>
            <a href="#apoiar" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground px-3">Apoiar</a>
            <a href="#contato" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground px-3">Contato</a>
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
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-secondary/30 blur-3xl animate-blob [animation-delay:-6s]" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-tertiary/20 blur-3xl animate-blob [animation-delay:-3s]" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10 grid md:grid-cols-2 gap-10 items-center text-primary-foreground">
          <div className="animate-fade-in-up">
            <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur border-0 animate-scale-in">
              <Heart className="h-3 w-3 mr-1" /> Em defesa e valorização da vida
            </Badge>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-balance animate-fade-in-up [animation-delay:120ms]">
              Transformando luto em ação social <span className="text-white/90">desde 2001.</span>
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/95 max-w-xl animate-fade-in-up [animation-delay:240ms]">
              A Associação Camila atua em Osasco-SP promovendo direitos sociais, cultura de paz e fortalecimento de vínculos familiares.
              Este é o app oficial que conecta a ONG, suas crianças, famílias, educadores e voluntários — em um único lugar.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 max-w-md animate-fade-in-up [animation-delay:360ms]">
              {[
                { v: "+24", l: "anos de história" },
                { v: "5+", l: "projetos ativos" },
                { v: "7", l: "áreas de atuação" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-white/10 backdrop-blur p-3 text-center border border-white/15 hover-lift">
                  <p className="text-2xl font-bold">{s.v}</p>
                  <p className="text-[11px] text-white/85 mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up [animation-delay:480ms]">
              <Button
                size="lg"
                onClick={handleInstall}
                className="bg-white text-primary hover:bg-white/95 shadow-floating font-semibold h-12 hover-scale"
              >
                <Download className="h-5 w-5 mr-2" />
                {installed ? "App instalado ✓" : "Baixar app (PWA)"}
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white h-12">
                <Link to="/login">Acessar minha conta</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-primary-foreground/90 animate-fade-in-up [animation-delay:600ms]">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Funciona offline</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Sem loja de aplicativos</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Atualização automática</span>
            </div>
          </div>

          <div className="relative animate-scale-in [animation-delay:200ms]">
            <div className="absolute inset-0 bg-white/10 rounded-3xl blur-2xl animate-float" />
            <img
              src={heroImg}
              alt="Educação transformando vidas"
              className="relative rounded-3xl shadow-floating bg-white/95 p-2 w-full animate-float"
            />
          </div>
        </div>
      </section>

      {/* Sobre / História */}
      <section id="sobre" className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="reveal">
            <Badge variant="secondary" className="mb-3"><Building2 className="h-3 w-3 mr-1" /> Quem somos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Uma história que nasceu da dor e virou esperança</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Em 1997, a família de <strong>Camila</strong> — vítima de violência — decidiu transformar o luto em
              ação social pela cultura de paz. Em <strong>2001</strong>, nasce oficialmente a Associação Camila em
              Defesa e Valorização da Vida, em Osasco/SP.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Hoje, a ONG atua junto a crianças, adolescentes, jovens, adultos, idosos e famílias em situação de
              vulnerabilidade social — combinando educação, arte, esporte, inclusão digital e fortalecimento de
              vínculos familiares e comunitários.
            </p>
            <Card className="mt-6 p-5 border-l-4 border-l-secondary bg-muted/30">
              <Quote className="h-5 w-5 text-secondary mb-2" />
              <p className="text-sm italic text-foreground/90">
                "A escuta ativa da comunidade e a educação como ferramenta de transformação são o coração do nosso trabalho."
              </p>
            </Card>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-5 reveal hover-lift">
              <div className="h-10 w-10 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center mb-3">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Missão</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Promover a defesa dos direitos sociais de crianças, adolescentes e idosos, fortalecendo vínculos
                familiares, incentivando a cultura de paz e a justiça social.
              </p>
            </Card>
            <Card className="p-5 reveal hover-lift" style={{ transitionDelay: "80ms" }}>
              <div className="h-10 w-10 rounded-xl gradient-warm text-secondary-foreground flex items-center justify-center mb-3">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Visão</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Ser referência na promoção da inclusão social, influenciando políticas públicas para uma sociedade
                mais justa, igualitária e sustentável.
              </p>
            </Card>
            <Card className="p-5 sm:col-span-2 reveal hover-lift" style={{ transitionDelay: "160ms" }}>
              <div className="h-10 w-10 rounded-xl bg-tertiary text-tertiary-foreground flex items-center justify-center mb-3">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Nossos valores</h3>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {values.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm transition-smooth hover:translate-x-1 hover:text-primary">
                    <Icon className="h-4 w-4 text-primary shrink-0" /> {label}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Projetos */}
      <section id="projetos" className="bg-muted/40 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 reveal">
            <Badge variant="secondary" className="mb-3"><Sparkles className="h-3 w-3 mr-1" /> O que fazemos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Projetos que transformam territórios</h2>
            <p className="mt-3 text-muted-foreground">
              Atuamos em educação, cultura, inclusão digital, direitos humanos e meio ambiente — sempre com
              metodologia centrada na escuta da comunidade.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p, i) => {
              const Icon = p.icon;
              return (
                <Card key={p.title} className="p-6 border-border/60 group reveal hover-lift" style={{ transitionDelay: `${i * 70}ms` }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground mb-4 group-hover:scale-110 transition-smooth">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg leading-tight">{p.title}</h3>
                  <p className="text-xs text-secondary font-medium mt-0.5">{p.subtitle}</p>
                  <p className="text-sm text-muted-foreground mt-3">{p.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12 reveal">
          <Badge variant="secondary" className="mb-3"><Users className="h-3 w-3 mr-1" /> Para todos os perfis</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Um app que serve a toda a comunidade</h2>
          <p className="mt-3 text-muted-foreground">
            Cada perfil tem sua experiência dedicada — útil tanto para a ONG quanto para quem ela atende e para quem ajuda.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {audiences.map((a, i) => {
            const Icon = a.icon;
            return (
              <Card key={a.title} className="p-6 text-center reveal hover-lift group" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="h-14 w-14 rounded-2xl gradient-warm text-secondary-foreground flex items-center justify-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold">{a.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{a.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* App features */}
      <section id="app" className="bg-muted/40 py-16 md:py-24">
        <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 reveal">
          <Badge variant="secondary" className="mb-3"><Smartphone className="h-3 w-3 mr-1" /> Recursos do app</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Tudo da rotina da ONG em um só lugar</h2>
          <p className="mt-3 text-muted-foreground">
            Substitua planilhas, grupos de WhatsApp e bilhetes em papel por um espaço organizado, seguro e fácil de usar.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="p-6 border-border/60 reveal hover-lift group" style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
              </Card>
            );
          })}
        </div>
        </div>
      </section>

      {/* How to use */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 reveal">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Comece em 3 passos</h2>
            <p className="mt-3 text-muted-foreground">Em três passos simples sua ONG já está conectada.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { n: "1", title: "Instale no celular", desc: "Baixe como PWA direto pelo navegador. Sem App Store, sem espera." },
              { n: "2", title: "Faça login", desc: "Cada usuário acessa sua área: administração, professor, aluna ou responsável." },
              { n: "3", title: "Comunique e acompanhe", desc: "Envie avisos, registre eventos, crie lembretes e veja tudo em tempo real." },
            ].map((s, i) => (
              <Card key={s.n} className="p-6 relative reveal hover-lift" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="absolute -top-4 left-6 h-9 w-9 rounded-full gradient-primary text-primary-foreground flex items-center justify-center font-bold shadow-md animate-float" style={{ animationDelay: `${i * 0.4}s` }}>{s.n}</div>
                <h3 className="font-semibold mt-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Install / PWA */}
      <section id="instalar" className="bg-muted/40 py-16 md:py-24">
        <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="reveal">
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
              {[
                { Icon: Wifi, label: "Offline", color: "text-primary" },
                { Icon: Zap, label: "Rápido", color: "text-secondary" },
                { Icon: Shield, label: "Seguro (HTTPS)", color: "text-tertiary" },
              ].map(({ Icon, label, color }) => (
                <div key={label} className="text-center p-4 rounded-xl bg-background hover-lift">
                  <Icon className={`h-5 w-5 mx-auto ${color}`} />
                  <p className="text-xs mt-2 font-medium">{label}</p>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={handleInstall}
              className="mt-6 gradient-primary text-primary-foreground shadow-elevated h-12 px-6 hover-scale"
            >
              <Download className="h-5 w-5 mr-2" />
              {installed ? "App já instalado ✓" : deferred ? "Instalar agora" : "Ver instruções"}
            </Button>
          </div>

          <div className="space-y-4">
            <Card className="p-5 reveal hover-lift">
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

            <Card className="p-5 reveal hover-lift" style={{ transitionDelay: "100ms" }}>
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
        </div>
      </section>

      {/* Como apoiar */}
      <section id="apoiar" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12 reveal">
          <Badge className="bg-coral/15 text-coral border-coral/30 mb-3">
            <HandHeart className="h-3 w-3 mr-1" /> Faça parte
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Como você pode apoiar</h2>
          <p className="mt-3 text-muted-foreground">
            Toda contribuição — em dinheiro, tempo ou recursos — fortalece quem mais precisa.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {supportWays.map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={s.title} className="p-6 border-t-4 border-t-secondary reveal hover-lift group" style={{ transitionDelay: `${i * 80}ms` }}>
                <Icon className="h-8 w-8 text-secondary mb-3 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6" />
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
              </Card>
            );
          })}
        </div>
        <div className="mt-8 text-center reveal">
          <Button asChild size="lg" className="gradient-warm text-secondary-foreground h-12 hover-scale">
            <a href="https://www.associacaocamila.org.br/" target="_blank" rel="noopener noreferrer">
              <Globe className="h-5 w-5 mr-2" /> Ir para o site oficial
            </a>
          </Button>
        </div>
      </section>

      {/* Tech stack */}
      <section id="tecnologias" className="bg-foreground/[0.02] py-16 md:py-24 border-y border-border/60">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10 reveal">
            <Badge variant="secondary" className="mb-3">Construído com excelência</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Tecnologias por trás do app</h2>
            <p className="mt-3 text-muted-foreground">
              Construído com as melhores tecnologias do mercado para garantir performance, segurança e escalabilidade.
              Hospedado na <strong>Vercel</strong>, com entrega global e HTTPS automático.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {techs.map((t, i) => (
              <Card key={t.name} className="p-4 text-center reveal hover-lift" style={{ transitionDelay: `${i * 50}ms` }}>
                <p className="font-bold text-primary">{t.name}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{t.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="reveal">
            <Badge variant="secondary" className="mb-3"><Phone className="h-3 w-3 mr-1" /> Fale conosco</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Vamos conversar</h2>
            <p className="mt-3 text-muted-foreground">
              A Associação Camila está em Osasco-SP desde 2001. Entre em contato para conhecer os projetos,
              propor parcerias ou se voluntariar.
            </p>
            <div className="mt-6 space-y-3">
              <a href="tel:+551135920330" className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted transition-smooth hover:translate-x-1 group">
                <div className="h-10 w-10 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center"><Phone className="h-4 w-4" /></div>
                <div><p className="text-xs text-muted-foreground">Telefone</p><p className="font-medium">+55 11 3592-0330</p></div>
              </a>
              <a href="mailto:contato@associacaocamila.org.br" className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted transition-smooth hover:translate-x-1">
                <div className="h-10 w-10 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center"><Mail className="h-4 w-4" /></div>
                <div><p className="text-xs text-muted-foreground">E-mail</p><p className="font-medium">contato@associacaocamila.org.br</p></div>
              </a>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60">
                <div className="h-10 w-10 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center"><MapPin className="h-4 w-4" /></div>
                <div><p className="text-xs text-muted-foreground">Endereço</p><p className="font-medium">Av. Clóvis Assaf, 455 — Osasco/SP</p></div>
              </div>
              <a href="https://www.associacaocamila.org.br/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted transition-smooth hover:translate-x-1">
                <div className="h-10 w-10 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center"><Globe className="h-4 w-4" /></div>
                <div><p className="text-xs text-muted-foreground">Site</p><p className="font-medium">associacaocamila.org.br</p></div>
              </a>
            </div>
          </div>

          <Card className="p-8 gradient-primary text-primary-foreground border-0 shadow-floating reveal relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-blob" />
            <Heart className="h-10 w-10 mb-4 animate-float" />
            <h3 className="text-2xl font-bold">Pronto para fazer parte?</h3>
            <p className="mt-3 text-primary-foreground/90">
              Instale o app e comece a usar agora. Educadores, famílias, voluntários e a equipe da ONG —
              todos conectados em um só lugar.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 relative">
              <Button size="lg" onClick={handleInstall} className="bg-white text-primary hover:bg-white/95 h-12 hover-scale">
                <Download className="h-5 w-5 mr-2" /> Baixar app
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white h-12">
                <Link to="/login">Entrar <ArrowRight className="h-5 w-5 ml-2" /></Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA final */}
      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/30 py-10">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <Logo size="sm" />
            <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
              Associação Camila em Defesa e Valorização da Vida — fundada em 2001, em Osasco/SP.
              Em defesa da vida, da paz e da dignidade humana.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2">Navegação</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li><a href="#sobre" className="hover:text-foreground">Quem somos</a></li>
              <li><a href="#projetos" className="hover:text-foreground">Projetos</a></li>
              <li><a href="#apoiar" className="hover:text-foreground">Como apoiar</a></li>
              <li><a href="#contato" className="hover:text-foreground">Contato</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Acesso</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li><Link to="/login" className="hover:text-foreground">Entrar no app</Link></li>
              <li><Link to="/blog" className="hover:text-foreground">Blog institucional</Link></li>
              <li><a href="#instalar" className="hover:text-foreground">Instalar como PWA</a></li>
              <li><a href="https://www.associacaocamila.org.br/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Site oficial</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-6 border-t border-border/60 text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Associação Camila — Em defesa e valorização da vida.
        </div>
      </footer>
    </div>
  );
}
