import { createServer } from "node:http";
import { createHash, randomUUID } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const dataDir = path.join(rootDir, "data");
const usageFile = path.join(dataDir, "usage.ndjson");

const config = {
  port: Number(process.env.PORT || 8787),
  upstreamBaseUrl: trimTrailingSlash(process.env.UPSTREAM_BASE_URL || "https://base.actionplandigital.com.br"),
  defaultModel: process.env.DEFAULT_MODEL || "claude-opus-4-7",
  trackerApiKey: process.env.TRACKER_API_KEY || "",
  storePrompts: process.env.STORE_PROMPTS === "true",
  storeResponses: process.env.STORE_RESPONSES === "true",
  priceInputPerMTok: Number(process.env.PRICE_INPUT_PER_MTOK || 5),
  priceOutputPerMTok: Number(process.env.PRICE_OUTPUT_PER_MTOK || 25),
  priceCacheReadPerMTok: Number(process.env.PRICE_CACHE_READ_PER_MTOK || 0.5),
  priceCacheWritePerMTok: Number(process.env.PRICE_CACHE_WRITE_PER_MTOK || 6.25),
  maxBodyBytes: Number(process.env.MAX_BODY_BYTES || 60 * 1024 * 1024)
};

mkdirSync(dataDir, { recursive: true });

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (req.method === "OPTIONS") {
      sendCors(res, 204);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        upstreamBaseUrl: config.upstreamBaseUrl,
        defaultModel: config.defaultModel,
        authRequired: Boolean(config.trackerApiKey),
        storePrompts: config.storePrompts,
        storeResponses: config.storeResponses
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/stats") {
      sendJson(res, 200, await buildStats());
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/export.ndjson") {
      await sendExport(res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/demo") {
      if (!authorize(req)) {
        sendJson(res, 401, { error: "tracker_api_key_required" });
        return;
      }
      const body = await readJsonBody(req);
      await handleMessagesProxy(req, res, {
        model: body.model || config.defaultModel,
        max_tokens: Number(body.max_tokens || 120),
        messages: [{ role: "user", content: String(body.prompt || "Responda exatamente: ok") }]
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/v1/messages") {
      if (!authorize(req)) {
        sendJson(res, 401, {
          type: "error",
          error: {
            type: "authentication_error",
            message: "TRACKER_API_KEY is required by this proxy."
          }
        });
        return;
      }
      const body = await readJsonBody(req);
      if (!body.model) body.model = config.defaultModel;
      await handleMessagesProxy(req, res, body);
      return;
    }

    if (req.method === "GET") {
      await serveStatic(url.pathname, res);
      return;
    }

    sendJson(res, 404, { error: "not_found" });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      sendJson(res, 500, { error: "internal_error", message: error.message });
    } else {
      res.end();
    }
  }
});

server.listen(config.port, () => {
  console.log(`Opus Usage Tracker running on http://localhost:${config.port}`);
  console.log(`Proxying /v1/messages to ${config.upstreamBaseUrl}/v1/messages`);
});

async function handleMessagesProxy(req, res, requestBody) {
  const startedAt = Date.now();
  const requestId = randomUUID();
  const bodyText = JSON.stringify(requestBody);
  const upstreamUrl = `${config.upstreamBaseUrl}/v1/messages`;
  const headers = buildUpstreamHeaders(req);

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers,
      body: bodyText
    });
  } catch (error) {
    const event = buildBaseEvent(requestId, requestBody, startedAt, 502);
    event.error = `upstream_fetch_failed: ${error.message}`;
    await appendUsage(event);
    sendJson(res, 502, { error: "upstream_fetch_failed", message: error.message });
    return;
  }

  const responseHeaders = {
    "content-type": upstreamResponse.headers.get("content-type") || "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-tracker-request-id": requestId
  };

  const isStream = requestBody.stream === true || responseHeaders["content-type"].includes("text/event-stream");
  if (isStream) {
    await handleStreamResponse(res, upstreamResponse, responseHeaders, {
      requestId,
      requestBody,
      startedAt
    });
    return;
  }

  const raw = await upstreamResponse.text();
  res.writeHead(upstreamResponse.status, responseHeaders);
  res.end(raw);

  const event = buildEventFromJsonText(requestId, requestBody, raw, startedAt, upstreamResponse.status);
  await appendUsage(event);
}

