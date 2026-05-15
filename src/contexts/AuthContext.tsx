import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { users, User, Role } from "@/lib/mockData";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string, role: Role) => Promise<{ error?: string }>;
  logout: () => void;
  loading: boolean;
  switchChild: (childId: string) => void;
  selectedChildId: string | null;
  updateProfile: (patch: Partial<Pick<User, "name" | "email" | "avatar_url">>) => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  linkChild: (childId: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "ong_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const u = JSON.parse(stored) as User;
        setUser(u);
        if (u.role === "PARENT" && u.childrenIds?.length) {
          setSelectedChildId(u.childrenIds[0]);
        }
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { error: "Credenciais inválidas. Por favor, verifique seu e-mail e senha." };
    
    if (found.status === "PENDING") {
      return { error: "Sua conta está aguardando a aprovação de um administrador." };
    }
    if (found.status === "REJECTED") {
      return { error: "Sua solicitação de cadastro foi recusada. Por favor, entre em contato com a coordenação." };
    }

    setUser(found);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    if (found.role === "PARENT" && found.childrenIds?.length) {
      setSelectedChildId(found.childrenIds[0]);
    }
    return {};
  };

  const register = async (name: string, email: string, _password: string, role: Role) => {
    await new Promise((r) => setTimeout(r, 600));
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return { error: "Este e-mail já se encontra cadastrado no sistema." };
    if (!name.trim()) return { error: "O preenchimento do nome é obrigatório." };
    if (!email.trim()) return { error: "O preenchimento do e-mail é obrigatório." };
    
    const newUser: User = {
      id: `u_${Date.now().toString(36)}`,
      role: role,
      name: name.trim(),
      email: email.trim(),
      avatar_url: "",
      status: "PENDING",
    };
    
    users.push(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setSelectedChildId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchChild = (childId: string) => setSelectedChildId(childId);

  const updateProfile: AuthContextValue["updateProfile"] = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const approveUser = (userId: string) => {
    const u = users.find(u => u.id === userId);
    if (u) u.status = "APPROVED";
  };

  const rejectUser = (userId: string) => {
    const u = users.find(u => u.id === userId);
    if (u) u.status = "REJECTED";
  };

  const linkChild = async (childId: string) => {
    if (!user || user.role !== "PARENT") return { success: false, error: "Apenas responsáveis podem vincular alunos." };
    
    const updatedUser = {
      ...user,
      childrenIds: [...(user.childrenIds || []), childId]
    };
    
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    
    if (!selectedChildId) {
      setSelectedChildId(childId);
    }
    
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, switchChild, selectedChildId, updateProfile, approveUser, rejectUser, linkChild }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function roleHome(role: Role): string {
  switch (role) {
    case "TEACHER": return "/professor";
    case "STUDENT": return "/aluno";
    case "PARENT": return "/responsavel";
    case "ADMIN": return "/admin";
    case "VOLUNTEER": return "/aluno";
  }
}
