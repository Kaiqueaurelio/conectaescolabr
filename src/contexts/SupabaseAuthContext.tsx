import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

  // Initialize auth state
  useEffect(() => {
    let active = true;

    const loadProfile = (authId: string) => {
      // Run in background — do NOT block the loading flag on this query.
      supabase
        .from("users")
        .select("*")
        .eq("auth_id", authId)
        .maybeSingle()
        .then(({ data: profileData, error }) => {
          if (!active) return;
          if (error) {
            console.error("Error fetching user profile:", error);
          } else if (profileData) {
            setUser(profileData as UserProfile);
          }
        });
    };

    // Register listener BEFORE getSession so we never miss events.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!active) return;
      setSession(newSession);
      if (newSession?.user) {
        loadProfile(newSession.user.id);
      } else {
        setUser(null);
      }
    });

    // Resolve loading as soon as we know the local session — don't wait for the
    // profile round-trip, which can hang on slow networks or RLS issues.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        if (data.session?.user) {
          loadProfile(data.session.user.id);
        }
      })
      .catch((err) => {
        console.error("Error initializing auth:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Safety net: never let the app stay stuck on a spinner forever.
    const timeout = setTimeout(() => {
      if (active) setLoading(false);
    }, 3000);

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
        if (profile.status === "PENDING" || profile.status === "REJECTED") {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          return {
            success: false,
            error: profile.status === "PENDING"
              ? "Sua conta está aguardando aprovação"
              : "Sua conta foi rejeitada",
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

      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      setUser({ ...user, ...updates });
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
