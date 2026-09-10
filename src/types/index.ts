export type UserRole = "owner" | "broker_admin" | "agent";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  brandColor?: string;
  logoUrl?: string;
  sharingPolicy: "private_by_default" | "shared";
  createdAt: Date;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export type CaseStatus = 
  | "prospect" 
  | "documentation_pending" 
  | "active" 
  | "deposit_reserved" 
  | "closing" 
  | "closed" 
  | "archived";

export interface PropertyCase {
  id: string;
  tenantId: string;
  title: string;
  catastralReference?: string;
  address?: string;
  operationType: "sale" | "rent";
  price: number;
  status: CaseStatus;
  assignedAgentId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryEntry {
  id: string;
  tenantId: string;
  category: "policy" | "market_rule" | "commission" | "procedure";
  contentAnonimized: string;
  status: "approved" | "pending_review";
  approvedByBroker: boolean;
  createdAt: Date;
}

export interface BrokerActionProposal {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  actionType: "generate_contract" | "request_catastro" | "publish_draft" | "update_case_status";
  payload: Record<string, any>;
  requiresHumanApproval: true;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}
