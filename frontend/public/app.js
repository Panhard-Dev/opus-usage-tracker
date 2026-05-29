import { apiUrl } from "./api.js";

// --- Auth wiring (boot.js exposes window.__auth__) ---
const AUTH = window.__auth__;
const sidebarEmail = document.querySelector("#sidebarUserEmail");
const btnLogout = document.querySelector("#btnLogout");

async function whoAmI() {
  if (!AUTH) return null;
  const r = await AUTH.apiFetch("/api/me");
  if (!r.ok) return null;
  return await r.json();
}
whoAmI().then((u) => { if (u && sidebarEmail) sidebarEmail.textContent = u.email; });
if (btnLogout && AUTH) {
  btnLogout.addEventListener("click", () => AUTH.signOut());
}

const healthStatus = document.querySelector("#healthStatus");
const todayRequests = document.querySelector("#todayRequests");
const inputTokens = document.querySelector("#inputTokens");
const outputTokens = document.querySelector("#outputTokens");
const todayCost = document.querySelector("#todayCost");
const avgLatency = document.querySelector("#avgLatency");
const totalCost = document.querySelector("#totalCost");
const requestList = document.querySelector("#requestList");
const demoForm = document.querySelector("#demoForm");
const demoModel = document.querySelector("#demoModel");
const demoPrompt = document.querySelector("#demoPrompt");
const demoResult = document.querySelector("#demoResult");
const baseUrlText = document.querySelector("#baseUrlText");
const nodeLabel = document.querySelector("#nodeLabel");
const modelCount = document.querySelector("#modelCount");
const modelsBody = document.querySelector("#modelsBody");
const modelsTotalLabel = document.querySelector("#modelsTotalLabel");
const catalogGrid = document.querySelector("#catalogGrid");
const modelModal = document.querySelector("#modelModal");
const modalInner = document.querySelector("#modalInner");
const modalClose = document.querySelector("#modalClose");
const exportLink = document.querySelector('a[href="/api/export.ndjson"]');

if (exportLink) exportLink.href = apiUrl("/api/export.ndjson");

