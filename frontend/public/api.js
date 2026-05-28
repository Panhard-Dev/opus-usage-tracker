// Em dev: vazio (Vite proxia /api/* e /v1/* pra :8787)
// Em prod: defina VITE_BACKEND_URL no Render (ex: https://ia-tracker-backend.onrender.com)
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export function apiUrl(path) {
  return BACKEND_URL + path;
}