async function handleStreamResponse(res, upstreamResponse, responseHeaders, context) {
  res.writeHead(upstreamResponse.status, {
    ...responseHeaders,
    "content-type": "text/event-stream; charset=utf-8",
    "connection": "keep-alive",
    "x-accel-buffering": "no"
  });

  const chunks = [];
  let bufferedBytes = 0;
  const maxBuffer = 5 * 1024 * 1024;
  const reader = upstreamResponse.body?.getReader();

  if (!reader) {
    res.end();
    return;
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
    if (bufferedBytes + value.byteLength <= maxBuffer) {
      chunks.push(Buffer.from(value));
      bufferedBytes += value.byteLength;
    }
  }

  res.end();
  const raw = Buffer.concat(chunks).toString("utf8");
  const event = buildEventFromSseText(context.requestId, context.requestBody, raw, context.startedAt, upstreamResponse.status);
  await appendUsage(event);
}

function buildEventFromJsonText(requestId, requestBody, raw, startedAt, status) {
  const event = buildBaseEvent(requestId, requestBody, startedAt, status);
  event.response_bytes = Buffer.byteLength(raw);

  try {
    const json = JSON.parse(raw);
    event.response_id = json.id || null;
    event.returned_model = json.model || null;
    event.stop_reason = json.stop_reason || null;
    event.usage = normalizeUsage(json.usage);
    event.cost = estimateCost(event.usage);
    event.ok = status >= 200 && status < 300;
    event.error = json.error?.message || null;
    if (config.storeResponses) event.response_preview = extractTextPreview(json);
  } catch (error) {
    event.ok = status >= 200 && status < 300;
    event.error = status >= 400 ? raw.slice(0, 400) : null;
  }

  return event;
}

function buildEventFromSseText(requestId, requestBody, raw, startedAt, status) {
  const event = buildBaseEvent(requestId, requestBody, startedAt, status);
  event.stream = true;
  event.response_bytes = Buffer.byteLength(raw);
  event.ok = status >= 200 && status < 300;

  const parsed = parseAnthropicSse(raw);
  event.response_id = parsed.responseId;
  event.returned_model = parsed.returnedModel;
  event.stop_reason = parsed.stopReason;
  event.usage = normalizeUsage(parsed.usage);
  event.cost = estimateCost(event.usage);
  event.error = parsed.error;
  if (config.storeResponses) event.response_preview = parsed.text.slice(0, 600);
  return event;
}

function buildBaseEvent(requestId, requestBody, startedAt, status) {
  const promptText = flattenMessages(requestBody.messages);
  const event = {
    id: requestId,
    timestamp: new Date(startedAt).toISOString(),
    status,
    ok: false,
    latency_ms: Date.now() - startedAt,
    requested_model: requestBody.model || config.defaultModel,
    returned_model: null,
    max_tokens: requestBody.max_tokens ?? null,
    stream: requestBody.stream === true,
    prompt_hash: promptText ? hashText(promptText) : null,
    prompt_chars: promptText.length,
    usage: normalizeUsage(null),
    cost: estimateCost(null)
  };

  if (config.storePrompts) event.prompt_preview = promptText.slice(0, 600);
  return event;
}

function parseAnthropicSse(raw) {
  const result = {
    responseId: null,
    returnedModel: null,
    stopReason: null,
    text: "",
    usage: {},
    error: null
  };

  for (const block of raw.split(/\n\n+/)) {
    const dataLine = block.split(/\n/).find((line) => line.startsWith("data:"));
    if (!dataLine) continue;
    const data = dataLine.slice(5).trim();
    if (!data || data === "[DONE]") continue;

    try {
      const event = JSON.parse(data);
      if (event.type === "message_start" && event.message) {
        result.responseId = event.message.id || result.responseId;
        result.returnedModel = event.message.model || result.returnedModel;
        mergeUsage(result.usage, event.message.usage);
      }
      if (event.type === "content_block_delta" && event.delta?.text) {
        result.text += event.delta.text;
      }
      if (event.type === "message_delta") {
        result.stopReason = event.delta?.stop_reason || result.stopReason;
        mergeUsage(result.usage, event.usage);
      }
      if (event.type === "error") {
        result.error = event.error?.message || JSON.stringify(event.error);
      }
    } catch {
      // Ignore malformed event chunks while preserving the proxied stream.
    }
  }

  return result;
}

