const API_BASE = import.meta.env.VITE_API_BASE || "";

export interface PredictPayload { textos: string[] }
export interface PredictResponse {
  predicciones: (number | string)[];
  probabilidades?: number[]; // opcional si tu backend las envía
}

export async function postJSON<T>(path: string, payload: unknown): Promise<T> {
  // Debug: print outgoing payloads to browser console for easier inspection
  try {
    console.log(`POST ${API_BASE}${path}`, payload);
  } catch {
    // ignore logging errors
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Read response as text first so we can log it even if it's not JSON
  const text = await res.text();
  let parsed: unknown = text;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    // not JSON, keep raw text
  }

  try {
    console.log(`RESPONSE ${res.status} ${API_BASE}${path}`, parsed);
  } catch {
    // ignore logging errors
  }

  if (!res.ok) {
    // include body in error for debugging
    const message = typeof parsed === "string" ? parsed : JSON.stringify(parsed);
    throw new Error(`HTTP ${res.status}: ${message}`);
  }

  return parsed as T;
}
