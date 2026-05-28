// Login isolado: busca config -> Supabase -> redireciona se ja logado
import { createClient } from "@supabase/supabase-js";
import { apiUrl } from "./api.js";

const form = document.getElementById("loginForm");
const emailEl = document.getElementById("loginEmail");
const passwordEl = document.getElementById("loginPassword");
const submitBtn = document.getElementById("loginSubmit");
const messageEl = document.getElementById("loginMessage");
const googleBtn = document.getElementById("loginGoogle");
const tabs = document.querySelectorAll(".login-tab");

let mode = "signin";
let sb = null;

function showMessage(text, kind = "info") {
  messageEl.textContent = text;
  messageEl.className = "login-message" + (kind === "error" ? " is-error" : kind === "ok" ? " is-ok" : "");
}

async function loadConfig() {
  try {
    const r = await fetch(apiUrl("/api/health"));
    const cfg = await r.json();
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      showMessage("Backend sem Supabase configurado.", "error");
      return null;
    }
    return cfg;
  } catch (err) {
    showMessage("Backend nao respondeu. Suba ele em outro terminal.", "error");
    return null;
  }
}

async function initAuth() {
  const cfg = await loadConfig();
  if (!cfg) return;

  sb = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const { data } = await sb.auth.getSession();
  if (data.session) {
    window.location.replace("/");
  }
}

// Tabs
for (const tab of tabs) {
  tab.addEventListener("click", () => {
    for (const t of tabs) t.classList.toggle("is-active", t === tab);
    mode = tab.dataset.tab;
    submitBtn.textContent = mode === "signin" ? "Entrar" : "Criar conta";
    passwordEl.autocomplete = mode === "signin" ? "current-password" : "new-password";
    showMessage("");
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!sb) return;
  showMessage("");
  submitBtn.disabled = true;
  submitBtn.textContent = mode === "signin" ? "Entrando..." : "Criando...";
  try {
    const email = emailEl.value.trim();
    const password = passwordEl.value;
    const fn = mode === "signin"
      ? sb.auth.signInWithPassword({ email, password })
      : sb.auth.signUp({ email, password });
    const { data, error } = await fn;
    if (error) {
      showMessage(error.message, "error");
    } else if (mode === "signup" && !data.session) {
      showMessage("Conta criada. Confirme seu email se exigido, ou faca login.", "ok");
    } else if (data.session) {
      window.location.replace("/");
    }
  } catch (err) {
    showMessage(err.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = mode === "signin" ? "Entrar" : "Criar conta";
  }
});

googleBtn.addEventListener("click", async () => {
  if (!sb) return;
  showMessage("");
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/" }
  });
  if (error) showMessage(error.message, "error");
});

initAuth();
