// Em dev: vazio (Vite proxia /api/* e /v1/* pra :8787).
// Em prod: usa VITE_BACKEND_URL quando existir; sem env, aponta para o backend Render atual.
const DEFAULT_BACKEND_URL = "https://ia-tracker-backend-s02s.onrender.com";
const host = globalThis.location?.hostname || "";
const isLocalHost = host === "localhost" || host === "127.0.0.1" || host === "";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (isLocalHost ? "" : DEFAULT_BACKEND_URL);

export function apiUrl(path) {
  return BACKEND_URL + path;
}