function mergeUsage(target, usage) {
  if (!usage) return;
  for (const [key, value] of Object.entries(usage)) {
    if (typeof value === "number") target[key] = (target[key] || 0) + value;
  }
}

function normalizeUsage(usage) {
  return {
    input_tokens: Number(usage?.input_tokens || 0),
    output_tokens: Number(usage?.output_tokens || 0),
    cache_read_input_tokens: Number(usage?.cache_read_input_tokens || 0),
    cache_creation_input_tokens: Number(usage?.cache_creation_input_tokens || 0)
  };
}

function estimateCost(usage) {
  const normalized = normalizeUsage(usage);
  const input = (normalized.input_tokens / 1_000_000) * config.priceInputPerMTok;
  const output = (normalized.output_tokens / 1_000_000) * config.priceOutputPerMTok;
  const cacheRead = (normalized.cache_read_input_tokens / 1_000_000) * config.priceCacheReadPerMTok;
  const cacheWrite = (normalized.cache_creation_input_tokens / 1_000_000) * config.priceCacheWritePerMTok;
  return {
    estimated_usd: roundMoney(input + output + cacheRead + cacheWrite),
    input_usd: roundMoney(input),
    output_usd: roundMoney(output),
    cache_read_usd: roundMoney(cacheRead),
    cache_write_usd: roundMoney(cacheWrite),
    price_input_per_mtok: config.priceInputPerMTok,
    price_output_per_mtok: config.priceOutputPerMTok
  };
}

async function appendUsage(event) {
  event.latency_ms = Date.now() - Date.parse(event.timestamp);
  await fs.appendFile(usageFile, `${JSON.stringify(event)}\n`, "utf8");
}

async function buildStats() {
  const events = await readEvents();
  const now = new Date();
  const todayKey = dayKey(now);
  const totals = blankTotals();
  const today = blankTotals();
  const byModel = new Map();
  const byDay = new Map();
  const errors = [];

  for (const event of events) {
    addToTotals(totals, event);
    const eventDay = dayKey(new Date(event.timestamp));
    if (eventDay === todayKey) addToTotals(today, event);

    const model = event.returned_model || event.requested_model || "unknown";
    if (!byModel.has(model)) byModel.set(model, blankTotals(model));
    addToTotals(byModel.get(model), event);

    if (!byDay.has(eventDay)) byDay.set(eventDay, blankTotals(eventDay));
    addToTotals(byDay.get(eventDay), event);

    if (!event.ok) errors.push(event);
  }

  return {
    generated_at: now.toISOString(),
    config: {
      upstreamBaseUrl: config.upstreamBaseUrl,
      defaultModel: config.defaultModel,
      authRequired: Boolean(config.trackerApiKey),
      storePrompts: config.storePrompts,
      storeResponses: config.storeResponses,
      priceInputPerMTok: config.priceInputPerMTok,
      priceOutputPerMTok: config.priceOutputPerMTok,
      priceCacheReadPerMTok: config.priceCacheReadPerMTok,
      priceCacheWritePerMTok: config.priceCacheWritePerMTok
    },
    totals,
    today,
    byModel: [...byModel.values()].sort((a, b) => b.estimated_usd - a.estimated_usd),
    byDay: [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([, value]) => value),
    recent: events.slice(-60).reverse(),
    errors: errors.slice(-20).reverse()
  };
}

