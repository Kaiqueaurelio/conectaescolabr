import { supabase } from "@/lib/supabase";

export const SENSITIVE_FIELDS = [
  "cpf",
  "rg",
  "address",
  "phone",
  "mother_name",
  "father_name",
  "vulnerability_situation",
] as const;

export type SensitiveField = (typeof SENSITIVE_FIELDS)[number];
export type SensitiveValues = Partial<Record<SensitiveField, string | null>>;

/** Mascara um valor sensível para exibição a quem não é o dono do registro. */
export function maskSensitive(value?: string | null): string {
  if (!value) return "—";
  const text = String(value);
  if (text.length <= 4) return "•".repeat(text.length);
  return `${"•".repeat(Math.max(4, text.length - 4))}${text.slice(-4)}`;
}

/** Lê e descriptografa os dados sensíveis do próprio usuário. */
export async function readSecureProfile(
  userId: string
): Promise<{ data?: SensitiveValues; error?: string }> {
  const { data, error } = await supabase.functions.invoke("secure-profile", {
    body: { action: "read", userId },
  });
  if (error) return { error: error.message };
  if (data?.error) return { error: data.error };
  return { data: (data?.data ?? {}) as SensitiveValues };
}

/** Criptografa e grava os dados sensíveis do próprio usuário. */
export async function saveSecureProfile(
  userId: string,
  values: SensitiveValues
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke("secure-profile", {
    body: { action: "save", userId, values },
  });
  if (error) return { success: false, error: error.message };
  if (data?.error) return { success: false, error: data.error };
  return { success: true };
}
