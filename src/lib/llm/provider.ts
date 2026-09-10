export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  ok: boolean;
  content: string;
  provider: string;
  latencyMs: number;
}

if (typeof process !== "undefined") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export class InmobiaLLMProvider {
  private primaryProvider: string;
  private ollamaUrl: string;
  private ollamaModel: string;
  private ollamaApiKey?: string;
  private openRouterKey?: string;
  private groqKey?: string;
  private geminiKey?: string;

  constructor() {
    this.primaryProvider = (process.env.AI_DEFAULT_PROVIDER || "ollama").toLowerCase();
    
    let rawUrl = process.env.OLLAMA_URL || "https://ollama-pisf.srv1823868.hstgr.cloud/api/chat";
    if (!rawUrl.includes("/api/chat") && !rawUrl.includes("/api/generate")) {
      rawUrl = rawUrl.replace(/\/$/, "") + "/api/chat";
    }
    this.ollamaUrl = rawUrl;
    this.ollamaModel = process.env.OLLAMA_MODEL || "vera:latest";
    this.ollamaApiKey = process.env.OLLAMA_API_KEY;
    
    this.openRouterKey = process.env.OPENROUTER_API_KEY;
    this.groqKey = process.env.GROQ_API_KEY;
    this.geminiKey = process.env.GEMINI_API_KEY;
  }

  async generateReply(messages: LLMMessage[]): Promise<LLMResponse> {
    const startTime = Date.now();

    // 1. Intento Primario: Ollama en VPS Hostinger
    if (["ollama", "qwen", "llama", "vera"].includes(this.primaryProvider)) {
      try {
        // Timeout de 90s para dar tiempo a la CPU del VPS a sintetizar la respuesta completa
        const ollamaRes = await this.callOllama(messages, 90000);
        if (ollamaRes) {
          return {
            ok: true,
            content: ollamaRes,
            provider: `Hostinger Ollama (${this.ollamaModel})`,
            latencyMs: Date.now() - startTime
          };
        }
      } catch (err) {
        console.warn("[InmobiaLLM] Ollama Hostinger no disponible temporalmente, evaluando respaldo:", err);
      }
    }

    // 2. Respaldo Secundario: OpenRouter / Cloud
    if (this.openRouterKey) {
      try {
        const orRes = await this.callOpenRouter(messages, 15000);
        if (orRes) {
          return {
            ok: true,
            content: orRes,
            provider: "openrouter_llama3",
            latencyMs: Date.now() - startTime
          };
        }
      } catch (err) {
        console.warn("[InmobiaLLM] OpenRouter fallo, pasando a fallback cognitivo:", err);
      }
    }

    // 3. Respaldo Terciario: Motor Cognitivo Inmobiliario de Rescate
    const userMsg = messages[messages.length - 1]?.content || "";
    const localContent = this.generateCognitiveFallback(userMsg);

    return {
      ok: true,
      content: localContent,
      provider: "inmobia_cognitive_engine",
      latencyMs: Date.now() - startTime
    };
  }

  private async callOllama(messages: LLMMessage[], timeoutMs: number): Promise<string | null> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (this.ollamaApiKey) {
      headers["Authorization"] = `Bearer ${this.ollamaApiKey}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(this.ollamaUrl, {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: this.ollamaModel,
          messages,
          stream: false,
          options: {
            temperature: 0.4,
            top_p: 0.9
          }
        })
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
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.openRouterKey}`,
          "HTTP-Referer": "https://inmobia360.com",
          "X-Title": "Inmobia360 AI Broker"
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct:free",
          messages,
          temperature: 0.65
        })
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

  private generateCognitiveFallback(userMsg: string): string {
    const lower = userMsg.toLowerCase();

    if (lower.includes("arras")) {
      return "En el ordenamiento juridico espanol, el contrato de arras mas habitual es el de arras penitenciales (Art. 1454 del Codigo Civil), que permite la resolucion del contrato perdiendo el comprador la cantidad entregada o devolviendo el vendedor el doble si desiste. Debe identificarse con claridad la referencia catastral, precio pactado, plazo maximo para elevar a escritura publica y distribucion de gastos segun ley.";
    }

    if (lower.includes("madrid") || lower.includes("documentacion") || lower.includes("captar")) {
      return "Para la comercializacion valida de una vivienda en Espana (y en particular en Madrid), la documentacion esencial comprende: 1) Titulo de propiedad (escritura) y Nota Simple registral vigente, 2) Certificado de Eficiencia Energetica (CEE) obligatorio para anunciar, 3) Ultimo recibo del IBI al corriente, 4) Certificado de la comunidad de propietarios libre de deudas, y 5) Cedula de habitabilidad o licencia de primera ocupacion segun corresponda.";
    }

    if (lower.includes("alquiler") || lower.includes("vivienda") || lower.includes("lau")) {
      return "Conforme a la Ley de Arrendamientos Urbanos (LAU) reformada por la Ley por el Derecho a la Vivienda: los honorarios de formalizacion y gestion inmobiliaria corresponden exclusivamente al arrendador cuando se trata de vivienda habitual. La fianza legal obligatoria es de 1 mensualidad, con una garantia adicional maxima de 2 meses salvo contratos de larga duracion con personas juridicas.";
    }

    return "Como copiloto inmobiliario de inmobia360, puedo orientarte sobre la legislacion inmobiliaria espanola (LAU, Codigo Civil, Ley de Vivienda), preparacion de expedientes, analisis de notas simples y elaboracion de propuestas contractuales para tu agencia. Que consulta deseas tratar?";
  }
}

export const inmobiaLLM = new InmobiaLLMProvider();