const CATALOG = [
  {
    id: "claude",
    brand: "Anthropic",
    title: "Claude",
    studio: "Claude Studio",
    logo: "https://cdn.simpleicons.org/anthropic/ff6845",
    badge: "Active",
    desc: "Familia Opus / Sonnet / Haiku. Modelo padrao do tracker. Excelente para raciocinio, codigo e tool use.",
    tags: ["claude-opus-4-8", "claude-sonnet-4-6", "claude-haiku-4-5"],
    site: "https://www.anthropic.com",
    docs: "https://docs.anthropic.com",
    note: "Login via API key (console.anthropic.com).",
    models: [
      { id: "claude-opus-4-8", label: "Claude Opus 4.8" },
      { id: "claude-opus-4-7", label: "Claude Opus 4.7" },
      { id: "claude-opus-4-6", label: "Claude Opus 4.6" },
      { id: "claude-opus-4-5", label: "Claude Opus 4.5" },
      { id: "claude-opus-4-1", label: "Claude Opus 4.1" },
      { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
      { id: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
      { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" }
    ],
    connections: [],
    configured: true
  },
  {
    id: "gemini",
    brand: "Google",
    title: "Gemini",
    studio: "Gemini Studio",
    logo: "https://cdn.simpleicons.org/googlegemini/4f8cff",
    badge: "Multi",
    desc: "Gemini 2.5 Pro e Flash. Otimo contexto longo, multimodal nativo (imagem, video, audio).",
    tags: ["gemini-3.5-flash", "gemini-3.1-pro", "gemini-2.5-pro"],
    site: "https://deepmind.google/technologies/gemini/",
    docs: "https://ai.google.dev/gemini-api/docs",
    note: "Login web do aistudio.google.com com OAuth.",
    models: [
      { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
      { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview" },
      { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite" },
      { id: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" }
    ],
    connections: [],
    configured: false
  },
  {
    id: "qwen",
    brand: "Alibaba",
    title: "Qwen Studio",
    studio: "Qwen Studio",
    logo: "https://cdn.simpleicons.org/qwen/9b5cff",
    badge: "Open",
    desc: "Qwen3 e Qwen2.5 - open-weight, forte em codigo e raciocinio. Disponivel via DashScope ou self-host.",
    tags: ["qwen3-max", "qwen3.5-plus", "qwen3-coder-plus"],
    site: "https://qwen.ai",
    docs: "https://qwenlm.github.io/blog/",
    note: "Login web do chat.qwen.ai com OAuth/device code.",
    models: [
      { id: "qwen3-max", label: "Qwen3 Max" },
      { id: "qwen3.5-plus", label: "Qwen3.5 Plus" },
      { id: "qwen3.5-flash", label: "Qwen3.5 Flash" },
      { id: "qwen3-coder-plus", label: "Qwen3 Coder Plus" },
      { id: "qwen3-coder-flash", label: "Qwen3 Coder Flash" },
      { id: "qwen3-vl-plus", label: "Qwen3 VL Plus" },
      { id: "qwq-plus", label: "QwQ Plus" },
      { id: "qwen3-235b-a22b-instruct-2507", label: "Qwen3 235B Instruct" },
      { id: "qwen3-next-80b-a3b-thinking", label: "Qwen3 Next 80B Thinking" }
    ],
    connections: [],
    configured: false
  },
  {
    id: "codex",
    brand: "OpenAI",
    title: "Codex / GPT",
    studio: "OpenAI Studio",
    logo: "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231de9b6"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.682zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>`),
    badge: "Code",
    desc: "GPT-5 Codex e GPT-4.1. Foco em edicao e refactor de codigo, com tool use robusto.",
    tags: ["gpt-5.5", "gpt-5.5-pro", "gpt-5.3-codex"],
    site: "https://openai.com",
    docs: "https://platform.openai.com/docs",
    note: "Login via API key (platform.openai.com).",
    models: [
      { id: "gpt-5.5", label: "GPT-5.5" },
      { id: "gpt-5.5-pro", label: "GPT-5.5 Pro" },
      { id: "gpt-5.4", label: "GPT-5.4" },
      { id: "gpt-5.4-mini", label: "GPT-5.4 mini" },
      { id: "gpt-5.4-nano", label: "GPT-5.4 nano" },
      { id: "gpt-5.3-codex", label: "GPT-5.3 Codex" },
      { id: "gpt-5.2-codex", label: "GPT-5.2 Codex" },
      { id: "gpt-5.1-codex-max", label: "GPT-5.1 Codex Max" }
    ],
    connections: [],
    configured: false
  },
  {
    id: "deepseek",
    brand: "DeepSeek",
    title: "DeepSeek",
    studio: "DeepSeek Studio",
    logo: "https://cdn.simpleicons.org/deepseek/2f9bff",
    badge: "Reason",
    desc: "V3 e R1 - raciocinio com chain-of-thought visivel e custo muito baixo. Open-weight.",
    tags: ["deepseek-v4-pro", "deepseek-v4-flash", "deepseek-r1"],
    site: "https://www.deepseek.com",
    docs: "https://api-docs.deepseek.com",
    note: "Login via API key (platform.deepseek.com).",
    models: [
      { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro" },
      { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash" },
      { id: "deepseek-v3.2-exp", label: "DeepSeek V3.2 Exp" },
      { id: "deepseek-v3.1-terminus", label: "DeepSeek V3.1 Terminus" },
      { id: "deepseek-r1", label: "DeepSeek R1" }
    ],
    connections: [],
    configured: false
  },
  {
    id: "llama",
    brand: "Meta",
    title: "Llama",
    studio: "Llama Studio",
    logo: "https://cdn.simpleicons.org/meta/ffa726",
    badge: "Open",
    desc: "Llama 3.3 e Llama 4 - open-weight com forte ecossistema (Ollama, vLLM, Together, Groq).",
    tags: ["llama-4-maverick", "llama-4-scout", "llama-3.3-70b"],
    site: "https://llama.meta.com",
    docs: "https://www.llama.com/docs",
    note: "Self-host via Ollama/vLLM ou hosted via Together/Groq.",
    models: [
      { id: "meta-llama/Llama-4-Maverick-17B-128E-Instruct", label: "Llama 4 Maverick" },
      { id: "meta-llama/Llama-4-Scout-17B-16E-Instruct", label: "Llama 4 Scout" },
      { id: "meta-llama/Llama-3.3-70B-Instruct", label: "Llama 3.3 70B" },
      { id: "meta-llama/Llama-3.2-90B-Vision-Instruct", label: "Llama 3.2 90B Vision" },
      { id: "meta-llama/Llama-3.1-405B-Instruct", label: "Llama 3.1 405B" },
      { id: "meta-llama/Llama-Guard-3-8B", label: "Llama Guard 3 8B" }
    ],
    connections: [],
    configured: false
  }
];

const COMBOS_KEY = "combos-v2";
const COMBO_CONCURRENCY = 5;
let COMBOS = loadCombos();
let EDITING_COMBO_ID = null;
let COMBO_DRAFT = { models: [] }; // array of {id, role, system, skills}

function loadCombos() {
  try {
    const raw = JSON.parse(localStorage.getItem(COMBOS_KEY) || "[]");
    // migra v1 (models: string[]) -> v2 (models: {id, role, system, skills}[])
    return raw.map((c) => ({
      ...c,
      models: (c.models || []).map((m) =>
        typeof m === "string" ? { id: m, role: "", system: "", skills: [] } : m
      )
    }));
  } catch { return []; }
}

function persistCombos() {
  localStorage.setItem(COMBOS_KEY, JSON.stringify(COMBOS));
}

function findCatalogModel(modelId) {
  for (const p of CATALOG) {
    const m = p.models.find((x) => x.id === modelId);
    if (m) return { ...m, provider: p };
  }
  return null;
}

function providerColor(id) {
  const map = {
    claude: "#ff6845", gemini: "#4f8cff", qwen: "#9b5cff",
    codex: "#1de9b6", deepseek: "#2f9bff", llama: "#ffa726"
  };
  return map[id] || "#ff6845";
}

const SELECTED_MODELS = new Set(JSON.parse(localStorage.getItem("selected-models") || "[]"));
let LAST_PROVIDER_STATUS = {};

function persistSelected() {
  localStorage.setItem("selected-models", JSON.stringify([...SELECTED_MODELS]));
}

renderCatalog();

function renderCatalog() {
  catalogGrid.innerHTML = CATALOG.map((m) => `
    <button type="button" class="model-card" data-brand="${m.id}" data-id="${m.id}">
      <div class="model-card-head">
        <span class="model-logo">
          <img src="${m.logo}" alt="${escapeHtml(m.title)} logo" loading="lazy" />
        </span>
        <div class="model-card-meta">
          <span class="model-brand">${escapeHtml(m.brand)}</span>
          <span class="model-title">${escapeHtml(m.title)}</span>
        </div>
        <span class="model-badge">${escapeHtml(m.badge)}</span>
      </div>
      <p class="model-desc">${escapeHtml(m.desc)}</p>
      <div class="model-tags">
        ${m.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
      </div>
      <span class="model-status" data-status-for="${m.id}">
        <span class="status-dot"></span>
        <span class="status-text">verificando...</span>
      </span>
    </button>
  `).join("");

  for (const card of catalogGrid.querySelectorAll(".model-card")) {
    card.addEventListener("click", () => openModelModal(card.dataset.id));
  }
}

async function refreshProviderStatus() {
  try {
    const data = await fetch(apiUrl("/api/providers/status")).then((r) => r.json());
    LAST_PROVIDER_STATUS = {};
    for (const provider of data.providers) {
      LAST_PROVIDER_STATUS[provider.id] = provider;
      paintProviderStatus(provider);
    }
    if (modelModal.dataset.openId) {
      const current = data.providers.find((p) => p.id === modelModal.dataset.openId);
      if (current) paintModalStatus(current);
    }
  } catch (error) {
    console.error("provider status failed", error);
  }
}

function paintProviderStatus(provider) {
  const el = catalogGrid.querySelector(`[data-status-for="${provider.id}"]`);
  if (!el) return;
  el.classList.toggle("is-online", provider.online);
  el.classList.toggle("is-offline", !provider.online);
  el.querySelector(".status-text").textContent = provider.online
    ? `online - ${provider.latency_ms}ms`
    : `offline${provider.error ? " - " + provider.error : ""}`;
}

function openModelModal(id) {
  const model = CATALOG.find((m) => m.id === id);
  if (!model) return;

  modelModal.dataset.openId = id;
  modalInner.innerHTML = `
    <header class="provider-topbar">
      <nav class="provider-breadcrumb">
        <button type="button" class="crumb-link" data-modal-back>Providers</button>
        <span class="crumb-sep">&gt;</span>
        <span class="crumb-current">
          <img src="${model.logo}" alt="" class="crumb-logo" />
          <strong>${escapeHtml(model.studio)}</strong>
        </span>
      </nav>
      <span class="modal-status-pill" data-modal-status>
        <span class="status-dot"></span>
        <span class="status-text">verificando...</span>
      </span>
    </header>

    <section class="provider-hero" data-brand="${model.id}">
      <span class="provider-hero-logo">
        <img src="${model.logo}" alt="${escapeHtml(model.title)} logo" />
      </span>
      <div class="provider-hero-text">
        <h1>${escapeHtml(model.studio)}</h1>
        <span class="provider-hero-sub">${model.models.length} models</span>
      </div>
    </section>

    <section class="provider-card">
      <header class="provider-card-head">
        <h2>Available Models</h2>
        <button type="button" class="btn-ghost">Disable All</button>
      </header>

      <div class="available-models">
        ${model.models.map((m) => {
          const isSelected = SELECTED_MODELS.has(m.id);
          return `
          <div class="available-model${isSelected ? " is-selected" : ""}" data-model-id="${escapeHtml(m.id)}" data-provider="${model.id}">
            <span class="am-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v1h3a2 2 0 0 1 2 2v3h1a1 1 0 1 1 0 2h-1v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3H3a1 1 0 1 1 0-2h1V8a2 2 0 0 1 2-2h3V5a3 3 0 0 1 3-3zm-3 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>
            </span>
            <div class="am-text">
              <span class="am-id">${escapeHtml(m.id)}</span>
              <span class="am-label">${escapeHtml(m.label)}</span>
            </div>
            <span class="am-status" data-am-status></span>
            <button type="button" class="am-test" data-test="${escapeHtml(m.id)}" aria-label="Testar conexao" title="Testar conexao">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 2a8 8 0 1 1-5.3 14l-3 3-1.4-1.4 3-3A8 8 0 0 1 10 2zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 10 4z"/></svg>
            </button>
            <button type="button" class="am-copy" data-copy="${escapeHtml(m.id)}" aria-label="Copy">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
          </div>
        `;
        }).join("")}
      </div>
    </section>
  `;

  modalInner.querySelector("[data-modal-back]").addEventListener("click", closeModal);
  for (const btn of modalInner.querySelectorAll("[data-copy]")) {
    btn.addEventListener("click", async (event) => {
      event.stopPropagation();
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.classList.add("is-copied");
        setTimeout(() => btn.classList.remove("is-copied"), 1200);
      } catch {}
    });
  }

  for (const row of modalInner.querySelectorAll(".available-model")) {
    row.addEventListener("click", () => {
      const id = row.dataset.modelId;
      if (SELECTED_MODELS.has(id)) {
        SELECTED_MODELS.delete(id);
        row.classList.remove("is-selected");
      } else {
        SELECTED_MODELS.add(id);
        row.classList.add("is-selected");
      }
      persistSelected();
    });
  }

  for (const btn of modalInner.querySelectorAll("[data-test]")) {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const row = btn.closest(".available-model");
      testModelConnection(row, model);
    });
  }

  modelModal.classList.remove("is-hidden");
  modelModal.scrollTop = 0;
  document.body.classList.add("no-scroll");

  const cachedEl = catalogGrid.querySelector(`[data-status-for="${id}"]`);
  if (cachedEl) {
    const online = cachedEl.classList.contains("is-online");
    paintModalStatus({ online, latency_ms: null, error: null, _placeholder: true, text: cachedEl.querySelector(".status-text").textContent });
  }
}

async function testModelConnection(row, provider) {
  if (!row) return;
  const modelId = row.dataset.modelId;
  row.classList.remove("is-active", "is-inactive");
  row.classList.add("is-testing");
  const statusEl = row.querySelector("[data-am-status]");
  if (statusEl) statusEl.textContent = "testing...";

  try {
    const result = await fetch(apiUrl("/api/test-model"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: modelId })
    }).then((r) => r.json());

    row.classList.remove("is-testing");
    row.classList.toggle("is-active", !!result.ok);
    row.classList.toggle("is-inactive", !result.ok);

    if (statusEl) {
      if (result.ok) {
        statusEl.textContent = `active - ${result.latency_ms}ms`;
        statusEl.title = "";
      } else {
        const short = shortErrorLabel(result);
        statusEl.textContent = short;
        statusEl.title = result.message || result.error || `HTTP ${result.status}`;
      }
    }
  } catch (error) {
    row.classList.remove("is-testing");
    row.classList.add("is-inactive");
    if (statusEl) {
      statusEl.textContent = "erro";
      statusEl.title = error.message;
    }
  }
}

function shortErrorLabel(result) {
  const msg = String(result.message || result.error || "").toLowerCase();
  if (result.status === 404 || /not.?found|invalid|unknown.?model|does not exist/.test(msg)) {
    return "modelo nao existe";
  }
  if (result.status === 401 || result.status === 403) return "auth";
  if (result.error === "timeout") return "modelo nao existe";
  if (result.status >= 500) return `erro ${result.status}`;
  if (result.status === 0) return "offline";
  return `erro ${result.status}`;
}

function renderConnectionRow(c) {
  return `
    <div class="connection-row">
      <div class="connection-order">
        <button type="button" class="ord-btn" aria-label="up">^</button>
        <button type="button" class="ord-btn" aria-label="down">v</button>
      </div>
      <span class="connection-lock" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 1a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v3h6V6a3 3 0 0 0-3-3z"/></svg>
      </span>
      <div class="connection-info">
        <span class="connection-email">${escapeHtml(c.email)}</span>
        <div class="connection-meta">
          <span class="connection-active">&bull; ${escapeHtml(c.status)}</span>
          <span class="connection-index">#${c.index}</span>
        </div>
      </div>
      <div class="connection-actions">
        <button type="button" class="conn-btn" title="Edit">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M20.7 7l-3.7-3.7-1.4 1.4L19.3 8.5 20.7 7zM3 17.2V21h3.8L17.8 10 14 6.2 3 17.2z"/></svg>
          <span>Edit</span>
        </button>
        <button type="button" class="conn-btn danger" title="Delete">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 7h12l-1 14H7L6 7zm3-4h6l1 2h4v2H4V5h4l1-2z"/></svg>
          <span>Delete</span>
        </button>
        <label class="toggle"><input type="checkbox" checked /><span class="toggle-track orange"></span></label>
      </div>
    </div>
  `;
}

function paintModalStatus(provider) {
  const pill = modalInner.querySelector("[data-modal-status]");
  if (!pill) return;
  pill.classList.toggle("is-online", provider.online);
  pill.classList.toggle("is-offline", !provider.online);
  pill.querySelector(".status-text").textContent = provider._placeholder
    ? provider.text
    : (provider.online ? `online - ${provider.latency_ms}ms` : `offline${provider.error ? " - " + provider.error : ""}`);
}

function closeModal() {
  modelModal.classList.add("is-hidden");
  delete modelModal.dataset.openId;
  document.body.classList.remove("no-scroll");
}

modalClose.addEventListener("click", closeModal);
modelModal.addEventListener("click", (event) => {
  if (event.target === modelModal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modelModal.classList.contains("is-hidden")) closeModal();
});

refreshProviderStatus();
setInterval(refreshProviderStatus, 30000);

// ----- Neural canvas (rede neural animada) -----

(function neuralInit() {
  const canvas = document.querySelector("#neuralCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let DPR = Math.max(1, window.devicePixelRatio || 1);
  let W = 0, H = 0;

  // logos cacheadas
  const logoCache = {};
  function loadLogo(src) {
    if (logoCache[src]) return logoCache[src];
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    logoCache[src] = img;
    return img;
  }

  // SVG inline do OpenAI -> blob
  const openaiSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231de9b6"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073z"/></svg>`;
  const openaiUrl = "data:image/svg+xml;utf8," + openaiSvg;

  const providers = [
    { id: "claude",   color: "#ff6845", logo: "https://cdn.simpleicons.org/anthropic/ff6845" },
    { id: "gemini",   color: "#4f8cff", logo: "https://cdn.simpleicons.org/googlegemini/4f8cff" },
    { id: "qwen",     color: "#9b5cff", logo: "https://cdn.simpleicons.org/qwen/9b5cff" },
    { id: "codex",    color: "#1de9b6", logo: openaiUrl },
    { id: "deepseek", color: "#2f9bff", logo: "https://cdn.simpleicons.org/deepseek/2f9bff" },
    { id: "llama",    color: "#ffa726", logo: "https://cdn.simpleicons.org/meta/ffa726" }
  ];
  providers.forEach((p) => { p.img = loadLogo(p.logo); });

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  // nós em volta do centro
  function getNodes() {
    const cx = W / 2;
    const cy = H / 2 + 4;
    const rx = Math.min(W * 0.36, 230);
    const ry = Math.min(H * 0.30, 110);
    return providers.map((p, i) => {
      const angle = (i / providers.length) * Math.PI * 2 - Math.PI / 2;
      return {
        ...p,
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry,
        baseAngle: angle
      };
    });
  }

  // partículas que viajam do nó pro centro
  const particles = [];
  function spawnParticle(nodes, t) {
    const node = nodes[Math.floor(Math.random() * nodes.length)];
    const direction = Math.random() < 0.5 ? 1 : -1; // 1 = pro centro, -1 = saindo
    particles.push({
      from: direction === 1 ? { x: node.x, y: node.y } : { x: W / 2, y: H / 2 + 4 },
      to:   direction === 1 ? { x: W / 2, y: H / 2 + 4 } : { x: node.x, y: node.y },
      color: node.color,
      t: 0,
      speed: 0.008 + Math.random() * 0.014
    });
  }

  // hover
  let mouse = { x: -9999, y: -9999 };
  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener("mouseleave", () => { mouse.x = -9999; });

  // click no nó -> abre modal do provider
  canvas.style.pointerEvents = "auto";
  canvas.addEventListener("click", (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    const nodes = getNodes();
    for (const n of nodes) {
      const dx = mx - n.x;
      const dy = my - n.y;
      if (dx * dx + dy * dy < 28 * 28) {
        const modelsBtn = document.querySelector('.nav-item[data-view="models"]');
        if (modelsBtn) modelsBtn.click();
        setTimeout(() => openModelModal(n.id), 80);
        return;
      }
    }
  });

  let lastSpawn = 0;
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    const nodes = getNodes();
    const cx = W / 2;
    const cy = H / 2 + 4;

    // spawn de particulas
    if (t - lastSpawn > 220) {
      spawnParticle(nodes, t);
      lastSpawn = t;
    }

    // linhas dos nodes ao centro
    for (const n of nodes) {
      const isHover = Math.hypot(mouse.x - n.x, mouse.y - n.y) < 30;
      const grad = ctx.createLinearGradient(n.x, n.y, cx, cy);
      grad.addColorStop(0, hexA(n.color, isHover ? 0.6 : 0.28));
      grad.addColorStop(1, "rgba(255, 104, 69, 0.05)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = isHover ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(n.x, n.y);
      ctx.lineTo(cx, cy);
      ctx.stroke();
    }

    // particulas
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.t += p.speed;
      if (p.t >= 1) { particles.splice(i, 1); continue; }
      const ease = p.t * p.t * (3 - 2 * p.t);
      const x = p.from.x + (p.to.x - p.from.x) * ease;
      const y = p.from.y + (p.to.y - p.from.y) * ease;
      const alpha = Math.sin(p.t * Math.PI);
      ctx.beginPath();
      ctx.arc(x, y, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = hexA(p.color, 0.9 * alpha);
      ctx.fill();
      // trail
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = hexA(p.color, 0.18 * alpha);
      ctx.fill();
    }

    // nodes (logo)
    for (const n of nodes) {
      const pulse = Math.sin((t / 600) + n.baseAngle) * 1.2;
      const r = 22 + pulse;

      // glow
      const glowGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.2);
      glowGrad.addColorStop(0, hexA(n.color, 0.35));
      glowGrad.addColorStop(1, hexA(n.color, 0));
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // circulo de fundo
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = "#181818";
      ctx.fill();
      ctx.strokeStyle = n.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // logo
      if (n.img && n.img.complete && n.img.naturalWidth) {
        const size = r * 1.05;
        try {
          ctx.drawImage(n.img, n.x - size / 2, n.y - size / 2, size, size);
        } catch {}
      }
    }

    // nucleo central pulsante (Opus 4.7)
    const corePulse = 1 + Math.sin(t / 500) * 0.06;
    const coreR = 38 * corePulse;

    // halos expandindo
    for (let i = 0; i < 3; i++) {
      const phase = ((t / 1400) + i / 3) % 1;
      const haloR = coreR + phase * 50;
      ctx.beginPath();
      ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
      ctx.strokeStyle = hexA("#ff6845", (1 - phase) * 0.35);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // glow centro
    const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.5);
    cGrad.addColorStop(0, "rgba(255, 104, 69, 0.5)");
    cGrad.addColorStop(1, "rgba(255, 104, 69, 0)");
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // circulo principal
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    const coreFill = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
    coreFill.addColorStop(0, "#ff8a65");
    coreFill.addColorStop(1, "#c84528");
    ctx.fillStyle = coreFill;
    ctx.fill();
    ctx.strokeStyle = "#ff6845";
    ctx.lineWidth = 2;
    ctx.stroke();

    // dot central
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function hexA(hex, a) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
})();

// ------- Combos -------

const combosList = document.querySelector("#combosList");
const comboModal = document.querySelector("#comboModal");
const comboModalClose = document.querySelector("#comboModalClose");
const comboFormBack = document.querySelector("#comboFormBack");
const comboModalTitle = document.querySelector("#comboModalTitle");
const comboCreateBtn = document.querySelector("#comboCreateBtn");
const comboName = document.querySelector("#comboName");
const comboDesc = document.querySelector("#comboDesc");
const comboPicker = document.querySelector("#comboPicker");
const comboCountLabel = document.querySelector("#comboCountLabel");
const comboCancel = document.querySelector("#comboCancel");
const comboSave = document.querySelector("#comboSave");

function renderCombos() {
  if (!COMBOS.length) {
    combosList.innerHTML = `
      <div class="combos-empty">
        <div class="combos-empty-icon">+</div>
        <h3>Nenhum combo ainda</h3>
        <p>Crie seu primeiro combo agrupando modelos para enviar a mesma pergunta a varios providers de uma vez.</p>
      </div>
    `;
    return;
  }

  combosList.innerHTML = `<div class="combos-grid">${COMBOS.map((c) => renderComboCard(c)).join("")}</div>`;

  for (const btn of combosList.querySelectorAll("[data-combo-run]")) {
    btn.addEventListener("click", (e) => { e.stopPropagation(); openComboRunner(btn.dataset.comboRun); });
  }
  for (const btn of combosList.querySelectorAll("[data-combo-edit]")) {
    btn.addEventListener("click", (e) => { e.stopPropagation(); openComboModal(btn.dataset.comboEdit); });
  }
  for (const btn of combosList.querySelectorAll("[data-combo-del]")) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.comboDel;
      const combo = COMBOS.find((c) => c.id === id);
      if (combo && confirm(`Apagar combo "${combo.name}"?`)) {
        COMBOS = COMBOS.filter((c) => c.id !== id);
        persistCombos();
        renderCombos();
      }
    });
  }
}

function renderComboCard(combo) {
  const items = combo.models.map((m) => ({ ...m, info: findCatalogModel(m.id) })).filter((x) => x.info);
  return `
    <article class="combo-card">
      <header class="combo-card-head">
        <div>
          <h3>${escapeHtml(combo.name)}</h3>
          ${combo.desc ? `<p class="combo-card-desc">${escapeHtml(combo.desc)}</p>` : ""}
        </div>
        <div class="combo-card-actions">
          <button type="button" class="conn-btn" data-combo-run="${combo.id}" title="Executar">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <span>Executar</span>
          </button>
          <button type="button" class="conn-btn" data-combo-edit="${combo.id}" title="Editar">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M20.7 7l-3.7-3.7-1.4 1.4L19.3 8.5 20.7 7zM3 17.2V21h3.8L17.8 10 14 6.2 3 17.2z"/></svg>
            <span>Editar</span>
          </button>
          <button type="button" class="conn-btn danger" data-combo-del="${combo.id}" title="Apagar">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 7h12l-1 14H7L6 7zm3-4h6l1 2h4v2H4V5h4l1-2z"/></svg>
            <span>Apagar</span>
          </button>
        </div>
      </header>

      <div class="combo-card-models">
        ${items.length
          ? items.map((m) => `
              <span class="combo-chip" style="--c:${providerColor(m.info.provider.id)}" title="${m.role ? escapeHtml(m.role) : ""}">
                <img src="${m.info.provider.logo}" alt="" />
                <span>${escapeHtml(m.info.label)}${m.role ? ` &middot; ${escapeHtml(m.role)}` : ""}</span>
              </span>
            `).join("")
          : `<span class="combo-empty-models">Sem modelos selecionados</span>`
        }
      </div>

      <footer class="combo-card-footer">
        <span>${items.length} modelo${items.length === 1 ? "" : "s"} &middot; concorrencia ${COMBO_CONCURRENCY}</span>
        <span class="combo-card-meta">criado em ${new Date(combo.createdAt).toLocaleDateString("pt-BR")}</span>
      </footer>
    </article>
  `;
}

function openComboModal(editId) {
  EDITING_COMBO_ID = editId || null;
  const existing = editId ? COMBOS.find((c) => c.id === editId) : null;

  comboName.value = existing?.name || "";
  comboDesc.value = existing?.desc || "";
  COMBO_DRAFT = {
    models: existing
      ? existing.models.map((m) => ({ ...m, skills: [...(m.skills || [])] }))
      : []
  };
  comboModalTitle.textContent = existing ? `Editar: ${existing.name}` : "Novo combo";

  renderComboPicker();
  renderComboConfigs();
  updateComboCount();

  comboModal.classList.remove("is-hidden");
  comboModal.scrollTop = 0;
  document.body.classList.add("no-scroll");
}

function closeComboModal() {
  comboModal.classList.add("is-hidden");
  document.body.classList.remove("no-scroll");
  EDITING_COMBO_ID = null;
}

function isModelInDraft(id) {
  return COMBO_DRAFT.models.some((m) => m.id === id);
}

function toggleModelInDraft(id) {
  const idx = COMBO_DRAFT.models.findIndex((m) => m.id === id);
  if (idx >= 0) COMBO_DRAFT.models.splice(idx, 1);
  else COMBO_DRAFT.models.push({ id, role: "", system: "", skills: [] });
}

function renderComboPicker() {
  comboPicker.innerHTML = CATALOG.map((p) => `
    <div class="combo-picker-group">
      <header class="combo-picker-head">
        <span class="combo-picker-logo" style="--c:${providerColor(p.id)}">
          <img src="${p.logo}" alt="" />
        </span>
        <h4>${escapeHtml(p.title)}</h4>
      </header>
      <div class="combo-picker-models">
        ${p.models.map((m) => {
          const checked = isModelInDraft(m.id);
          return `
            <label class="combo-pick${checked ? " is-checked" : ""}">
              <input type="checkbox" data-pick="${escapeHtml(m.id)}" ${checked ? "checked" : ""} />
              <span class="combo-pick-box"></span>
              <div class="combo-pick-text">
                <span class="combo-pick-id">${escapeHtml(m.id)}</span>
                <span class="combo-pick-label">${escapeHtml(m.label)}</span>
              </div>
            </label>
          `;
        }).join("")}
      </div>
    </div>
  `).join("");

  for (const input of comboPicker.querySelectorAll("[data-pick]")) {
    input.addEventListener("change", () => {
      toggleModelInDraft(input.dataset.pick);
      input.closest(".combo-pick").classList.toggle("is-checked", input.checked);
      renderComboConfigs();
      updateComboCount();
    });
  }
}

function renderComboConfigs() {
  const host = document.querySelector("#comboConfigs");
  if (!host) return;
  if (!COMBO_DRAFT.models.length) {
    host.innerHTML = `<div class="combo-config-empty">Selecione modelos acima para configurar.</div>`;
    return;
  }

  host.innerHTML = COMBO_DRAFT.models.map((m, idx) => {
    const info = findCatalogModel(m.id);
    if (!info) return "";
    return `
      <div class="combo-config" data-idx="${idx}" style="--c:${providerColor(info.provider.id)}">
        <header class="combo-config-head">
          <span class="combo-config-logo"><img src="${info.provider.logo}" alt="" /></span>
          <div class="combo-config-title">
            <strong>${escapeHtml(info.label)}</strong>
            <span>${escapeHtml(info.id)}</span>
          </div>
          <button type="button" class="conn-btn danger" data-remove="${idx}" title="Remover">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 7h12l-1 14H7L6 7zm3-4h6l1 2h4v2H4V5h4l1-2z"/></svg>
            <span>Remover</span>
          </button>
        </header>

        <div class="combo-config-grid">
          <label class="combo-field">
            <span>Papel / Role</span>
            <input data-field="role" data-idx="${idx}" value="${escapeHtml(m.role || "")}" placeholder="ex: revisor de codigo, redator, analista" autocomplete="off" />
          </label>
          <label class="combo-field">
            <span>Skills obrigatorias (Enter para adicionar)</span>
            <input data-field="skill-input" data-idx="${idx}" placeholder="ex: code, vision, tool-use" autocomplete="off" />
          </label>
        </div>

        <div class="combo-skills" data-skills="${idx}">
          ${(m.skills || []).map((s, sidx) => `
            <span class="skill-tag">
              ${escapeHtml(s)}
              <button type="button" data-skill-remove="${idx}-${sidx}" aria-label="Remover skill">x</button>
            </span>
          `).join("")}
        </div>

        <label class="combo-field">
          <span>System prompt (instrucoes para esse modelo)</span>
          <textarea data-field="system" data-idx="${idx}" rows="3" placeholder="ex: Voce e um especialista em X. Responda sempre em portugues. Seja conciso.">${escapeHtml(m.system || "")}</textarea>
        </label>
      </div>
    `;
  }).join("");

  // remover modelo
  for (const btn of host.querySelectorAll("[data-remove]")) {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.remove);
      COMBO_DRAFT.models.splice(idx, 1);
      renderComboPicker();
      renderComboConfigs();
      updateComboCount();
    });
  }

  // role / system inputs
  for (const el of host.querySelectorAll("[data-field='role'], [data-field='system']")) {
    el.addEventListener("input", () => {
      const idx = Number(el.dataset.idx);
      COMBO_DRAFT.models[idx][el.dataset.field] = el.value;
    });
  }

  // skill add
  for (const input of host.querySelectorAll("[data-field='skill-input']")) {
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== ",") return;
      e.preventDefault();
      const val = input.value.trim().replace(/,$/, "").toLowerCase();
      if (!val) return;
      const idx = Number(input.dataset.idx);
      if (!COMBO_DRAFT.models[idx].skills.includes(val)) {
        COMBO_DRAFT.models[idx].skills.push(val);
      }
      input.value = "";
      renderComboConfigs();
      // re-focus mantem o flow
      const next = host.querySelector(`[data-field="skill-input"][data-idx="${idx}"]`);
      if (next) next.focus();
    });
  }

  // skill remove
  for (const btn of host.querySelectorAll("[data-skill-remove]")) {
    btn.addEventListener("click", () => {
      const [idx, sidx] = btn.dataset.skillRemove.split("-").map(Number);
      COMBO_DRAFT.models[idx].skills.splice(sidx, 1);
      renderComboConfigs();
    });
  }
}

