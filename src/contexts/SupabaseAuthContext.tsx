import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
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
  const profileRequestId = useRef(0);
  const registrationInProgress = useRef(false);

  // A profile must be loaded from the server for every authenticated session.
  // Never restore application permissions from localStorage.
  useEffect(() => {
    let active = true;
    let authEventReceived = false;

    const loadProfile = async (authId: string) => {
      const requestId = ++profileRequestId.current;
      const wasRegistering = registrationInProgress.current;
      setUser(null);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", authId)
          .maybeSingle();

        if (!active || requestId !== profileRequestId.current) return;
        if (error) {
          console.error("Erro ao carregar perfil:", error);
          setUser(null);
        } else if (!data) {
          setUser(null);
          // During public signup the profile is inserted immediately after the
          // auth identity. Do not race that insert by signing out prematurely.
          if (!wasRegistering) {
            void supabase.auth.signOut();
            setSession(null);
          }
        } else if (data.status !== "APPROVED" ||
          !["ADMIN", "TEACHER", "STUDENT", "PARENT", "VOLUNTEER"].includes(data.role)) {
          setUser(null);
          // Pending, rejected, or unsupported profiles cannot access the app.
          void supabase.auth.signOut();
          setSession(null);
        } else {
          setUser(data as UserProfile);
        }
      } catch (error) {
        if (active && requestId === profileRequestId.current) {
          console.error("Falha inesperada ao carregar perfil:", error);
          setUser(null);
        }
      } finally {
        if (active && requestId === profileRequestId.current) setLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;
      authEventReceived = true;
      setSession(newSession);
      if (newSession?.user) {
        void loadProfile(newSession.user.id);
      } else {
        profileRequestId.current += 1;
        setUser(null);
        setSelectedChildId(null);
        setLoading(false);
      }
    });

    const initialize = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!active || authEventReceived) return;
        if (error) throw error;
        setSession(data.session);
        if (data.session?.user) {
          await loadProfile(data.session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
        if (active) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    void initialize();
    const timeout = setTimeout(() => {
      if (active) setLoading(false);
    }, 10000);

    return () => {
      active = false;
      clearTimeout(timeout);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (!data.session?.user) return { success: false, error: "Não foi possível iniciar a sessão." };

      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", data.session.user.id)
        .maybeSingle();

      if (profileError || !profileData) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        return {
          success: false,
          error: profileError ? "Não foi possível validar seu perfil." : "Seu perfil não está cadastrado. Entre em contato com a administração.",
        };
      }

      const profile = profileData as UserProfile;
      if (profile.status !== "APPROVED") {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        return {
          success: false,
          error: profile.status === "PENDING"
            ? "Sua conta está aguardando aprovação."
            : "Sua conta não possui autorização para acessar o sistema.",
        };
      }
      if (!["ADMIN", "TEACHER", "STUDENT", "PARENT"].includes(profile.role)) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        return { success: false, error: "Esse perfil ainda não possui uma área de acesso configurada." };
      }

      setSession(data.session);
      setUser(profile);
      setLoading(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: UserProfile["role"]
  ): Promise<{ success: boolean; error?: string }> => {
    registrationInProgress.current = true;
    try {
      if (!fullName.trim() || !email.trim() || !password) {
        return { success: false, error: "Preencha nome, e-mail e senha." };
      }
      // Public registration must never grant administrative or unsupported roles.
      if (!["TEACHER", "STUDENT", "PARENT"].includes(role)) {
        return { success: false, error: "Esse tipo de conta não pode ser criado pelo cadastro público." };
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      if (authError) return { success: false, error: authError.message };
      if (!authData.user) return { success: false, error: "Erro ao criar usuário." };

      const { error: profileError } = await supabase.from("users").insert({
        auth_id: authData.user.id,
        email: email.trim().toLowerCase(),
        full_name: fullName.trim(),
        role,
        status: "PENDING",
      });
      if (profileError) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        return { success: false, error: "A conta foi criada, mas o perfil não pôde ser registrado. Entre em contato com a administração." };
      }

      // Do not leave an unapproved user with an active app session.
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    } finally {
      registrationInProgress.current = false;
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
    if (!user) return { success: false, error: "Usuário não autenticado." };

    // Profile edits cannot change authorization or identity linkage fields.
    const { role: _role, status: _status, auth_id: _authId, id: _id, ...safeUpdates } = updates;
    try {
      const { data, error } = await supabase
        .from("users")
        .update(safeUpdates)
        .eq("id", user.id)
        .select("id")
        .maybeSingle();
      if (error) return { success: false, error: error.message };
      if (!data) return { success: false, error: "O perfil não foi atualizado. Verifique as permissões." };
      setUser({ ...user, ...safeUpdates });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

  const setUserStatus = async (
    userId: string,
    status: "APPROVED" | "REJECTED"
  ): Promise<{ success: boolean; error?: string }> => {
    if (user?.role !== "ADMIN") {
      return { success: false, error: "Somente administradores podem alterar o status de contas." };
    }
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ status })
        .eq("id", userId)
        .select("id")
        .maybeSingle();
      if (error) return { success: false, error: error.message };
      if (!data) return { success: false, error: "O status não foi alterado. Verifique as permissões e o usuário selecionado." };
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
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
