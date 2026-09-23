/**
 * Módulo de Marca Blanca (White-Label) y Gestión de Equipo de Agencia
 * Diseñado para agentes independientes y pequeñas agencias (hasta 5 integrantes)
 * con estricto aislamiento por tenant_id.
 */

export type AgencyRole = "broker_titular" | "agente_senior" | "agente_asociado" | "coordinador";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: AgencyRole;
  phone: string;
  active: boolean;
  avatarUrl?: string;
}

export interface WhiteLabelConfig {
  tenantId: string;
  agencyName: string;
  brandSlogan: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  fiscalId: string;       // NIF / CIF de la agencia o agente
  apiNumber?: string;     // Número colegiación API / AICAT / RAICV
  contactEmail: string;
  contactPhone: string;
  address: string;
  website?: string;
  team: TeamMember[];     // Máximo 5 integrantes para el plan PYME / Autónomo
}

export const MAX_TEAM_SEATS = 5;

/**
 * Configuración por defecto para un nuevo tenant de marca blanca.
 */
export function getDefaultWhiteLabelConfig(tenantId: string = "inmobia360"): WhiteLabelConfig {
  return {
    tenantId,
    agencyName: "Inmobia 360",
    brandSlogan: "Tecnología Inmobiliaria 360° para Agentes Autónomos",
    primaryColor: "#2563eb", // Azul royal
    accentColor: "#f59e0b",  // Ámbar
    fiscalId: "B-88776655",
    apiNumber: "API-COL-45892",
    contactEmail: "contacto@inmobia360.com",
    contactPhone: "+34 910 000 000",
    address: "Calle Serrano 45, 28001 Madrid (España)",
    website: "https://inmobia360.com",
    team: [
      {
        id: "mem-1",
        name: "Director Broker",
        email: "broker@inmobia360.com",
        role: "broker_titular",
        phone: "+34 600 111 222",
        active: true
      },
      {
        id: "mem-2",
        name: "Carlos Mendoza",
        email: "carlos@inmobia360.com",
        role: "agente_senior",
        phone: "+34 600 333 444",
        active: true
      },
      {
        id: "mem-3",
        name: "Lucía Ortiz",
        email: "lucia@inmobia360.com",
        role: "coordinador",
        phone: "+34 600 555 666",
        active: true
      }
    ]
  };
}

/**
 * Valida que el equipo no exceda el límite de 5 plazas simultáneas.
 */
export function validateTeamCapacity(team: TeamMember[]): { valid: boolean; error?: string } {
  const activeMembers = team.filter(m => m.active);
  if (activeMembers.length > MAX_TEAM_SEATS) {
    return {
      valid: false,
      error: `El plan de pequeña agencia admite un máximo de ${MAX_TEAM_SEATS} agentes activos simultáneos. Actualmente hay ${activeMembers.length}.`
    };
  }
  return { valid: true };
}

/**
 * Traduce el rol técnico al título profesional en español peninsular normativo.
 */
export function formatAgencyRole(role: AgencyRole): string {
  switch (role) {
    case "broker_titular":
      return "Broker Titular / Director de Agencia";
    case "agente_senior":
      return "Agente Inmobiliario Senior";
    case "agente_asociado":
      return "Agente Asociado";
    case "coordinador":
      return "Coordinador / Gestión Documental";
    default:
      return "Agente";
  }
}