function updateComboCount() {
  const n = COMBO_DRAFT.models.length;
  comboCountLabel.textContent = `${n} selecionado${n === 1 ? "" : "s"}`;
}

function saveCombo() {
  const name = comboName.value.trim();
  if (!name) { comboName.focus(); return; }
  if (!COMBO_DRAFT.models.length) { alert("Selecione ao menos um modelo."); return; }

  const desc = comboDesc.value.trim();
  const models = COMBO_DRAFT.models.map((m) => ({
    id: m.id,
    role: m.role || "",
    system: m.system || "",
    skills: [...(m.skills || [])]
  }));

  if (EDITING_COMBO_ID) {
    const c = COMBOS.find((x) => x.id === EDITING_COMBO_ID);
    if (c) { c.name = name; c.desc = desc; c.models = models; c.updatedAt = Date.now(); }
  } else {
    COMBOS.unshift({
      id: `combo-${Date.now().toString(36)}`,
      name, desc, models,
      createdAt: Date.now()
    });
  }
  persistCombos();
  closeComboModal();
  renderCombos();
}

// -------- Combo runner (executor) --------

function openComboRunner(comboId) {
  const combo = COMBOS.find((c) => c.id === comboId);
  if (!combo) return;
  const runner = document.querySelector("#comboRunner");
  const runnerInner = document.querySelector("#comboRunnerInner");

  runnerInner.innerHTML = `
    <header class="provider-topbar">
      <nav class="provider-breadcrumb">
        <button type="button" class="crumb-link" id="runnerBack">Combos</button>
        <span class="crumb-sep">&gt;</span>
        <span class="crumb-current"><strong>Executar: ${escapeHtml(combo.name)}</strong></span>
      </nav>
      <span class="modal-status-pill"><span class="status-dot"></span><span>${combo.models.length} modelos &middot; concorrencia ${COMBO_CONCURRENCY}</span></span>
    </header>

    <section class="provider-card">
      <header class="provider-card-head">
        <h2>Prompt</h2>
        <span class="combo-count">enter envia (shift+enter quebra linha)</span>
      </header>
      <textarea id="runnerPrompt" class="runner-prompt" rows="4" placeholder="Digite a pergunta para enviar a todos os modelos do combo..."></textarea>
      <div class="combo-actions">
        <span class="runner-info" id="runnerInfo">${combo.models.length} modelos prontos</span>
        <button type="button" class="btn-add" id="runnerSend">
          <svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align:-2px"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          Executar em paralelo
        </button>
      </div>
    </section>

    <section class="runner-grid" id="runnerGrid">
      ${combo.models.map((m, idx) => {
        const info = findCatalogModel(m.id);
        if (!info) return "";
        return `
          <article class="runner-col" data-col="${idx}" style="--c:${providerColor(info.provider.id)}">
            <header class="runner-col-head">
              <span class="runner-col-logo"><img src="${info.provider.logo}" alt="" /></span>
              <div class="runner-col-title">
                <strong>${escapeHtml(info.label)}</strong>
                ${m.role ? `<span class="runner-col-role">${escapeHtml(m.role)}</span>` : `<span class="runner-col-role muted">sem role</span>`}
              </div>
              <span class="runner-col-status" data-status>idle</span>
            </header>
            ${(m.skills || []).length ? `
              <div class="combo-skills">
                ${m.skills.map((s) => `<span class="skill-tag is-mini">${escapeHtml(s)}</span>`).join("")}
              </div>
            ` : ""}
            <pre class="runner-col-output" data-output>Aguardando prompt...</pre>
            <footer class="runner-col-footer">
              <span data-latency></span>
              <span data-tokens></span>
            </footer>
          </article>
        `;
      }).join("")}
    </section>
  `;

  runner.classList.remove("is-hidden");
  document.body.classList.add("no-scroll");

  document.querySelector("#runnerBack").addEventListener("click", closeComboRunner);
  const sendBtn = document.querySelector("#runnerSend");
  const promptEl = document.querySelector("#runnerPrompt");
  sendBtn.addEventListener("click", () => executeCombo(combo));
  promptEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      executeCombo(combo);
    }
  });
  promptEl.focus();
}

