import { useEffect, useState, useCallback } from "react";
import { supabase, UserProfile, SocialRecord, AttendanceRecord } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface UseSupabaseDataOptions {
  enabled?: boolean;
}

/**
 * Hook para buscar usuários do Supabase
 */
export function useUsers(options: UseSupabaseDataOptions = {}) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("users")
        .select("id,full_name,email,role,status,avatar_url,priority_public,created_at,updated_at")
        .order("created_at", { ascending: false });

      if (err) throw err;
      setUsers(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar usuários");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchUsers();
    }
  }, [fetchUsers, options.enabled]);

  return { users, loading, error, refetch: fetchUsers };
}

/**
 * Hook para buscar um usuário específico
 */
export function useUser(userId: string | null, options: UseSupabaseDataOptions = {}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("users")
        .select("id,auth_id,full_name,email,role,status,avatar_url,priority_public,created_at,updated_at")
        .eq("id", userId)
        .single();

      if (err) throw err;
      setUser(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar usuário");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchUser();
    }
  }, [fetchUser, options.enabled]);

  return { user, loading, error, refetch: fetchUser };
}

/**
 * Hook para buscar prontuário digital de um usuário
 */
export function useSocialRecords(userId: string | null, options: UseSupabaseDataOptions = {}) {
  const [records, setRecords] = useState<SocialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!userId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("social_records")
        .select("*")
        .eq("user_id", userId)
        .order("record_date", { ascending: false });

      if (err) throw err;
      setRecords(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar prontuário");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addRecord = useCallback(
    async (record: Omit<SocialRecord, "id" | "created_at">) => {
      try {
        const { error: err } = await supabase
          .from("social_records")
          .insert([record]);

        if (err) throw err;
        await fetchRecords();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao adicionar registro",
        };
      }
    },
    [fetchRecords]
  );

  useEffect(() => {
    if (options.enabled !== false) {
      fetchRecords();
    }
  }, [fetchRecords, options.enabled]);

  return { records, loading, error, refetch: fetchRecords, addRecord };
}

/**
 * Hook para buscar presença de um usuário
 */
export function useAttendance(userId: string | null, options: UseSupabaseDataOptions = {}) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    if (!userId) {
      setAttendance([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (err) throw err;
      setAttendance(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar presença");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchAttendance();
    }
  }, [fetchAttendance, options.enabled]);

  return { attendance, loading, error, refetch: fetchAttendance };
}

/**
 * Hook para atualizar perfil de usuário
 */
export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useSupabaseAuth();

  const updateUser = useCallback(async (userId: string, updates: Partial<UserProfile>) => {
    if (!currentUser) return { success: false, error: "Usuário não autenticado." };
    const isSelf = currentUser.id === userId;
    const isAdmin = currentUser.role === "ADMIN";
    if (!isAdmin && !isSelf) {
      return { success: false, error: "Você não tem permissão para editar este perfil." };
    }

    // Nunca aceite auth_id, id, e-mail ou dados protegidos de um formulário
    // comum. Funções e status só podem ser alterados por um admin para outra conta.
    const allowedFields = isAdmin && !isSelf
      ? ["full_name", "role", "status", "priority_public", "avatar_url"]
      : ["full_name", "priority_public", "avatar_url"];
    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(([field, value]) => allowedFields.includes(field) && value !== undefined)
    );
    if (Object.keys(safeUpdates).length === 0) {
      return { success: false, error: "Nenhum campo permitido para atualização foi informado." };
    }

    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("users")
        .update(safeUpdates)
        .eq("id", userId)
        .select("id")
        .maybeSingle();

      if (err) throw err;
      if (!data) throw new Error("O perfil não foi atualizado. Verifique as permissões do banco.");
      setError(null);
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao atualizar usuário";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  return { updateUser, loading, error };
}

/**
 * Hook para criar novo usuário
 */
export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Criar apenas a linha de perfil não cria uma conta em auth.users. Até haver
  // uma função administrativa segura no servidor, esta operação fica bloqueada.
  const createUser = useCallback(async (_user: Omit<UserProfile, "id" | "created_at" | "updated_at">) => {
    const message = "A criação direta de usuários está desativada. Use o cadastro de autenticação e depois aprove o perfil.";
    setError(message);
    return { success: false, error: message };
  }, []);

  return { createUser, loading, error };
}
