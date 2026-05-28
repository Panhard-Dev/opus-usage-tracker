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

baseUrlText.textContent = window.location.origin;

demoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = demoForm.querySelector("button");
  button.disabled = true;
  demoResult.textContent = "Sending request...";

  try {
    const response = await fetch("/api/demo", {
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
      fetch("/api/health").then((response) => response.json()),
      fetch("/api/stats").then((response) => response.json())
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
  avgLatency.textContent = `${formatNumber(stats.totals.avg_latency_ms)}ms avg`;
  totalCost.textContent = `${formatUsd(stats.totals.estimated_usd)} total`;
  modelCount.textContent = `${stats.byModel.length} models`;

  const topModel = stats.byModel[0]?.label || stats.config.defaultModel;
  nodeLabel.textContent = shortModelName(topModel);
  renderRequests(stats.recent);
}

function renderRequests(recent) {
  if (!recent.length) {
    requestList.innerHTML = `<div class="request-row"><div class="request-model"><span>No requests yet</span></div><div class="request-tokens">0</div></div>`;
    return;
  }

  requestList.innerHTML = recent
    .slice(0, 42)
    .map((event) => {
      const usage = event.usage || {};
      const input = usage.input_tokens || 0;
      const output = usage.output_tokens || 0;
      const cache = (usage.cache_read_input_tokens || 0) + (usage.cache_creation_input_tokens || 0);
      const context = input + cache;
      const model = event.returned_model || event.requested_model || "unknown";
      return `
        <div class="request-row" title="${escapeHtml(new Date(event.timestamp).toLocaleString("pt-BR"))} - ${escapeHtml(model)}">
          <div class="request-model ${event.ok ? "" : "error"}">
            <span>${escapeHtml(model)}</span>
          </div>
          <div class="request-tokens">
            <span class="token-in">${compact(context)} ctx</span>
            ${cache ? `<span class="token-cache">${compact(cache)} cache</span>` : ""}
            <span class="token-out">${compact(output)} out</span>
          </div>
        </div>
      `;
    })
    .join("");
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