function closeComboRunner() {
  document.querySelector("#comboRunner").classList.add("is-hidden");
  document.body.classList.remove("no-scroll");
}

async function executeCombo(combo) {
  const prompt = document.querySelector("#runnerPrompt").value.trim();
  if (!prompt) return;
  const sendBtn = document.querySelector("#runnerSend");
  const info = document.querySelector("#runnerInfo");
  sendBtn.disabled = true;
  info.textContent = `executando em batches de ${COMBO_CONCURRENCY}...`;

  // reset cols
  document.querySelectorAll(".runner-col").forEach((col) => {
    col.querySelector("[data-output]").textContent = "Aguardando slot na fila...";
    col.querySelector("[data-status]").textContent = "queued";
    col.querySelector("[data-status]").className = "runner-col-status is-queued";
    col.querySelector("[data-latency]").textContent = "";
    col.querySelector("[data-tokens]").textContent = "";
  });

  let completed = 0;
  await runWithConcurrency(combo.models, COMBO_CONCURRENCY, async (m, idx) => {
    const col = document.querySelector(`.runner-col[data-col="${idx}"]`);
    const output = col.querySelector("[data-output]");
    const status = col.querySelector("[data-status]");
    const lat = col.querySelector("[data-latency]");
    const tok = col.querySelector("[data-tokens]");
    status.textContent = "running...";
    status.className = "runner-col-status is-running";
    output.textContent = "...";

    const systemParts = [];
    if (m.role) systemParts.push(`Voce atua como: ${m.role}.`);
    if ((m.skills || []).length) systemParts.push(`Skills obrigatorias: ${m.skills.join(", ")}.`);
    if (m.system) systemParts.push(m.system);
    const system = systemParts.join("\n");

    try {
      const r = await fetch(apiUrl("/api/combo-call"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model: m.id, system, prompt, max_tokens: 600 })
      }).then((x) => x.json());

      if (r.ok) {
        output.textContent = r.content || "(sem conteudo)";
        status.textContent = `ok ${r.status}`;
        status.className = "runner-col-status is-ok";
      } else {
        output.textContent = `[erro] ${r.error || r.status}\n${r.message || ""}`;
        status.textContent = r.error || `erro ${r.status}`;
        status.className = "runner-col-status is-err";
      }
      lat.textContent = `${r.latency_ms}ms`;
      if (r.usage) {
        const i = r.usage.input_tokens || 0;
        const o = r.usage.output_tokens || 0;
        tok.textContent = `${i} in / ${o} out`;
      }
    } catch (error) {
      output.textContent = `[erro de rede] ${error.message}`;
      status.textContent = "fetch_failed";
      status.className = "runner-col-status is-err";
    } finally {
      completed += 1;
      info.textContent = `${completed} / ${combo.models.length} concluidos`;
    }
  });

  sendBtn.disabled = false;
  info.textContent = `concluido (${combo.models.length} modelos)`;
}

