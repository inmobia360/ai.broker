export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  ok: boolean;
  content: string;
  provider: string;
  latencyMs: number;
  fallbackUsed: boolean;
}

export interface LLMCallOptions {
  model?: string;
  timeoutMs?: number;
  temperature?: number;
  forceFallback?: boolean;
}

export class InmobiaLLMProvider {
  private primaryProvider: string;
  private ollamaUrl: string;
  private ollamaModel: string;
  private ollamaApiKey?: string;
  private openRouterKey?: string;
  private groqKey?: string;
  private geminiKey?: string;
  private defaultTimeoutMs: number;

  constructor(options?: { defaultTimeoutMs?: number }) {
    this.primaryProvider = (process.env.AI_DEFAULT_PROVIDER || 'ollama').toLowerCase();

    let rawUrl = process.env.OLLAMA_URL || 'https://ollama-pisf.srv1823868.hstgr.cloud/api/chat';
    if (!rawUrl.includes('/api/chat') && !rawUrl.includes('/api/generate')) {
      rawUrl = rawUrl.replace(/\/$/, '') + '/api/chat';
    }
    this.ollamaUrl = rawUrl;
    this.ollamaModel = process.env.OLLAMA_MODEL || 'llama3.1:8b';
    this.ollamaApiKey = process.env.OLLAMA_API_KEY;

    this.openRouterKey = process.env.OPENROUTER_API_KEY;
    this.groqKey = process.env.GROQ_API_KEY;
    this.geminiKey = process.env.GEMINI_API_KEY;

    // Timeout configurable por entorno (por defecto 12s, o 30s para inferencia CPU en VPS)
    this.defaultTimeoutMs = process.env.AI_TIMEOUT_MS
      ? parseInt(process.env.AI_TIMEOUT_MS, 10)
      : (options?.defaultTimeoutMs ?? 12000);
  }

  /**
   * Genera una respuesta con el Director Broker o asistentes especializados.
   * Ejecuta primero Ollama local en VPS Hostinger (RF-11) y conmuta automáticamente
   * al fallback cognitivo en caso de superar el timeout de 12s o error (RF-12).
   */
  async generateReply(
    messages: LLMMessage[],
    options?: LLMCallOptions
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const timeoutMs = options?.timeoutMs ?? this.defaultTimeoutMs;

    // 1. Si no se fuerza el fallback, intentar inferencia primaria en Ollama Hostinger
    if (!options?.forceFallback && ['ollama', 'qwen', 'llama', 'vera'].includes(this.primaryProvider)) {
      try {
        const ollamaRes = await this.callOllama(messages, timeoutMs, options?.model);
        if (ollamaRes && ollamaRes.trim().length > 0) {
          return {
            ok: true,
            content: ollamaRes,
            provider: `Hostinger Ollama (${options?.model || this.ollamaModel})`,
            latencyMs: Date.now() - startTime,
            fallbackUsed: false,
          };
        }
      } catch (err) {
        console.warn('[InmobiaLLM] Ollama Hostinger superó el tiempo límite o falló:', err);
      }
    }

    // 2. Respaldo Secundario: API en la nube (OpenRouter si está configurada)
    if (!options?.forceFallback && this.openRouterKey) {
      try {
        const orRes = await this.callOpenRouter(messages, Math.min(timeoutMs, 8000));
        if (orRes && orRes.trim().length > 0) {
          return {
            ok: true,
            content: orRes,
            provider: 'openrouter_llama3',
            latencyMs: Date.now() - startTime,
            fallbackUsed: true,
          };
        }
      } catch (err) {
        console.warn('[InmobiaLLM] OpenRouter falló:', err);
      }
    }

    // 3. Respaldo Terciario Inmediato (<50ms): Motor Cognitivo Especializado en Inmobiliario Español
    const userMsg = messages[messages.length - 1]?.content || '';
    const cognitiveContent = this.generateCognitiveFallback(userMsg);

    return {
      ok: true,
      content: cognitiveContent,
      provider: 'inmobia_cognitive_fallback_spain',
      latencyMs: Date.now() - startTime,
      fallbackUsed: true,
    };
  }

