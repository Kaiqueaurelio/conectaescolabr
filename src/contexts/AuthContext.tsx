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

const STORAGE_KEY = "ong_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabaseAuth = useSupabaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Sincronizar com Supabase
  useEffect(() => {
    if (supabaseAuth.user) {
      const profile = supabaseAuth.user;
      const role: Role =
        profile.role === "VOLUNTEER" ? "STUDENT" : (profile.role as Role) || "STUDENT";
      const authUser: User = {
        id: profile.id,
        role,
        name: profile.full_name || profile.email || "",
        email: profile.email || "",
        avatar_url: profile.avatar_url,
        status: profile.status || "APPROVED",
      };
      setUser(authUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const u = JSON.parse(stored) as User;
          setUser(u);
          if (u.role === "PARENT" && u.childrenIds?.length) {
            setSelectedChildId(u.childrenIds[0]);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
    setLoading(supabaseAuth.loading);
  }, [supabaseAuth.user, supabaseAuth.loading]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const result = await supabaseAuth.login(email, password);
      if (result.success) {
        return { success: true };
      }
      return { error: result.error || "Falha ao fazer login" };
    } catch (error) {
      return { error: "Erro ao fazer login. Tente novamente." };
    }
  };

  const register = async (name: string, email: string, password: string, role: Role): Promise<AuthResult> => {
    try {
      if (!name.trim()) return { error: "O preenchimento do nome é obrigatório." };
      if (!email.trim()) return { error: "O preenchimento do e-mail é obrigatório." };
      if (!password.trim()) return { error: "O preenchimento da senha é obrigatório." };

      const result = await supabaseAuth.register(email, password, name, role);

      if (result.success) {
        return { success: true };
      }
      return { error: result.error || "Falha ao registrar" };
    } catch (error) {
      return { error: "Erro ao registrar. Tente novamente." };
    }
  };

  const logout = async () => {
    await supabaseAuth.logout();
    setUser(null);
    setSelectedChildId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchChild = (childId: string) => {
    setSelectedChildId(childId);
  };

  const updateProfile = async (patch: Partial<Pick<User, "name" | "email" | "avatar_url">>) => {
    if (!user) return;
    
    try {
      await supabaseAuth.updateProfile(patch);
      const updated = { ...user, ...patch };
      setUser(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      // Implementar via Supabase RPC ou API
      console.log("Aprovando usuário:", userId);
    } catch (error) {
      console.error("Erro ao aprovar usuário:", error);
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      // Implementar via Supabase RPC ou API
      console.log("Rejeitando usuário:", userId);
    } catch (error) {
      console.error("Erro ao rejeitar usuário:", error);
    }
  };

  const linkChild = async (childId: string): Promise<AuthResult> => {
    try {
      if (!user) return { error: "Usuário não autenticado" };
      
      const childrenIds = user.childrenIds || [];
      if (!childrenIds.includes(childId)) {
        childrenIds.push(childId);
        await updateProfile({ ...user });
      }
      return { success: true };
    } catch (error) {
      return { error: "Erro ao vincular filho" };
    }
  };

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