async function runWithConcurrency(items, limit, fn) {
  const queue = items.map((item, idx) => ({ item, idx }));
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) {
      const next = queue.shift();
      if (!next) return;
      await fn(next.item, next.idx);
    }
  });
  await Promise.all(workers);
}

comboCreateBtn.addEventListener("click", () => openComboModal(null));
document.querySelector("#comboRunnerClose").addEventListener("click", closeComboRunner);
document.querySelector("#comboRunner").addEventListener("click", (e) => {
  if (e.target.id === "comboRunner") closeComboRunner();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !document.querySelector("#comboRunner").classList.contains("is-hidden")) closeComboRunner();
});
comboModalClose.addEventListener("click", closeComboModal);
comboFormBack.addEventListener("click", closeComboModal);
comboCancel.addEventListener("click", closeComboModal);
comboSave.addEventListener("click", saveCombo);
comboModal.addEventListener("click", (e) => { if (e.target === comboModal) closeComboModal(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !comboModal.classList.contains("is-hidden")) closeComboModal();
});

renderCombos();

baseUrlText.textContent = window.location.origin;

const views = document.querySelectorAll(".view");
const navButtons = document.querySelectorAll(".nav-item[data-view]");
for (const button of navButtons) {
  button.addEventListener("click", () => {
    const target = button.dataset.view;
    for (const item of navButtons) item.classList.toggle("is-active", item === button);
    for (const view of views) {
      const visible = view.dataset.view === target;
      view.classList.toggle("is-hidden", !visible);
      if (visible) {
        // re-trigger animacao de entrada
        view.style.animation = "none";
        void view.offsetHeight;
        view.style.animation = "";
        // forca qualquer .reveal preso a aparecer
        for (const r of view.querySelectorAll(".reveal:not(.is-revealed)")) {
          r.classList.add("is-revealed");
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        queueReveal(view);
      }
    }
  });
}

// ----- Scroll Reveal -----
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-revealed");
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });

