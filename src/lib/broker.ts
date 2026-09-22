import { BrokerDirector } from "./ai/brokerDirector.ts";
import type { BrokerDirectorResult } from "./ai/brokerDirector.ts";
import type { LLMMessage } from "./llm/provider.ts";
import type { BrokerActionProposal } from "../types/index.ts";

export { BrokerDirector };
export type { BrokerDirectorResult };

/**
 * BrokerOrchestrator implementa la fachada del Director BROKER
 * manteniendo compatibilidad y canalizando a través de BrokerDirector (RF-4).
 */
export class BrokerOrchestrator {
  private director: BrokerDirector;

  constructor(tenantId: string) {
    this.director = new BrokerDirector(tenantId);
  }

  getTenantId(): string {
    return this.director.getTenantId();
  }

  async processMessage(
    userMessage: string,
    conversationHistory: LLMMessage[] = []
  ): Promise<{
    reply: string;
    provider: string;
    latencyMs: number;
    fallbackUsed: boolean;
    actionProposals: BrokerActionProposal[];
    delegatedSpecialists?: string[];
  }> {
    const result = await this.director.processUserMessage(userMessage, conversationHistory);
    return {
      reply: result.reply,
      provider: result.provider,
      latencyMs: result.latencyMs,
      fallbackUsed: result.fallbackUsed,
      actionProposals: result.actionProposals,
      delegatedSpecialists: result.delegatedSpecialists
    };
  }
}