  private async callOllama(
    messages: LLMMessage[],
    timeoutMs: number,
    customModel?: string
  ): Promise<string | null> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.ollamaApiKey) {
      headers['Authorization'] = `Bearer ${this.ollamaApiKey}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: customModel || this.ollamaModel,
          messages,
          keep_alive: '60m',
          stream: false,
          options: {
            num_predict: 350,
            num_ctx: 2048,
            temperature: 0.4,
            top_p: 0.9,
          },
        }),
      });

      clearTimeout(timer);
      if (!res.ok) return null;

      const data = await res.json();
      return data.message?.content || data.choices?.[0]?.message?.content || null;
    } catch {
      clearTimeout(timer);
      return null;
    }
  }

  private async callOpenRouter(messages: LLMMessage[], timeoutMs: number): Promise<string | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openRouterKey}`,
          'HTTP-Referer': 'https://inmobia360.com',
          'X-Title': 'Inmobia360 AI Broker',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages,
          temperature: 0.5,
        }),
      });

      clearTimeout(timer);
      if (!res.ok) return null;

      const data = await res.json();
      return data.choices?.[0]?.message?.content || null;
    } catch {
      clearTimeout(timer);
      return null;
    }
  }

  /**
   * Generador de rescate cognitivo estructurado en español peninsular normativo.
   * Proporciona respuestas técnicas de valor legal inmediato en caso de indisponibilidad.
   */
  public generateCognitiveFallback(userMsg: string): string {
    const lower = userMsg.toLowerCase();

    if (lower.includes('arras')) {
      return 'En el ordenamiento jurídico español, el contrato de arras más habitual es el de arras penitenciales (Art. 1454 del Código Civil). Permite la resolución de la compraventa perdiendo el comprador la señal entregada o devolviendo el vendedor el doble del importe si desiste. El documento debe identificar a las partes con DNI/NIE, la referencia catastral, precio pactado y plazo máximo de otorgamiento de escritura pública en notaría.';
    }

    if (lower.includes('alquiler') || lower.includes('vivienda') || lower.includes('lau')) {
      return 'Conforme a la Ley de Arrendamientos Urbanos (LAU 29/1994) vigente: los honorarios de gestión inmobiliaria y formalización corresponden al arrendador cuando se trata de vivienda habitual. La fianza legal obligatoria es de 1 mensualidad para vivienda (2 para uso distinto), con un plazo mínimo de 5 años si el arrendador es persona física (7 si es persona jurídica).';
    }

    if (lower.includes('visita') || lower.includes('honorarios')) {
      return 'La hoja de visita o parte de inspección inmobiliaria debe consignar los datos identificativos del visitante (nombre, DNI/NIE), fecha exacta, referencia de la finca y la cláusula formal de reconocimiento de gestión y honorarios profesionales de intermediación, blindando la retribución de la agencia ante operaciones directas con el vendedor.';
    }

    if (lower.includes('madrid') || lower.includes('documentacion') || lower.includes('captar') || lower.includes('captación')) {
      return 'Para comercializar válidamente una vivienda en España, la documentación indispensable comprende: 1) Título de propiedad y Nota Simple registral vigente (máximo 3 meses), 2) Certificado de Eficiencia Energética (CEE) obligatorio para publicar, 3) Último recibo del IBI pagado, 4) Certificado de la comunidad de propietarios libre de deudas, y 5) Cédula de habitabilidad o licencia de primera ocupación según la Comunidad Autónoma.';
    }

    return 'Como Director de Agencia digital de Inmobia 360, puedo orientarte sobre la normativa inmobiliaria española (Código Civil, LAU, Ley de Vivienda), preparación de expedientes de captación, contratos de arras y calificación de compradores para tu agencia. ¿Qué consulta o expediente deseas revisar?';
  }
}

export const inmobiaLLM = new InmobiaLLMProvider();
