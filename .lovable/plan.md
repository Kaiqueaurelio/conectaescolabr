## Problema

Na Vercel, o login quebra porque as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` não estão disponíveis no build, então `src/lib/supabase.ts` usa um fallback fake (`https://placeholder.supabase.co`) e qualquer tentativa de autenticar falha.

No preview do Lovable funciona porque o `.env` é injetado automaticamente. Na Vercel esse `.env` não chega.

## Correção automática (1 arquivo)

Trocar o fallback placeholder em `src/lib/supabase.ts` pelos valores reais do projeto. A URL e a chave `anon/publishable` são **públicas por design** (vão para o navegador de qualquer forma), então não há risco de segurança em deixá-las como fallback.

```ts
const url =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://bzpxmeuygbfdagnafawe.supabase.co";
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cHhtZXV5Z2JmZGFnbmFmYXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjQ2MjMsImV4cCI6MjA5NDYwMDYyM30.xJfCNXI7PHpKursvrTtgYFMNe12tUwL5PRThNRFmwaY";
```

Depois disso, o login funciona em **qualquer hospedagem** (Vercel, Netlify, etc.) sem precisar configurar nada manualmente.

## Passo extra na Vercel (opcional, mas recomendado)

Para o link de confirmação de e-mail abrir no domínio certo, você precisa avisar o backend qual é a URL da Vercel:

1. Lovable → **Cloud → Users → URL Configuration**
2. Adicionar a URL da Vercel (ex.: `https://seu-app.vercel.app`) em **Redirect URLs**
3. Definir como **Site URL** se for o domínio principal

Isso não afeta o login em si — só os e-mails de confirmação/recuperação de senha. Posso te guiar quando quiser.

## Resultado

Após aprovar este plano e publicar/sincronizar com o GitHub → Vercel re-deploya automaticamente → login passa a funcionar.
