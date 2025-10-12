const API_BASE = import.meta.env.VITE_API_BASE || "";

export interface PredictPayload { textos: string[] }
export interface PredictResponse {
  predicciones: (number | string)[];
  probabilidades?: number[]; // opcional si tu backend las envía
}

export async function postJSON<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}
