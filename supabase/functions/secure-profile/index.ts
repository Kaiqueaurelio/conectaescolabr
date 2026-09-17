import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SENSITIVE_FIELDS = [
  "cpf",
  "rg",
  "address",
  "phone",
  "mother_name",
  "father_name",
  "vulnerability_situation",
] as const;

type SensitiveField = (typeof SENSITIVE_FIELDS)[number];

const COLUMN_OF: Record<SensitiveField, string> = {
  cpf: "cpf_enc",
  rg: "rg_enc",
  address: "address_enc",
  phone: "phone_enc",
  mother_name: "mother_name_enc",
  father_name: "father_name_enc",
  vulnerability_situation: "vulnerability_enc",
};

const enc = new TextEncoder();
const dec = new TextDecoder();

async function getKey(): Promise<CryptoKey> {
  const raw = Deno.env.get("APP_ENCRYPTION_KEY");
  if (!raw) throw new Error("APP_ENCRYPTION_KEY not configured");
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(raw));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

function toB64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromB64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

async function encryptValue(key: CryptoKey, plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plain)),
  );
  return `v1.${toB64(iv)}.${toB64(cipher)}`;
}

async function decryptValue(key: CryptoKey, payload: string): Promise<string | null> {
  try {
    const [version, ivB64, dataB64] = payload.split(".");
    if (version !== "v1" || !ivB64 || !dataB64) return null;
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromB64(ivB64) },
      key,
      fromB64(dataB64),
    );
    return dec.decode(plain);
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return json({ error: "Não autenticado" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) return json({ error: "Sessão inválida" }, 401);
    const authId = authData.user.id;

    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const userId = typeof body?.userId === "string" ? body.userId : null;
    if (action !== "read" && action !== "save") {
      return json({ error: "Ação inválida" }, 400);
    }
    if (!userId) return json({ error: "userId obrigatório" }, 400);

    const { data: row, error: rowError } = await admin
      .from("users")
      .select("id, auth_id")
      .eq("id", userId)
      .maybeSingle();
    if (rowError) return json({ error: rowError.message }, 500);
    if (!row) return json({ error: "Registro não encontrado" }, 404);

    // Privacidade máxima: apenas o próprio dono lê ou grava seus dados sensíveis.
    if (row.auth_id !== authId) return json({ error: "Acesso negado" }, 403);

    const key = await getKey();

    if (action === "read") {
      const { data: full, error } = await admin
        .from("users")
        .select(Object.values(COLUMN_OF).join(","))
        .eq("id", userId)
        .single();
      if (error) return json({ error: error.message }, 500);

      const result: Record<string, string | null> = {};
      for (const field of SENSITIVE_FIELDS) {
        const stored = (full as Record<string, string | null>)[COLUMN_OF[field]];
        result[field] = stored ? await decryptValue(key, stored) : null;
      }
      return json({ data: result });
    }

    const values = body?.values;
    if (!values || typeof values !== "object") {
      return json({ error: "values obrigatório" }, 400);
    }

    const updates: Record<string, string | null> = { encrypted_at: new Date().toISOString() };
    for (const field of SENSITIVE_FIELDS) {
      if (!(field in values)) continue;
      const value = values[field];
      if (value === null || value === undefined || String(value).trim() === "") {
        updates[COLUMN_OF[field]] = null;
      } else {
        if (String(value).length > 5000) {
          return json({ error: `Campo ${field} muito longo` }, 400);
        }
        updates[COLUMN_OF[field]] = await encryptValue(key, String(value));
      }
      // limpa qualquer resíduo em texto puro
      updates[field] = null;
    }

    const { error: updateError } = await admin.from("users").update(updates).eq("id", userId);
    if (updateError) return json({ error: updateError.message }, 500);

    return json({ success: true });
  } catch (error) {
    return json({ error: String(error) }, 500);
  }
});
