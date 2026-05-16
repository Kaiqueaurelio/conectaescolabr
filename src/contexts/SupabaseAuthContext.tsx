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
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);

        if (data.session?.user) {
          const { data: profileData, error } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", data.session.user.id)
            .single();

          if (error) {
            console.error("Error fetching user profile:", error);
          } else if (profileData) {
            setUser(profileData as UserProfile);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (session?.user) {
        const { data: profileData } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", session.user.id)
          .single();

        if (profileData) {
          setUser(profileData as UserProfile);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
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

        if (profileError) {
          return { success: false, error: "Erro ao carregar perfil do usuário" };
        }

        if (profileData) {
          const profile = profileData as UserProfile;
          if (profile.status === "PENDING") {
            return { success: false, error: "Sua conta está aguardando aprovação" };
          }
          if (profile.status === "REJECTED") {
            return { success: false, error: "Sua conta foi rejeitada" };
          }
          setUser(profile);
        }
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
