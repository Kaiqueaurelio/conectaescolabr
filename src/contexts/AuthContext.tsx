import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useSupabaseAuth } from "./SupabaseAuthContext";
import { isAuthorizedProfile } from "@/lib/authPolicy";

export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "VOLUNTEER";

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar_url?: string;
  childrenIds?: string[];
  classIds?: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface AuthResult {
  success?: boolean;
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string, role: Role) => Promise<AuthResult>;
  logout: () => void;
  loading: boolean;
  switchChild: (childId: string) => void;
  selectedChildId: string | null;
  updateProfile: (patch: Partial<Pick<User, "name" | "email" | "avatar_url">>) => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  linkChild: (childId: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabaseAuth = useSupabaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // A sessão autenticada do Supabase é a única fonte de verdade.
  // Nunca restaure privilégios de uma cópia local que pode estar desatualizada.
  useEffect(() => {
    const profile = supabaseAuth.user;
    if (!profile) {
      setUser(null);
      setSelectedChildId(null);
      setLoading(supabaseAuth.loading);
      return;
    }

    // O mesmo critério é testado unitariamente e usado para negar contas
    // pendentes, rejeitadas e papéis que ainda não possuem uma área própria.
    if (!isAuthorizedProfile(profile)) {
      setUser(null);
      setLoading(false);
      return;
    }

    const authUser: User = {
      id: profile.id,
      role: profile.role as Role,
      name: profile.full_name || profile.email || "",
      email: profile.email || "",
      avatar_url: profile.avatar_url || undefined,
      status: profile.status,
    };

    setUser(authUser);
    setLoading(supabaseAuth.loading);
  }, [supabaseAuth.user, supabaseAuth.loading]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const result = await supabaseAuth.login(email.trim(), password);
      return result.success ? { success: true } : { error: result.error || "Falha ao fazer login" };
    } catch {
      return { error: "Erro ao fazer login. Tente novamente." };
    }
  };

  const register = async (name: string, email: string, password: string, role: Role): Promise<AuthResult> => {
    if (!name.trim()) return { error: "O preenchimento do nome é obrigatório." };
    if (!email.trim()) return { error: "O preenchimento do e-mail é obrigatório." };
    if (password.length < 8) return { error: "A senha deve ter pelo menos 8 caracteres." };

    try {
      const result = await supabaseAuth.register(email.trim(), password, name.trim(), role);
      return result.success ? { success: true } : { error: result.error || "Falha ao registrar" };
    } catch {
      return { error: "Erro ao registrar. Tente novamente." };
    }
  };

  const logout = async () => {
    await supabaseAuth.logout();
    setUser(null);
    setSelectedChildId(null);
  };

  const switchChild = (childId: string) => {
    setSelectedChildId(childId);
  };

  const updateProfile = async (patch: Partial<Pick<User, "name" | "email" | "avatar_url">>) => {
    if (!user) return;
    if (patch.email !== undefined && patch.email !== user.email) {
      throw new Error("Para alterar o e-mail, use o fluxo de atualização e confirmação da conta.");
    }
    const result = await supabaseAuth.updateProfile({
      ...(patch.name !== undefined ? { full_name: patch.name } : {}),
      ...(patch.avatar_url !== undefined ? { avatar_url: patch.avatar_url } : {}),
    });
    if (!result.success) {
      throw new Error(result.error || "Não foi possível atualizar o perfil.");
    }
  };

  // Aprovação/rejeição não pode ser simulada no cliente. A operação precisa ser
  // autorizada pelas políticas RLS do banco e retornar seu resultado real.
  const approveUser = async (userId: string) => {
    const result = await supabaseAuth.setUserStatus(userId, "APPROVED");
    if (!result.success) throw new Error(result.error || "Não foi possível aprovar o usuário.");
  };

  const rejectUser = async (userId: string) => {
    const result = await supabaseAuth.setUserStatus(userId, "REJECTED");
    if (!result.success) throw new Error(result.error || "Não foi possível rejeitar o usuário.");
  };

  const linkChild = async (_childId: string): Promise<AuthResult> => ({
    error: "O vínculo com responsável ainda precisa ser configurado no banco de dados. Nenhuma alteração foi salva.",
  });

  return (
    <AuthContext.Provider
      value={{
        user, login, register, logout, loading, switchChild, selectedChildId,
        updateProfile, approveUser, rejectUser, linkChild,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}

export function roleHome(role: Role): string {
  const homes: Record<Role, string> = {
    ADMIN: "/admin/dashboard",
    TEACHER: "/professor",
    STUDENT: "/aluno/dashboard",
    PARENT: "/parent/portal",
    VOLUNTEER: "/voluntario",
  };
  return homes[role] || "/";
}
