import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { users, User, Role } from "@/lib/mockData";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  loading: boolean;
  switchChild: (childId: string) => void;
  selectedChildId: string | null;
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
    if (!found) return { error: "Credenciais inválidas. Verifique seu e-mail e senha." };
    setUser(found);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    if (found.role === "PARENT" && found.childrenIds?.length) {
      setSelectedChildId(found.childrenIds[0]);
    }
    return {};
  };

  const logout = () => {
    setUser(null);
    setSelectedChildId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchChild = (childId: string) => setSelectedChildId(childId);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, switchChild, selectedChildId }}>
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
    case "ADMIN": return "/professor";
  }
}