function queueReveal(scope = document) {
  // so revela coisas que ESTAO ABAIXO do viewport - acima de tudo ja entra revelado
  const selectors = [
    ".bottom-grid > article",
    ".combos-grid .combo-card",
    ".runner-grid .runner-col"
  ];
  for (const sel of selectors) {
    for (const el of scope.querySelectorAll(sel)) {
      if (el.classList.contains("is-revealed") || el.dataset.reveal) continue;

      // se ja esta visivel no viewport, marca como revelado direto (sem animacao escondendo)
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        el.classList.add("is-revealed");
        el.dataset.reveal = "1";
        continue;
      }

      el.dataset.reveal = "1";
      el.classList.add("reveal");
      revealObserver.observe(el);
    }
  }
}

// observa quando catalogo / combos / runner renderizam novos elementos tambem
const mo = new MutationObserver(() => queueReveal());
mo.observe(document.body, { childList: true, subtree: true });

queueReveal();

demoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = demoForm.querySelector("button");
  button.disabled = true;
  demoResult.textContent = "Sending request...";

  try {
    const response = await fetch(apiUrl("/api/demo"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: demoModel.value.trim() || "claude-opus-4-7",
        prompt: demoPrompt.value.trim() || "Responda exatamente: ok",
        max_tokens: 120
      })
    });
    const text = await response.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
    demoResult.textContent = JSON.stringify(payload, null, 2);
    await refresh();
  } catch (error) {
    demoResult.textContent = `Error: ${error.message}`;
  } finally {
    button.disabled = false;
  }
});

