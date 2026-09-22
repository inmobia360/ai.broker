import { inmobiaLLM } from "../llm/provider.ts";
import type { LLMMessage } from "../llm/provider.ts";
import { TenantContext } from "../tenant.ts";
import type { BrokerActionProposal, MemoryEntry } from "../../types/index.ts";
import { LegalSpecialistSubagent } from "./subagents/legalSpecialist.ts";
import { CommercialSpecialistSubagent } from "./subagents/commercialSpecialist.ts";
import { MarketingSpecialistSubagent } from "./subagents/marketingSpecialist.ts";
import type { SpecialistDomain, SpecialistResponse } from "./subagents/types.ts";

const SYSTEM_PROMPT_DIRECTOR_BROKER = `Eres el Director BROKER, la máxima autoridad cognitiva y de supervisión de la agencia inmobiliaria en España (broker.inmobia360.com).
Coordinas un equipo de asistentes técnicos especializados (Legal, Comercial, Marketing) para prestar soporte integral a los agentes independientes y directores.

PRINCIPIOS INVIOLABLES DE TU CONSTITUCIÓN:
1. Interlocutor Único (RF-4): Eres el ÚNICO interlocutor directo con el usuario. Ningún asistente especializado puede interactuar desintermediadamente con el agente.
2. Memoria Canónica (Principio 2): Solo tú consolidas y autorizas la memoria canónica de la agencia.
3. Modo Borrador Seguro (RF-5, RF-6): Jamás envías mensajes, contratos ni comunicaciones al exterior sin la revisión y aprobación humana explícita previa en 1 toque.
4. Rigor Legal Español: Te riges por el Código Civil (Arras Art. 1454 C.C.), la Ley de Arrendamientos Urbanos (LAU 29/1994) y la Ley 12/2023 por el Derecho a la Vivienda.
5. Cero Fugas de PII: Preservas la confidencialidad absoluta de DNI, datos de propietarios y nóminas.
6. Tono y Estilo: Español peninsular impecable, directo, ejecutivo y sin clichés comerciales.`;

export interface BrokerDirectorResult {
  reply: string;
  provider: string;
  latencyMs: number;
  fallbackUsed: boolean;
  actionProposals: BrokerActionProposal[];
  delegatedSpecialists: SpecialistDomain[];
}

export class BrokerDirector {
  private tenantCtx: TenantContext;
  private brokerSessionToken: string;
  private legalSpecialist: LegalSpecialistSubagent;
  private commercialSpecialist: CommercialSpecialistSubagent;
  private marketingSpecialist: MarketingSpecialistSubagent;

