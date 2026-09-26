/**
 * Limitador de Tasa en Memoria (Sliding Window Rate Limiter)
 * Protege la infraestructura frente a ataques de denegación de servicio (DoS)
 * y saturación de inferencia del LLM (Ollama).
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Limpieza periódica cada 5 minutos para evitar fugas de memoria
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter(t => now - t < 60000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000);
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Evalúa si una clave (IP + prefijo) ha superado el límite de peticiones en la ventana de tiempo.
 * @param key Identificador único (ej: `chat:192.168.1.1`)
 * @param limit Número máximo de peticiones permitidas en la ventana
 * @param windowMs Duración de la ventana en milisegundos (por defecto 60.000 ms = 1 min)
 */
export function checkRateLimit(
  key: string,
  limit: number = 25,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  let record = rateLimitStore.get(key);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filtrar timestamps fuera de la ventana actual
  record.timestamps = record.timestamps.filter(t => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSeconds
    };
  }

  // Registrar la petición actual
  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);

  return {
    allowed: true,
    limit,
    remaining,
    retryAfterSeconds: 0
  };
}

export function clearRateLimitsForTesting(): void {
  rateLimitStore.clear();
}
