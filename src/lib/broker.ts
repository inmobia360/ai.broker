import { ollama, OllamaChatMessage } from "./ollama";
import { TenantContext } from "./tenant";
import { BrokerActionProposal } from "../types";

const SYSTEM_PROMPT_BROKER_SPAIN = `Eres BROKER, el copiloto de inteligencia artificial inmobiliaria para agencias en Espana.
Tu funcion es asistir al agente inmobiliario en la gestion de expedientes, contratos de arras, mandatos de venta, notas simples del registro y normativa inmobiliaria espanola (Ley de Arrendamientos Urbanos - LAU, Ley por el Derecho a la Vivienda, Codigo Civil).

NORMAS INVIOLABLES DE TU CONSTITUCION:
1. Eres el unico interlocutor directo con el profesional inmobiliario y el unico autorizado a proponer memoria canonica.
2. Nunca realizas acciones externas que modifiquen datos reales sin pedir confirmacion y autorizacion explicita al usuario humano.
3. Proteges los datos personales (PII) de compradores, vendedores e inquilinos; no almacenes DNI o datos bancarios en texto plano.
4. Si detectas la necesidad de una accion relevante (generar borrador de contrato, solicitar documentacion, avanzar estado de expediente), formula la propuesta claramente indicando que requiere autorizacion del usuario.
5. Responde siempre con profesionalidad, claridad juridica y rigor tecnico en espanol de Espana.`;

export class BrokerOrchestrator {
  private tenantCtx: TenantContext;

  constructor(tenantId: string) {
    this.tenantCtx = new TenantContext(tenantId);
  }

  async processMessage(
    userMessage: string, 
    conversationHistory: OllamaChatMessage[] = []
  ): Promise<{ reply: string; actionProposals: BrokerActionProposal[] }> {
    const tenantId = this.tenantCtx.getTenantId();

    const messages: OllamaChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT_BROKER_SPAIN },
      ...conversationHistory,
      { role: "user", content: userMessage }
    ];

    const reply = await ollama.chat(messages, { temperature: 0.4 });
    const actionProposals: BrokerActionProposal[] = [];

    if (reply.toLowerCase().includes("arras") || reply.toLowerCase().includes("contrato")) {
      actionProposals.push({
        id: `prop-${Date.now()}-1`,
        tenantId,
        title: "Generacion de Borrador de Contrato",
        description: "Borrador contractual preparado segun normativa espanola. Requiere validacion humana.",
        actionType: "generate_contract",
        payload: { summary: "Contrato de arras / mandato preparado para revision" },
        requiresHumanApproval: true,
        status: "pending",
        createdAt: new Date()
      });
    }

    return {
      reply,
      actionProposals
    };
  }
}