  constructor(tenantId: string) {
    this.tenantCtx = new TenantContext(tenantId);
    this.brokerSessionToken = `broker-internal-auth:${tenantId}:${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.legalSpecialist = new LegalSpecialistSubagent();
    this.commercialSpecialist = new CommercialSpecialistSubagent();
    this.marketingSpecialist = new MarketingSpecialistSubagent();
  }

  getTenantId(): string {
    return this.tenantCtx.getTenantId();
  }

  isSingleInterlocutorEnforced(): boolean {
    return true;
  }

  /**
   * Procesa la consulta del usuario inmobiliario canalizando exclusivamente a través del Director BROKER.
   * Si la consulta requiere análisis específico, delega internamente en los subagentes especializados,
   * consolida sus informes y emite una respuesta unificada con propuestas en borrador seguro (RF-4, RF-5).
   */
  async processUserMessage(
    userMessage: string,
    conversationHistory: LLMMessage[] = []
  ): Promise<BrokerDirectorResult> {
    const tenantId = this.tenantCtx.getTenantId();
    const lower = userMessage.toLowerCase();
    const delegatedSpecialists: SpecialistDomain[] = [];
    const specialistReports: string[] = [];
    const actionProposals: BrokerActionProposal[] = [];

    // 1. Detección y delegación interna al especialista jurídico
    if (
      lower.includes("arras") ||
      lower.includes("contrato") ||
      lower.includes("alquiler") ||
      lower.includes("lau") ||
      lower.includes("visita") ||
      lower.includes("honorarios") ||
      lower.includes("reserva") ||
      lower.includes("señal")
    ) {
      delegatedSpecialists.push("legal");
      const legalRes = await this.legalSpecialist.executeInternalTask({
        tenantId,
        userMessage,
        brokerSessionToken: this.brokerSessionToken
      });
      specialistReports.push(`[Informe Especialista Jurídico]: ${legalRes.analysis}`);

      if (legalRes.draftProposal) {
        actionProposals.push({
          id: `draft-${Date.now()}-${legalRes.draftProposal.documentType}`,
          tenantId,
          title: legalRes.draftProposal.title,
          description: legalRes.draftProposal.summary,
          actionType: "generate_contract",
          payload: {
            documentType: legalRes.draftProposal.documentType,
            content: legalRes.draftProposal.content,
            requiresReview: true
          },
          requiresHumanApproval: true,
          status: "pending",
          createdAt: new Date()
        });
      }
    }

    // 2. Detección y delegación interna al especialista comercial / cualificación
    if (
      lower.includes("lead") ||
      lower.includes("comprador") ||
      lower.includes("cualifica") ||
      lower.includes("presupuesto") ||
      lower.includes("llamada") ||
      lower.includes("solvencia")
    ) {
      delegatedSpecialists.push("commercial");
      const commRes = await this.commercialSpecialist.executeInternalTask({
        tenantId,
        userMessage,
        brokerSessionToken: this.brokerSessionToken
      });
      specialistReports.push(`[Informe Especialista Comercial]: ${commRes.analysis}`);

      if (commRes.draftProposal) {
        actionProposals.push({
          id: `draft-${Date.now()}-buyer-qual`,
          tenantId,
          title: commRes.draftProposal.title,
          description: commRes.draftProposal.summary,
          actionType: "update_case_status",
          payload: {
            documentType: commRes.draftProposal.documentType,
            content: commRes.draftProposal.content,
            recommendedAction: "immediate_call"
          },
          requiresHumanApproval: true,
          status: "pending",
          createdAt: new Date()
        });
      }
    }

    // 3. Detección y delegación interna al especialista de marketing / portales
    if (
      lower.includes("idealista") ||
      lower.includes("fotocasa") ||
      lower.includes("anuncio") ||
      lower.includes("portales") ||
      lower.includes("ficha") ||
      lower.includes("publicar")
    ) {
      delegatedSpecialists.push("marketing");
      const mktRes = await this.marketingSpecialist.executeInternalTask({
        tenantId,
        userMessage,
        brokerSessionToken: this.brokerSessionToken
      });
      specialistReports.push(`[Informe Especialista Marketing]: ${mktRes.analysis}`);

      if (mktRes.draftProposal) {
        actionProposals.push({
          id: `draft-${Date.now()}-ad-listing`,
          tenantId,
          title: mktRes.draftProposal.title,
          description: mktRes.draftProposal.summary,
          actionType: "publish_draft",
          payload: {
            documentType: mktRes.draftProposal.documentType,
            content: mktRes.draftProposal.content
          },
          requiresHumanApproval: true,
          status: "pending",
          createdAt: new Date()
        });
      }
    }

    // 4. Construcción del contexto consolidado para inferencia (Ollama VPS Hostinger / Fallback)
    const specialistContext = specialistReports.length > 0
      ? `\n\nInformes internos recabados de tus especialistas técnicos:\n${specialistReports.join("\n\n")}\nSintetiza estos hallazgos con tu criterio directivo y confirma al agente las acciones preparadas en borrador seguro pendientes de su aprobación.`
      : "";

    const messages: LLMMessage[] = [
      { role: "system", content: SYSTEM_PROMPT_DIRECTOR_BROKER + specialistContext },
      ...conversationHistory,
      { role: "user", content: userMessage }
    ];

    const llmRes = await inmobiaLLM.generateReply(messages);

    return {
      reply: llmRes.content,
      provider: llmRes.provider,
      latencyMs: llmRes.latencyMs,
      fallbackUsed: llmRes.fallbackUsed,
      actionProposals,
      delegatedSpecialists
    };
  }

  /**
   * Consolidación autorizada en la memoria canónica de la agencia.
   * Conforme al Principio 2 de la Constitución, SOLO el Director BROKER puede escribir en memoria canónica.
   */
  async consolidateCanonicalMemory(entry: {
    category: "policy" | "market_rule" | "commission" | "procedure";
    contentAnonimized: string;
  }): Promise<MemoryEntry> {
    const memoryRecord: MemoryEntry = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tenantId: this.tenantCtx.getTenantId(),
      category: entry.category,
      contentAnonimized: entry.contentAnonimized,
      status: "approved",
      approvedByBroker: true,
      createdAt: new Date()
    };

    return memoryRecord;
  }
}
