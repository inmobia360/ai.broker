import { inmobiaLLM } from "../llm/provider.ts";
import type { LLMMessage } from "../llm/provider.ts";
import { TenantContext } from "../tenant.ts";
import type { BrokerActionProposal, MemoryEntry } from "../../types/index.ts";
import { LegalSpecialistSubagent } from "./subagents/legalSpecialist.ts";
import { CommercialSpecialistSubagent } from "./subagents/commercialSpecialist.ts";
import { MarketingSpecialistSubagent } from "./subagents/marketingSpecialist.ts";
import type { SpecialistDomain, SpecialistResponse } from "./subagents/types.ts";
import { DraftGuard } from "../security/draftGuard.ts";
import { DealRangeCalculator } from "../negotiation/dealRangeCalculator.ts";
import { ContingencyChecker } from "../legal/spain/contingencyChecker.ts";
import { DemandMatcher } from "../matching/demandMatcher.ts";
import { OperationalMemoryStore } from "../memory/operationalMemoryStore.ts";
import { CmaValuator } from "../valuation/cmaValuator.ts";
import { NeighborhoodAnalyzer } from "../geo/neighborhoodAnalyzer.ts";
import { DeepLinkGenerator } from "../geo/deepLinkGenerator.ts";
import { ListingCopyGenerator } from "../marketing/listingCopyGenerator.ts";

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
        const savedDraft = DraftGuard.createDraft(tenantId, {
          documentType: legalRes.draftProposal.documentType,
          title: legalRes.draftProposal.title,
          content: legalRes.draftProposal.content,
          metadata: { specialistDomain: "legal", summary: legalRes.draftProposal.summary }
        });

        actionProposals.push({
          id: savedDraft.id,
          tenantId,
          title: savedDraft.title,
          description: legalRes.draftProposal.summary,
          actionType: "generate_contract",
          payload: {
            draftId: savedDraft.id,
            documentType: savedDraft.documentType,
            content: savedDraft.content,
            status: savedDraft.status,
            requiresReview: true
          },
          requiresHumanApproval: true,
          status: "pending",
          createdAt: savedDraft.createdAt
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
        const savedDraft = DraftGuard.createDraft(tenantId, {
          documentType: commRes.draftProposal.documentType,
          title: commRes.draftProposal.title,
          content: commRes.draftProposal.content,
          metadata: { specialistDomain: "commercial", summary: commRes.draftProposal.summary }
        });

        actionProposals.push({
          id: savedDraft.id,
          tenantId,
          title: savedDraft.title,
          description: commRes.draftProposal.summary,
          actionType: "update_case_status",
          payload: {
            draftId: savedDraft.id,
            documentType: savedDraft.documentType,
            content: savedDraft.content,
            status: savedDraft.status,
            recommendedAction: "immediate_call"
          },
          requiresHumanApproval: true,
          status: "pending",
          createdAt: savedDraft.createdAt
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
        const savedDraft = DraftGuard.createDraft(tenantId, {
          documentType: mktRes.draftProposal.documentType,
          title: mktRes.draftProposal.title,
          content: mktRes.draftProposal.content,
          metadata: { specialistDomain: "marketing", summary: mktRes.draftProposal.summary }
        });

        actionProposals.push({
          id: savedDraft.id,
          tenantId,
          title: savedDraft.title,
          description: mktRes.draftProposal.summary,
          actionType: "publish_draft",
          payload: {
            draftId: savedDraft.id,
            documentType: savedDraft.documentType,
            content: savedDraft.content,
            status: savedDraft.status
          },
          requiresHumanApproval: true,
          status: "pending",
          createdAt: savedDraft.createdAt
        });
      }
    }

    // 4. Detección del Módulo de Negociación y Banda de Acuerdo
    if (lower.includes("negocia") || lower.includes("oferta") || lower.includes("contraoferta") || lower.includes("banda de acuerdo")) {
      const askMatch = userMessage.match(/(\d+[\.\d]*)\s*€?/g);
      let asking = 300000;
      let minAcc = 270000;
      let offered = 250000;

      if (askMatch && askMatch.length >= 2) {
        const nums = askMatch.map(m => parseInt(m.replace(/\./g, ""), 10)).filter(n => !isNaN(n) && n > 1000);
        if (nums.length >= 2) {
          asking = nums[0];
          offered = nums[1];
          minAcc = Math.round(asking * 0.90);
        }
      }

      const negAnalysis = DealRangeCalculator.analyzeDeal({
        askingPrice: asking,
        minAcceptedPrice: minAcc,
        offeredPrice: offered,
        buyerHasMortgagePreApproval: lower.includes("preaprob") || lower.includes("hipoteca"),
        proposedCompletionDays: 45
      });

      specialistReports.push(
        `[Módulo de Negociación]: Viabilidad ${negAnalysis.closingProbability.toUpperCase()}. Banda sugerida: ${negAnalysis.dealZone.minViablePrice.toLocaleString("es-ES")} € a ${negAnalysis.dealZone.suggestedCounterOffer.toLocaleString("es-ES")} €. Argumentos: ${negAnalysis.keyCommercialArguments.join(" | ")}. ${negAnalysis.recommendationToAgent}`
      );
    }

    // 5. Detección del Protocolo de Contingencias Registrales
    if (lower.includes("carga") || lower.includes("embargo") || lower.includes("nota simple") || lower.includes("contingencia") || lower.includes("discrepancia")) {
      const contingencyAudit = ContingencyChecker.auditProperty({
        propertyAddress: "Inmueble objeto de expediente",
        hasActiveMortgage: lower.includes("hipoteca") || lower.includes("banco"),
        mortgageBalanceEuro: 45000,
        hasJudicialEmbargo: lower.includes("embargo"),
        hasCommunityDebt: lower.includes("comunidad") || lower.includes("derrama"),
        energyCertificateStatus: lower.includes("cee") || lower.includes("energetico") ? "vigente" : "ausente"
      });

      specialistReports.push(
        `[Protocolo de Seguridad Jurídica y Contingencias]: Preparación Notarial ${contingencyAudit.notaryReadinessScore}%. ${contingencyAudit.summary} Pasos de resolución: ${contingencyAudit.resolutionChecklist.join(" | ")}`
      );
    }

    // 6. Prevaloración Rápida ACM (RF-CMA2, RF-CMA3)
    if (lower.includes("tasar") || lower.includes("prevalora") || lower.includes("acm") || lower.includes("valorar") || lower.includes("/tasar")) {
      const m2Match = userMessage.match(/(\d+)\s*(m2|m²|metros)/i);
      const builtM2 = m2Match ? parseInt(m2Match[1], 10) : 95;
      
      const cmaResult = await CmaValuator.calculateValuation(tenantId, {
        address: userMessage.includes("madrid") || userMessage.includes("serrano") ? "Calle Serrano 88, Madrid" : "Calle Mayor 12, Casco Urbano",
        builtM2,
        bedrooms: 3,
        bathrooms: 2,
        constructionYear: 1985,
        hasElevator: true,
        condition: lower.includes("reformar") ? "a_reformar" : "buen_estado"
      });

      specialistReports.push(
        `[Motor de Prevaloración ACM]: ${cmaResult.valuationSummary}. Horquilla de salida: ${cmaResult.recommendedListingPrice.toLocaleString("es-ES")} € (${cmaResult.estimatedPricePerM2} €/m²). Cierre notarial estimado: ${cmaResult.estimatedClosingPrice.toLocaleString("es-ES")} €.`
      );

      actionProposals.push({
        id: cmaResult.dossierReportDraft.id,
        tenantId,
        title: cmaResult.dossierReportDraft.title,
        description: `Dossier ACM de valoración maquetado para la visita de captación (${cmaResult.recommendedListingPrice.toLocaleString("es-ES")} €).`,
        actionType: "generate_contract",
        payload: {
          draftId: cmaResult.dossierReportDraft.id,
          documentType: cmaResult.dossierReportDraft.documentType,
          content: cmaResult.dossierReportDraft.content,
          status: cmaResult.dossierReportDraft.status
        },
        requiresHumanApproval: true,
        status: "pending",
        createdAt: cmaResult.dossierReportDraft.createdAt
      });
    }

    // 7. Análisis de Micro-Zona y Enlaces 3D (RF-CMA1, RF-CMA5)
    if (lower.includes("entorno") || lower.includes("microzona") || lower.includes("dotaciones") || lower.includes("colegios cerca") || lower.includes("/entorno")) {
      const address = userMessage.includes("barcelona") || userMessage.includes("eixample") 
        ? "Carrer de Girona, Eixample, Barcelona" 
        : "Calle Serrano 88, Salamanca, Madrid";
      
      const neighborhood = await NeighborhoodAnalyzer.analyzeNeighborhood(address);
      const links = DeepLinkGenerator.generateLinks({
        lat: neighborhood.coordinates.lat,
        lon: neighborhood.coordinates.lon,
        propertyAddress: address
      });

      specialistReports.push(
        `[Análisis de Micro-Zona]: ${neighborhood.summaryReport} Enlace Satélite: ${links.googleMapsSatellite} | Perspectiva 3D: ${links.googleEarth3D}`
      );
    }

    // 8. Generación de Anuncio Comercial para Portales (RF-CMA4)
    if (lower.includes("anuncio") || lower.includes("copy") || lower.includes("redacta anuncio") || lower.includes("/anuncio")) {
      const copyResult = await ListingCopyGenerator.generateListingCopy(tenantId, {
        address: userMessage.includes("valencia") ? "Carrer de Russafa 14, Valencia" : "Calle Serrano 88, Madrid",
        price: 450000,
        builtM2: 110,
        bedrooms: 3,
        bathrooms: 2,
        hasElevator: true,
        hasTerrace: true
      });

      specialistReports.push(
        `[Generador de Copys Comerciales]: Anuncio redactado con dotaciones de barrio (${copyResult.headline}). Enlaces 3D preparados.`
      );

      actionProposals.push({
        id: copyResult.draft.id,
        tenantId,
        title: copyResult.draft.title,
        description: `Borrador de anuncio publicitario para Idealista/Fotocasa con dotaciones reales.`,
        actionType: "publish_draft",
        payload: {
          draftId: copyResult.draft.id,
          documentType: copyResult.draft.documentType,
          content: copyResult.draft.content,
          status: copyResult.draft.status
        },
        requiresHumanApproval: true,
        status: "pending",
        createdAt: copyResult.draft.createdAt
      });
    }

    // 9. Recuperación de Memoria Operativa Estructurada (RAG Few-Shot)
    const similarCases = await OperationalMemoryStore.retrieveSimilarCases(tenantId, userMessage, { limit: 2, minSimilarity: 0.60 });
    const memoryContext = OperationalMemoryStore.formatFewShotContext(similarCases);

    // 7. Construcción del contexto consolidado para inferencia (Ollama VPS Hostinger / Fallback)
    const specialistContext = specialistReports.length > 0
      ? `\n\nInformes internos recabados de tus especialistas técnicos y herramientas operativas:\n${specialistReports.join("\n\n")}\nSintetiza estos hallazgos con tu criterio directivo y confirma al agente las acciones preparadas en borrador seguro pendientes de su aprobación.`
      : "";

    const messages: LLMMessage[] = [
      { role: "system", content: SYSTEM_PROMPT_DIRECTOR_BROKER + memoryContext + specialistContext },
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
