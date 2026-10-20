import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useSupabaseAuth } from "./SupabaseAuthContext";

export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

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
  logout: () => Promise<void>;
  loading: boolean;
  switchChild: (childId: string) => void;
  selectedChildId: string | null;
  updateProfile: (patch: Partial<Pick<User, "name" | "email" | "avatar_url">>) => Promise<AuthResult>;
  approveUser: (userId: string) => Promise<AuthResult>;
  rejectUser: (userId: string) => Promise<AuthResult>;
  linkChild: (childId: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabaseAuth = useSupabaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Supabase is the only source of authentication and authorization.
  // A cached profile is never sufficient to grant access to protected routes.
  useEffect(() => {
    const profile = supabaseAuth.user;
    const supportedRoles: Role[] = ["ADMIN", "TEACHER", "STUDENT", "PARENT"];

    if (
      profile &&
      profile.status === "APPROVED" &&
      supportedRoles.includes(profile.role as Role)
    ) {
      setUser({
        id: profile.id,
        role: profile.role as Role,
        name: profile.full_name || profile.email || "",
        email: profile.email || "",
        avatar_url: profile.avatar_url,
        status: "APPROVED",
      });
    } else {
      setUser(null);
      setSelectedChildId(null);
    }

    setLoading(supabaseAuth.loading);
  }, [supabaseAuth.user, supabaseAuth.loading]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const result = await supabaseAuth.login(email, password);
      return result.success ? { success: true } : { error: result.error || "Falha ao fazer login." };
    } catch {
      return { error: "Erro ao fazer login. Tente novamente." };
    }
  };

  const register = async (name: string, email: string, password: string, role: Role): Promise<AuthResult> => {
    if (name.trim().length < 2) return { error: "Informe seu nome completo." };
    if (!email.trim()) return { error: "Informe seu e-mail." };
    if (password.length < 8) return { error: "A senha deve ter pelo menos 8 caracteres." };

    try {
      const result = await supabaseAuth.register(email, password, name, role);
      return result.success ? { success: true } : { error: result.error || "Falha ao registrar." };
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
    // Child switching is not authorization: downstream queries must still
    // verify the parent-child relationship on the server.
    setSelectedChildId(childId);
  };

  const updateProfile = async (
    patch: Partial<Pick<User, "name" | "email" | "avatar_url">>
  ): Promise<AuthResult> => {
    if (!user) return { error: "Usuário não autenticado." };
    if (patch.email && patch.email !== user.email) {
      return { error: "A alteração de e-mail precisa ser feita por um fluxo com confirmação de endereço." };
    }

    const updates = {
      ...(patch.name !== undefined ? { full_name: patch.name.trim() } : {}),
      ...(patch.avatar_url !== undefined ? { avatar_url: patch.avatar_url } : {}),
    };
    const result = await supabaseAuth.updateProfile(updates);
    if (!result.success) return { error: result.error || "Não foi possível atualizar o perfil." };
    return { success: true };
  };

  const approveUser = async (userId: string): Promise<AuthResult> => {
    const result = await supabaseAuth.setUserStatus(userId, "APPROVED");
    return result.success ? { success: true } : { error: result.error || "Não foi possível aprovar a conta." };
  };

  const rejectUser = async (userId: string): Promise<AuthResult> => {
    const result = await supabaseAuth.setUserStatus(userId, "REJECTED");
    return result.success ? { success: true } : { error: result.error || "Não foi possível rejeitar a conta." };
  };

  const linkChild = async (_childId: string): Promise<AuthResult> => ({
    error: "O vínculo responsável-aluno ainda não está configurado no banco com validação de permissões. Nenhum vínculo foi criado.",
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        switchChild,
        selectedChildId,
        updateProfile,
        approveUser,
        rejectUser,
        linkChild,
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
    STUDENT: "/aluno",
    PARENT: "/responsavel",
  };
  return homes[role] || "/";
}