for (const button of document.querySelectorAll(".tab, .range")) {
  button.addEventListener("click", () => {
    const group = button.classList.contains("tab") ? ".tab" : ".range";
    for (const item of document.querySelectorAll(group)) item.classList.remove("is-active");
    button.classList.add("is-active");
  });
}

async function refresh() {
  try {
    const [health, stats] = await Promise.all([
      fetch(apiUrl("/api/health")).then((response) => response.json()),
      fetch(apiUrl("/api/stats")).then((response) => response.json())
    ]);
    renderHealth(health);
    renderStats(stats);
  } catch (error) {
    healthStatus.innerHTML = `<span class="status-dot"></span><span>offline</span>`;
    console.error(error);
  }
}

function renderHealth(health) {
  healthStatus.innerHTML = `<span class="status-dot online"></span><span>${escapeHtml(health.defaultModel)}</span>`;
}

function renderStats(stats) {
  todayRequests.textContent = formatNumber(stats.today.requests);
  inputTokens.textContent = formatNumber(contextTokens(stats.today));
  outputTokens.textContent = formatNumber(stats.today.output_tokens);
  todayCost.textContent = `~${formatUsd(stats.today.estimated_usd)}`;
  avgLatency.textContent = `${formatNumber(stats.totals.avg_latency_ms)}ms`;
  totalCost.textContent = formatUsd(stats.totals.estimated_usd);
  modelCount.textContent = `${stats.byModel.length} models`;

  const topModel = stats.byModel[0]?.label || stats.config.defaultModel;
  nodeLabel.textContent = shortModelName(topModel);
  renderRequests(stats.recent);
  renderModels(stats.byModel);
}

function renderModels(byModel) {
  modelsTotalLabel.textContent = `${byModel.length} model${byModel.length === 1 ? "" : "s"}`;

  if (!byModel.length) {
    modelsBody.innerHTML = `<div class="models-empty">Nenhum modelo registrado ainda.</div>`;
    return;
  }

  modelsBody.innerHTML = byModel
    .map((model) => {
      const requests = model.requests || 0;
      const input = Number(model.input_tokens || 0);
      const output = Number(model.output_tokens || 0);
      const cache = Number(model.cache_read_input_tokens || 0) + Number(model.cache_creation_input_tokens || 0);
      const cost = Number(model.estimated_usd || 0);
      const label = model.label || "unknown";
      return `
        <div class="models-row" role="row" title="${escapeHtml(label)}">
          <div class="model-name" role="cell"><span>${escapeHtml(label)}</span></div>
          <div role="cell">${formatNumber(requests)}</div>
          <div class="cell-in" role="cell">${compact(input)}</div>
          <div class="cell-out" role="cell">${compact(output)}</div>
          <div class="cell-cache" role="cell">${compact(cache)}</div>
          <div class="cell-cost" role="cell">${formatUsd(cost)}</div>
        </div>
      `;
    })
    .join("");
}

function renderRequests(recent) {
  if (!recent.length) {
    requestList.innerHTML = `<div class="request-empty">Nenhuma request ainda</div>`;
    return;
  }

  requestList.innerHTML = recent
    .slice(0, 42)
    .map((event) => {
      const usage = event.usage || {};
      const input = Number(usage.input_tokens || 0);
      const output = Number(usage.output_tokens || 0);
      const cache = Number(usage.cache_read_input_tokens || 0) + Number(usage.cache_creation_input_tokens || 0);
      const context = input + cache;
      const model = event.returned_model || event.requested_model || "unknown";
      const ago = timeAgo(new Date(event.timestamp));
      const fullTime = new Date(event.timestamp).toLocaleString("pt-BR");
      return `
        <div class="request-row ${event.ok ? "" : "is-error"}" title="${escapeHtml(fullTime)}">
          <span class="request-status" aria-hidden="true"></span>
          <span class="request-model">${escapeHtml(model)}</span>
          <span class="request-time">${escapeHtml(ago)}</span>
          <span class="request-tokens">
            <span class="tok tok-in" title="input + cache">${compact(context)}</span>
            <span class="tok-sep">/</span>
            <span class="tok tok-out" title="output">${compact(output)}</span>
          </span>
        </div>
      `;
    })
    .join("");
}

function timeAgo(date) {
  const diff = Math.max(0, Date.now() - date.getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function contextTokens(total) {
  return Number(total.input_tokens || 0) + Number(total.cache_read_input_tokens || 0) + Number(total.cache_creation_input_tokens || 0);
}

function shortModelName(model) {
  if (model.includes("opus-4-7")) return "Opus 4.7";
  if (model.includes("opus")) return "Opus";
  if (model.includes("sonnet")) return "Sonnet";
  return model.replace(/^claude-/, "").slice(0, 18);
}

function compact(value) {
  const number = Number(value || 0);
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(2)}M`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(1)}k`;
  return formatNumber(number);
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR").format(Number(value || 0));
}

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 6,
    maximumFractionDigits: 6
  }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

refresh();
setInterval(refresh, 5000);

// ===== API Keys (Admin) =====

