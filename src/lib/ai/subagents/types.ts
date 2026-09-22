import type { BrokerActionProposal } from "../../../types/index.ts";

export type SpecialistDomain = "legal" | "commercial" | "marketing";

export interface SpecialistTaskRequest {
  tenantId: string;
  userMessage: string;
  context?: Record<string, any>;
  brokerSessionToken: string;
}

export interface SpecialistDraftProposal {
  documentType: "arras" | "lau" | "visita" | "idealista_ad" | "whatsapp_reply" | "buyer_qualification";
  title: string;
  summary: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface SpecialistResponse {
  domain: SpecialistDomain;
  specialistName: string;
  analysis: string;
  draftProposal?: SpecialistDraftProposal;
  actionProposal?: BrokerActionProposal;
}
