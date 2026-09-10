export interface OllamaChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaChatOptions {
  model?: string;
  temperature?: number;
}

export class OllamaClient {
  private baseUrl: string;
  private defaultModel: string;
  private authType: string;
  private authUser?: string;
  private authPassword?: string;
  private authToken?: string;

  constructor() {
    this.baseUrl = (process.env.OLLAMA_BASE_URL || "https://72.62.27.4").replace(/\/$/, "");
    this.defaultModel = process.env.OLLAMA_MODEL || "llama3.1:8b";
    this.authType = process.env.OLLAMA_AUTH_TYPE || "none";
    this.authUser = process.env.OLLAMA_AUTH_USER;
    this.authPassword = process.env.OLLAMA_AUTH_PASSWORD;
    this.authToken = process.env.OLLAMA_AUTH_TOKEN;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.authType === "basic" && (this.authUser || this.authPassword)) {
      const credentials = Buffer.from(`${this.authUser || ""}:${this.authPassword || ""}`).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    } else if (this.authType === "bearer" && this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async chat(messages: OllamaChatMessage[], options?: OllamaChatOptions): Promise<string> {
    const model = options?.model || this.defaultModel;
    const url = `${this.baseUrl}/api/chat`;

    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama Error [${response.status}]: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || "";
  }

  async checkHealth(): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (res.ok) {
        return { ok: true, message: "Conectado a Ollama" };
      }
      return { ok: false, message: `Respuesta HTTP ${res.status}: ${res.statusText}` };
    } catch (err: any) {
      return { ok: false, message: err.message || "Error de conexion a Ollama" };
    }
  }
}

export const ollama = new OllamaClient();
