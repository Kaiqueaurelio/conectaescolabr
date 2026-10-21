import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, roleHome } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, MessageSquareHeart, BookHeart, Users, Briefcase } from "lucide-react";
import heroImg from "@/assets/hero-education.jpg";
import Logo from "@/components/Logo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Role } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate(roleHome(user.role), { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Informe o seu e-mail.");
    if (!password.trim()) return toast.error("Informe a sua senha.");
    setSubmitting(true);
    const { error } = await login(email.trim(), password);
    setSubmitting(false);
    if (error) {
      if (error.startsWith("Seu cadastro foi finalizado e enviado para aprovação.")) {
        toast.success(error);
      } else {
        toast.error(error);
      }
    } else {
      toast.success("Bem-vindo(a) de volta!");
    }
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Digite seu e-mail no campo acima para receber o link de redefinição.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: window.location.origin + "/login",
      });
      if (error) {
        toast.error("Não foi possível solicitar a redefinição. Confira o e-mail e tente novamente.");
      } else {
        toast.success("Se esse e-mail estiver cadastrado, você receberá um link para redefinir a senha.", { description: "Confira também a caixa de spam." });
      }
    } catch {
      toast.error("Falha de conexão ao solicitar a redefinição. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Informe seu nome completo.");
    if (!email.trim()) return toast.error("Informe seu e-mail.");
    if (!password.trim()) return toast.error("Informe uma senha.");
    if (password.length < 8) return toast.error("A senha deve ter pelo menos 8 caracteres.");
    
    setSubmitting(true);
    const { error, success } = await register(name.trim(), email.trim(), password, role);
    setSubmitting(false);
    if (error) {
      toast.error(error);
    } else if (success) {
      toast.success("Solicitação enviada!", {
        description: "Cadastro iniciado. Se o projeto exigir confirmação de e-mail, confirme o endereço; seu perfil ficará pendente até a aprovação administrativa.",
      });
      setIsRegister(false);
      setName("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative gradient-brand items-center justify-center p-12 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-secondary/30 blur-3xl" />
        <div className="relative z-10 max-w-md text-primary-foreground">
          <div className="inline-flex bg-white rounded-2xl p-4 shadow-floating mb-8">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl font-bold leading-tight text-balance">
            Em defesa e valorização da vida.
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/95">
            Conectando educadores, crianças e famílias em uma jornada de aprendizado, acolhimento e cuidado.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs font-medium">
              <MessageSquareHeart className="h-3.5 w-3.5" /> Comunicação direta
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs font-medium">
              <BookHeart className="h-3.5 w-3.5" /> Acompanhamento real
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs font-medium">
              <Users className="h-3.5 w-3.5" /> Famílias engajadas
            </span>
          </div>
          <img
            src={heroImg}
            alt="Crianças aprendendo juntas"
            width={1280}
            height={896}
            className="mt-8 rounded-2xl shadow-floating bg-white/95 p-2"
          />
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden flex justify-center">
            <Logo size="xl" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isRegister ? "Criar conta" : "Acesse sua conta"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isRegister
              ? "Preencha os dados abaixo para solicitar seu acesso."
              : "Bem-vindo(a) de volta! Faça login para continuar."}
          </p>

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="mt-8 space-y-5">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  className="h-11"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                autoComplete={isRegister ? "email" : "email"}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => void handleForgotPassword()}
                    disabled={submitting}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isRegister ? "new-password" : "current-password"}
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

            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Perfil</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o seu perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Aluno(a)</SelectItem>
                    <SelectItem value="PARENT">Responsável</SelectItem>
                    <SelectItem value="TEACHER">Professor(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full h-11 gradient-primary text-primary-foreground font-semibold shadow-elevated hover:opacity-95">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRegister ? "Solicitando..." : "Entrando..."}
                </>
              ) : isRegister ? (
                "Solicitar Cadastro"
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isRegister ? "Já tem conta? " : "Não tem conta? "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className="font-semibold text-primary hover:underline"
              >
                {isRegister ? "Faça login" : "Crie uma conta"}
              </button>
            </p>
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Associação Camila — Em defesa e valorização da vida.
          </p>
        </div>
      </div>
    </div>
  );
}
