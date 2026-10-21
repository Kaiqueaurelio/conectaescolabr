import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const enc = new TextEncoder();
const dec = new TextDecoder();

async function getKey(): Promise<CryptoKey> {
  const raw = Deno.env.get("APP_ENCRYPTION_KEY");
  if (!raw) throw new Error("APP_ENCRYPTION_KEY not configured");
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(raw));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}
const toB64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));
const fromB64 = (v: string) => Uint8Array.from(atob(v), (c) => c.charCodeAt(0));

async function encNum(key: CryptoKey, n: number): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const c = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(String(n))));
  return `v1.${toB64(iv)}.${toB64(c)}`;
}
async function decNum(key: CryptoKey, p: string | null): Promise<number> {
  if (!p) return 0;
  try {
    const [, iv, d] = p.split(".");
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(iv) }, key, fromB64(d));
    const decoded = dec.decode(plain);
    const quantity = Number(decoded);
    // A valid AES-GCM payload can still contain malformed plaintext if it was
    // written by an older or incorrect client. Never coerce that to zero.
    if (!decoded.trim() || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 1_000_000) {
      throw new Error("Quantidade criptografada inválida.");
    }
    return quantity;
  } catch {
    // Never reinterpret corrupted ciphertext or a wrong key as zero stock.
    // Returning zero here could silently overwrite real inventory quantities.
    throw new Error("Não foi possível descriptografar uma quantidade válida. A operação foi cancelada para preservar o estoque.");
  }
}
const toInt = (v: unknown) => {
  if (v === null || v === undefined || (typeof v === "string" && !v.trim())) return null;
  const n = Number(v);
  return Number.isSafeInteger(n) && n >= 0 && n <= 1_000_000 ? n : null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
    if (!token) return json({ error: "Não autenticado" }, 401);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: auth, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !auth.user) return json({ error: "Sessão inválida" }, 401);
    const { data: me } = await admin.from("users").select("role,status").eq("auth_id", auth.user.id).maybeSingle();
    if (!me || me.role !== "ADMIN" || me.status !== "APPROVED") return json({ error: "Acesso negado" }, 403);

    const body = await req.json().catch(() => ({}));
    const key = await getKey();
    const action = body?.action;

    if (action === "list") {
      const { data, error } = await admin.from("benefit_items").select("*").order("created_at", { ascending: false });
      if (error) return json({ error: error.message }, 500);
      const items = [];
      for (const r of data ?? []) {
        const q = await decNum(key, r.quantity_enc);
        const m = await decNum(key, r.min_enc);
        // Números nunca saem do servidor: apenas o status.
        items.push({ id: r.id, name: r.name, unit: r.unit, low: q <= m, updated_at: r.updated_at });
      }
      return json({ items });
    }

    if (action === "create") {
      const name = String(body?.name ?? "").trim().slice(0, 200);
      const unit = String(body?.unit ?? "un").trim().slice(0, 20) || "un";
      const q = toInt(body?.quantity), m = toInt(body?.minStock);
      if (!name || q === null || m === null) return json({ error: "Dados inválidos" }, 400);
      const { error } = await admin.from("benefit_items").insert({
        name, unit, quantity_enc: await encNum(key, q), min_enc: await encNum(key, m),
      });
      if (error) return json({ error: error.message }, 500);
      return json({ success: true });
    }

    if (action === "adjust") {
      const id = String(body?.id ?? "");
      const rawDelta = body?.delta;
      const delta = typeof rawDelta === "string" && rawDelta.trim() ? Number(rawDelta) : Number(rawDelta);
      if (!id || !Number.isSafeInteger(delta) || Math.abs(delta) > 100000) return json({ error: "Dados inválidos" }, 400);
      const { data: r } = await admin.from("benefit_items").select("quantity_enc").eq("id", id).maybeSingle();
      if (!r) return json({ error: "Item não encontrado" }, 404);
      const currentQuantity = await decNum(key, r.quantity_enc);
      const q = currentQuantity + delta;
      if (q < 0) return json({ error: "Quantidade insuficiente para registrar essa saída." }, 409);
      // Compare-and-swap prevents two simultaneous adjustments from silently
      // overwriting each other with a stale decrypted quantity.
      const { data: updated, error } = await admin
        .from("benefit_items")
        .update({ quantity_enc: await encNum(key, q) })
        .eq("id", id)
        .eq("quantity_enc", r.quantity_enc)
        .select("id")
        .maybeSingle();
      if (error) return json({ error: error.message }, 500);
      if (!updated) return json({ error: "O estoque foi alterado por outra operação. Atualize a tela e tente novamente." }, 409);
      return json({ success: true });
    }

    if (action === "delete") {
      const id = String(body?.id ?? "");
      if (!id) return json({ error: "id obrigatório" }, 400);
      const { data, error } = await admin.from("benefit_items").delete().eq("id", id).select("id").maybeSingle();
      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: "Item não encontrado." }, 404);
      return json({ success: true });
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
