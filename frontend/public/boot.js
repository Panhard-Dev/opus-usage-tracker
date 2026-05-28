// Boot: pra entrar no app voce TEM que estar logado.
// Se nao tiver sessao, redireciona pra /login.html
import { createClient } from "@supabase/supabase-js";
import { apiUrl } from "./api.js";

async function boot() {
  let cfg;
  try {
    cfg = await fetch(apiUrl("/api/health")).then((r) => r.json());
  } catch (err) {
    document.body.innerHTML = `<div style="padding:40px;color:#fff;font-family:monospace">
      Backend nao respondeu. Verifique se ele esta rodando em http://localhost:8787.<br/><br/>
      ${err.message}
    </div>`;
    throw err;
  }

  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    document.body.innerHTML = `<div style="padding:40px;color:#fff;font-family:monospace">
      Supabase nao configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY no backend/.env.
    </div>`;
    throw new Error("Supabase config ausente");
  }

  const sb = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  // Shortcut: /?logout limpa a sessao e manda pro login
  if (location.search.includes("logout")) {
    await sb.auth.signOut();
    window.location.replace("/login.html");
    return;
  }

  const { data } = await sb.auth.getSession();
  console.log("[boot] session:", data.session);
  if (!data.session) {
    console.log("[boot] sem sessao - redirecionando pra /login.html");
    window.location.replace("/login.html");
    return;
  }

  console.log("[boot] logado como:", data.session.user.email);

  // Expoe pro app.js
  window.__supabase__ = sb;
  window.__auth__ = {
    sb,
    getSession: () => sb.auth.getSession().then((r) => r.data.session),
    getAccessToken: async () => {
      const { data } = await sb.auth.getSession();
      return data.session?.access_token || null;
    },
    onAuthChange: (cb) => sb.auth.onAuthStateChange((_e, s) => cb(s)),
    signOut: () => sb.auth.signOut(),
    apiFetch: async (path, init = {}) => {
      const { data } = await sb.auth.getSession();
      const token = data.session?.access_token;
      return fetch(apiUrl(path), {
        ...init,
        headers: {
          ...(init.headers || {}),
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          ...(init.body && typeof init.body === "string" ? { "content-type": "application/json" } : {})
        }
      });
    }
  };

  // Quando user desloga em outra aba ou expira -> manda pra login
  sb.auth.onAuthStateChange((event, session) => {
    if (!session) window.location.replace("/login.html");
  });

  await import("./app.js");
}

boot().catch((err) => {
  console.error("[boot]", err);
});
