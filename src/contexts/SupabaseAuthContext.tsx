import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { supabase, UserProfile } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

interface AuthContextValue {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    fullName: string,
    role: UserProfile["role"]
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  setUserStatus: (userId: string, status: "APPROVED" | "REJECTED") => Promise<{ success: boolean; error?: string }>;
  switchChild: (childId: string) => void;
  selectedChildId: string | null;
}

const SupabaseAuthContext = createContext<AuthContextValue | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // A resposta mais recente da sessão deve vencer consultas de perfil antigas.
  const profileRequestId = useRef(0);

  // Initialize auth state
  useEffect(() => {
    let active = true;

    const loadProfile = async (authId: string) => {
      const requestId = ++profileRequestId.current;
      setLoading(true);
      try {
        const { data: profileData, error } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", authId)
          .maybeSingle();

        if (!active || requestId !== profileRequestId.current) return;
        if (error) {
          console.error("Error fetching user profile:", error);
          setUser(null);
        } else if (profileData && profileData.status === "APPROVED") {
          setUser(profileData as UserProfile);
        } else {
          // Contas pendentes/rejeitadas nunca devem receber acesso por um
          // evento de sessão ou por uma atualização de página.
          setUser(null);
        }
      } catch (error) {
        if (active && requestId === profileRequestId.current) {
          console.error("Error fetching user profile:", error);
          setUser(null);
        }
      } finally {
        if (active && requestId === profileRequestId.current) setLoading(false);
      }
    };

    // Register listener BEFORE getSession so we never miss events.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!active) return;
      setSession(newSession);
      if (newSession?.user) {
        void loadProfile(newSession.user.id);
      } else {
        // Invalida consultas em andamento para que um perfil antigo não seja
        // restaurado depois de logout ou troca de sessão.
        profileRequestId.current += 1;
        setUser(null);
        setLoading(false);
      }
    });

    // Resolve loading as soon as we know the local session — don't wait for the
    // profile round-trip, which can hang on slow networks or RLS issues.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        // Evita que uma resposta antiga de getSession substitua uma mudança de
        // sessão já recebida pelo listener.
        if (profileRequestId.current > 0) return;
        setSession(data.session);
        if (data.session?.user) {
          void loadProfile(data.session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error initializing auth:", err);
        if (active) setLoading(false);
      });

    // Safety net: never let the app stay stuck on a spinner forever.
    const timeout = setTimeout(() => {
      if (active && loading) setLoading(false);
    }, 8000);

    return () => {
      active = false;
      clearTimeout(timeout);
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", data.session.user.id)
          .single();

        if (profileError || !profileData) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          return { success: false, error: "Não foi possível carregar seu perfil. Verifique se seu cadastro está completo ou contate a coordenação." };
        }

        const profile = profileData as UserProfile;
        if (profile.status !== "APPROVED") {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          return {
            success: false,
            error: profile.status === "REJECTED"
              ? "Sua conta foi rejeitada"
              : "Sua conta está aguardando aprovação",
          };
        }
        setUser(profile);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: UserProfile["role"]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // A role privilegiada nunca pode ser concedida pelo formulário público.
      if (role === "ADMIN" as UserProfile["role"]) {
        return { success: false, error: "Não é permitido criar uma conta administrativa pelo cadastro público." };
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: "Erro ao criar usuário" };
      }

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        auth_id: authData.user.id,
        email,
        full_name: fullName,
        role,
        status: "PENDING",
      });

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSelectedChildId(null);
  };

  const updateProfile = async (
    updates: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: "Usuário não autenticado" };
      }

      // Nunca permita que um formulário de perfil altere role, status, auth_id
      // ou outros campos de controle. A atualização do e-mail exige um fluxo
      // próprio de autenticação e confirmação.
      const editableFields = ["full_name", "avatar_url", "phone", "address"] as const;
      const safeUpdates: Partial<Pick<UserProfile, (typeof editableFields)[number]>> = {};
      for (const field of editableFields) {
        if (Object.prototype.hasOwnProperty.call(updates, field)) {
          safeUpdates[field] = updates[field] as never;
        }
      }

      if (Object.keys(safeUpdates).length === 0) {
        return { success: false, error: "Nenhum campo de perfil permitido foi informado. O e-mail deve ser alterado pelo fluxo de autenticação." };
      }

      const { data, error } = await supabase
        .from("users")
        .update(safeUpdates)
        .eq("id", user.id)
        .select("id")
        .maybeSingle();

      if (error) {
        return { success: false, error: error.message };
      }
      if (!data) {
        return { success: false, error: "O perfil não foi atualizado. Verifique suas permissões e tente novamente." };
      }

      setUser({ ...user, ...safeUpdates });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  };

  const setUserStatus = async (
    userId: string,
    status: "APPROVED" | "REJECTED"
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Somente um administrador pode alterar o status de cadastro." };
      }
      const { error } = await supabase
        .from("users")
        .update({ status })
        .eq("id", userId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  };

  const switchChild = (childId: string) => {
    setSelectedChildId(childId);
  };

  return (
    <SupabaseAuthContext.Provider
      value={{
        session,
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        setUserStatus,
        switchChild,
        selectedChildId,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) {
    throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider");
  }
  return ctx;
}