function blankTotals(label = null) {
  return {
    label,
    requests: 0,
    ok: 0,
    errors: 0,
    input_tokens: 0,
    output_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
    total_tokens: 0,
    estimated_usd: 0,
    avg_latency_ms: 0
  };
}

function addToTotals(total, event) {
  total.requests += 1;
  if (event.ok) total.ok += 1;
  else total.errors += 1;
  total.input_tokens += Number(event.usage?.input_tokens || 0);
  total.output_tokens += Number(event.usage?.output_tokens || 0);
  total.cache_read_input_tokens += Number(event.usage?.cache_read_input_tokens || 0);
  total.cache_creation_input_tokens += Number(event.usage?.cache_creation_input_tokens || 0);
  total.total_tokens = total.input_tokens + total.output_tokens + total.cache_read_input_tokens + total.cache_creation_input_tokens;
  total.estimated_usd = roundMoney(total.estimated_usd + Number(event.cost?.estimated_usd || 0));
  total.avg_latency_ms = Math.round(((total.avg_latency_ms * (total.requests - 1)) + Number(event.latency_ms || 0)) / total.requests);
}

async function readEvents() {
  if (!existsSync(usageFile)) return [];
  const raw = await fs.readFile(usageFile, "utf8");
  return raw
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > config.maxBodyBytes) throw new Error("Request body is too large.");
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

function buildUpstreamHeaders(req) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "anthropic-version": req.headers["anthropic-version"] || "2023-06-01"
  };

  if (req.headers["anthropic-beta"]) headers["anthropic-beta"] = req.headers["anthropic-beta"];
  if (process.env.UPSTREAM_API_KEY) headers["x-api-key"] = process.env.UPSTREAM_API_KEY;
  if (process.env.UPSTREAM_AUTH_TOKEN) headers.authorization = `Bearer ${process.env.UPSTREAM_AUTH_TOKEN}`;
  return headers;
}

function authorize(req) {
  if (!config.trackerApiKey) return true;
  const bearer = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const xApiKey = String(req.headers["x-api-key"] || "");
  return bearer === config.trackerApiKey || xApiKey === config.trackerApiKey;
}

async function serveStatic(urlPath, res) {
  const safePath = urlPath === "/" ? "/index.html" : decodeURIComponent(urlPath);
  const filePath = path.normalize(path.join(publicDir, safePath));
  if (!filePath.startsWith(publicDir)) {
    sendJson(res, 403, { error: "forbidden" });
    return;
  }

  if (!existsSync(filePath)) {
    const fallback = path.join(publicDir, "index.html");
    res.writeHead(200, { "content-type": mimeTypes[".html"], "cache-control": "no-store" });
    createReadStream(fallback).pipe(res);
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, {
    "content-type": mimeTypes[ext] || "application/octet-stream",
    "cache-control": "no-store"
  });
  createReadStream(filePath).pipe(res);
}

async function sendExport(res) {
  if (!existsSync(usageFile)) {
    res.writeHead(200, {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store"
    });
    res.end("");
    return;
  }
  res.writeHead(200, {
    "content-type": "application/x-ndjson; charset=utf-8",
    "cache-control": "no-store",
    "content-disposition": "attachment; filename=usage.ndjson"
  });
  createReadStream(usageFile).pipe(res);
}

function sendJson(res, status, payload) {
  sendCors(res, status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendCors(res, status, extraHeaders = {}) {
  res.writeHead(status, {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type, authorization, x-api-key, anthropic-version, anthropic-beta",
    "cache-control": "no-store",
    ...extraHeaders
  });
}

function flattenMessages(messages = []) {
  return messages
    .map((message) => {
      if (typeof message?.content === "string") return message.content;
      if (Array.isArray(message?.content)) {
        return message.content
          .map((part) => {
            if (typeof part === "string") return part;
            if (part?.text) return part.text;
            return "";
          })
          .join("\n");
      }
      return "";
    })
    .join("\n");
}

function extractTextPreview(json) {
  if (!Array.isArray(json.content)) return "";
  return json.content.map((part) => part.text || "").join("").slice(0, 600);
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

function hashText(text) {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 1_000_000) / 1_000_000;
}
