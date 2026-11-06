const API_URL = (import.meta.env.VITE_BASE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const TOKEN_KEY = 'tienda.session';
export class ApiError extends Error {
  constructor(message, status, fields = {}) { super(message); this.status = status; this.fields = fields; }
}
export function getTokens() {
  try { return JSON.parse(localStorage.getItem(TOKEN_KEY)) || null; }
  catch { localStorage.removeItem(TOKEN_KEY); return null; }
}
export function saveTokens(tokens) { localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens)); }
export function clearTokens() { localStorage.removeItem(TOKEN_KEY); }
let refreshing = null;

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data.detail === 'string' ? data.detail : Object.entries(data)
      .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(' ') : errors}`).join(' ');
    throw new ApiError(message || 'No fue posible completar la solicitud.', response.status, data);
  }
  return data;
}
async function request(path, { method = 'GET', body, token, signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}/api/v1${path}`, {
      method, signal, headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('No se pudo conectar con Django. Comprueba que esté encendido.', 0);
  }
  return readResponse(response);
}
export const loginApi = (body) => request('/auth/token/', { method: 'POST', body });
export const registerApi = (body) => request('/auth/register/', { method: 'POST', body });
export const getMeWithToken = (token) => request('/auth/me/', { token });

async function refreshSession() {
  if (!refreshing) {
    const original = getTokens();
    if (!original?.refresh) throw new ApiError('Inicia sesión para continuar.', 401);
    refreshing = request('/auth/token/refresh/', { method: 'POST', body: { refresh: original.refresh } })
      .then((data) => {
        // No reactivar una sesión que se cerró mientras esperaba la respuesta.
        if (getTokens()?.refresh !== original.refresh) throw new ApiError('Sesión cerrada.', 401);
        const tokens = { ...original, ...data };
        saveTokens(tokens);
        return tokens;
      }).finally(() => { refreshing = null; });
  }
  return refreshing;
}
export async function apiRequest(path, options = {}) {
  try {
    return await request(path, { ...options, token: getTokens()?.access });
  } catch (error) {
    if (error.status !== 401) throw error;
    try {
      const tokens = await refreshSession();
      return await request(path, { ...options, token: tokens.access });
    } catch (refreshError) {
      if (refreshError.status === 401 || refreshError.status === 400) {
        clearTokens();
        window.dispatchEvent(new Event('session-expired'));
      }
      throw refreshError;
    }
  }
}