const apiKeysList = document.querySelector("#apiKeysList");
const apiKeysCount = document.querySelector("#apiKeysCount");
const apiKeyCreateBtn = document.querySelector("#apiKeyCreateBtn");
const apiKeyShowModal = document.querySelector("#apiKeyShowModal");
const apiKeyShowClose = document.querySelector("#apiKeyShowClose");
const apiKeyShowValue = document.querySelector("#apiKeyShowValue");
const apiKeyCopyBtn = document.querySelector("#apiKeyCopyBtn");

async function loadApiKeys() {
  if (!AUTH || !apiKeysList) return;
  apiKeysList.innerHTML = `<div class="combo-config-empty">Carregando...</div>`;
  const r = await AUTH.apiFetch("/api/keys");
  if (!r.ok) {
    apiKeysList.innerHTML = `<div class="combo-config-empty">Erro ao carregar (${r.status}).</div>`;
    return;
  }
  const { keys } = await r.json();
  renderApiKeys(keys);
}

function renderApiKeys(keys) {
  apiKeysCount.textContent = `${keys.length} chave${keys.length === 1 ? "" : "s"}`;
  if (!keys.length) {
    apiKeysList.innerHTML = `<div class="combo-config-empty">Voce ainda nao tem nenhuma chave. Clique em "+ Gerar nova chave".</div>`;
    return;
  }
  apiKeysList.innerHTML = keys.map((k) => `
    <article class="apikey-row${k.revoked_at ? " is-revoked" : ""}">
      <div class="apikey-info">
        <div class="apikey-row-head">
          <strong>${escapeHtml(k.name)}</strong>
          ${k.revoked_at ? `<span class="apikey-tag revoked">revogada</span>` : `<span class="apikey-tag active">ativa</span>`}
        </div>
        <div class="apikey-meta">
          <code>${escapeHtml(k.key_prefix)}...</code>
          <span>criada ${new Date(k.created_at).toLocaleDateString("pt-BR")}</span>
          ${k.last_used_at ? `<span>ultimo uso ${new Date(k.last_used_at).toLocaleString("pt-BR")}</span>` : `<span>nunca usada</span>`}
        </div>
      </div>
      ${k.revoked_at ? "" : `
        <button type="button" class="conn-btn danger" data-revoke="${k.id}">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 7h12l-1 14H7L6 7zm3-4h6l1 2h4v2H4V5h4l1-2z"/></svg>
          <span>Revogar</span>
        </button>
      `}
    </article>
  `).join("");

  for (const btn of apiKeysList.querySelectorAll("[data-revoke]")) {
    btn.addEventListener("click", async () => {
      if (!confirm("Revogar esta chave? Quem estiver usando vai perder acesso.")) return;
      await AUTH.apiFetch(`/api/keys/${btn.dataset.revoke}`, { method: "DELETE" });
      loadApiKeys();
    });
  }
}

// ===== Modal de criacao bonito =====
const apiKeyCreateModal = document.querySelector("#apiKeyCreateModal");
const apiKeyCreateClose = document.querySelector("#apiKeyCreateClose");
const apiKeyCreateCancel = document.querySelector("#apiKeyCreateCancel");
const apiKeyCreateForm = document.querySelector("#apiKeyCreateForm");
const apiKeyNameInput = document.querySelector("#apiKeyNameInput");
const apiKeyCreateConfirm = document.querySelector("#apiKeyCreateConfirm");

async function readJsonOrMessage(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {
      ok: false,
      message: response.ok
        ? "Resposta invalida do backend."
        : `Backend retornou HTTP ${response.status}.`
    };
  }
}

function openCreateKeyModal() {
  apiKeyNameInput.value = "";
  if (apiKeyCreateError) apiKeyCreateError.textContent = "";
  apiKeyCreateModal.classList.remove("is-hidden");
  document.body.classList.add("no-scroll");
  setTimeout(() => apiKeyNameInput.focus(), 60);
}

function closeCreateKeyModal() {
  apiKeyCreateModal.classList.add("is-hidden");
  document.body.classList.remove("no-scroll");
}

if (apiKeyCreateBtn) apiKeyCreateBtn.addEventListener("click", openCreateKeyModal);
if (apiKeyCreateClose) apiKeyCreateClose.addEventListener("click", closeCreateKeyModal);
if (apiKeyCreateCancel) apiKeyCreateCancel.addEventListener("click", closeCreateKeyModal);
if (apiKeyCreateModal) apiKeyCreateModal.addEventListener("click", (e) => {
  if (e.target.classList.contains("keycreate-overlay")) closeCreateKeyModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && apiKeyCreateModal && !apiKeyCreateModal.classList.contains("is-hidden")) closeCreateKeyModal();
});

const apiKeyCreateError = document.querySelector("#apiKeyCreateError");

if (apiKeyCreateForm) {
  apiKeyCreateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = apiKeyNameInput.value.trim() || "Sem nome";
    if (apiKeyCreateError) apiKeyCreateError.textContent = "";
    apiKeyCreateConfirm.disabled = true;
    apiKeyCreateConfirm.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align:-2px"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="48" stroke-dashoffset="20"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></circle></svg> Gerando...`;
    try {
      const r = await AUTH.apiFetch("/api/keys", {
        method: "POST",
        body: JSON.stringify({ name })
      });
      const data = await readJsonOrMessage(r);
      if (!r.ok || !data.ok || !data.key) {
        const msg = String(data.error || data.message || "Erro desconhecido");
        let friendly = msg;
        if (/Could not find the table.*api_keys/i.test(msg)) {
          friendly = "A tabela 'api_keys' nao existe no Supabase. Rode o SQL em supabase/schema.sql.";
        } else if (/relation .* does not exist/i.test(msg)) {
          friendly = "Tabela ausente no banco. Rode o schema SQL no Supabase.";
        } else if (r.status === 401) {
          friendly = "Sua sessao expirou. Faca login de novo e gere a chave.";
        } else if (r.status === 404) {
          friendly = "Frontend nao achou o backend de API keys. Confira a URL do backend em producao.";
        }
        if (apiKeyCreateError) apiKeyCreateError.textContent = friendly;
        return;
      }
      closeCreateKeyModal();
      apiKeyShowValue.textContent = data.key;
      openShowKeyModal();
      loadApiKeys();
    } catch (err) {
      if (apiKeyCreateError) apiKeyCreateError.textContent = "Erro de rede: " + err.message;
    } finally {
      apiKeyCreateConfirm.disabled = false;
      apiKeyCreateConfirm.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align:-2px"><path fill="currentColor" d="M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6zm-1 4v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg> Gerar chave`;
    }
  });
}

function openShowKeyModal() {
  apiKeyShowModal.classList.remove("is-hidden");
  document.body.classList.add("no-scroll");
}

function closeShowKeyModal() {
  apiKeyShowModal.classList.add("is-hidden");
  document.body.classList.remove("no-scroll");
}

if (apiKeyShowClose) apiKeyShowClose.addEventListener("click", closeShowKeyModal);
if (apiKeyShowModal) apiKeyShowModal.addEventListener("click", (e) => {
  if (e.target === apiKeyShowModal) closeShowKeyModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && apiKeyShowModal && !apiKeyShowModal.classList.contains("is-hidden")) closeShowKeyModal();
});

if (apiKeyCopyBtn) apiKeyCopyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(apiKeyShowValue.textContent);
    apiKeyCopyBtn.querySelector("span").textContent = "Copiado!";
    setTimeout(() => { apiKeyCopyBtn.querySelector("span").textContent = "Copiar"; }, 1500);
  } catch {}
});

// Carrega keys quando user vai pra view apikeys
document.querySelector('.nav-item[data-view="apikeys"]')?.addEventListener("click", loadApiKeys);
