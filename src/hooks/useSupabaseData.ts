import { useEffect, useState, useCallback } from "react";
import { supabase, UserProfile, SocialRecord, AttendanceRecord } from "@/lib/supabase";

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
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;
      setUsers(data || []);
      setError(null);
    } catch (err) {
      setUsers([]);
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
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (err) throw err;
      setUser(data);
      setError(null);
    } catch (err) {
      setUser(null);
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
      setError(null);
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
      setRecords([]);
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
      setError(null);
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
      setAttendance([]);
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

  const updateUser = useCallback(async (userId: string, updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select("id")
        .maybeSingle();

      if (err) throw err;
      if (!data) throw new Error("Nenhum perfil foi atualizado. Verifique as permissões e o identificador.");
      setError(null);
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao atualizar usuário";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateUser, loading, error };
}

/**
 * Hook para criar novo usuário
 */
export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A profile row without a corresponding Supabase Auth identity is not a
  // usable account. Public signup or a server-side admin endpoint must create
  // the auth identity and profile together; never create orphan profiles here.
  const createUser = useCallback(async (_user: Omit<UserProfile, "id" | "created_at" | "updated_at">) => {
    const message = "Criação administrativa desativada: use o cadastro autenticado ou um endpoint seguro que crie a conta e o perfil em conjunto.";
    setError(message);
    return { success: false as const, error: message };
  }, []);

  return { createUser, loading, error };
}
