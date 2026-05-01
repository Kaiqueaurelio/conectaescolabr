import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, roleHome } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Heart, Loader2, Eye, EyeOff } from "lucide-react";
import heroImg from "@/assets/hero-education.jpg";

const demoAccounts = [
  { label: "Professor(a)", email: "professor@ong.org" },
  { label: "Aluno(a)", email: "aluno@ong.org" },
  { label: "Responsável", email: "responsavel@ong.org" },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate(roleHome(user.role), { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Informe o seu e-mail.");
    if (!password.trim()) return toast.error("Informe a sua senha.");
    setSubmitting(true);
    const { error } = await login(email.trim(), password);
    setSubmitting(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Bem-vindo(a) de volta!");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative gradient-hero items-center justify-center p-12">
        <div className="absolute inset-0 bg-foreground/10" />
        <div className="relative z-10 max-w-md text-primary-foreground">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Heart className="h-6 w-6" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold">ONG Educar+</h2>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-balance">
            Educação que transforma vidas todos os dias.
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/90">
            Conectando educadores, alunos e famílias em uma jornada de aprendizado e cuidado.
          </p>
          <img
            src={heroImg}
            alt="Crianças aprendendo juntas"
            width={1280}
            height={896}
            className="mt-8 rounded-2xl shadow-floating"
          />
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary shadow-elevated">
              <Heart className="h-6 w-6 text-primary-foreground" fill="currentColor" />
            </div>
            <h2 className="text-xl font-bold">ONG Educar+</h2>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Acesse sua conta</h1>
          <p className="mt-2 text-muted-foreground">
            Bem-vindo(a) de volta! Faça login para continuar.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full h-11 gradient-primary text-primary-foreground font-semibold shadow-elevated hover:opacity-95">
              {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</>) : "Entrar"}
            </Button>
          </form>

          <Card className="mt-8 p-4 bg-muted/40 border-dashed">
            <p className="text-xs font-semibold text-muted-foreground mb-2">CONTAS DE DEMONSTRAÇÃO</p>
            <div className="space-y-1.5">
              {demoAccounts.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword("demo123"); }}
                  className="w-full flex justify-between items-center text-left text-sm py-1.5 px-2 rounded-md hover:bg-background transition-smooth"
                >
                  <span className="font-medium">{d.label}</span>
                  <span className="text-xs text-muted-foreground">{d.email}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Use qualquer senha para entrar.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}