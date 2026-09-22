/**
 * Servicio de Emparejamiento Inverso de Demanda (Matching Inteligente)
 * Proyecto: AI BROKER (inmobia360)
 * Requisitos Funcionales: RF-M3, RF-M4, RNF-M1
 */

import { generateEmbedding, cosineSimilarity } from '../db/vectorStore.ts';

export interface BuyerProfile {
  id: string;
  tenantId: string;
  fullName: string;
  phone?: string;
  email?: string;
  targetZones: string[];
  maxBudget: number;
  minBedrooms?: number;
  propertyTypePreference: string; // 'piso', 'chalet', 'atico', 'apartamento'
  hasFinancialPreApproval: boolean;
  notes?: string;
}

export interface PropertyMatchTarget {
  id: string;
  tenantId: string;
  title: string;
  zone: string;
  price: number;
  bedrooms: number;
  propertyType: string;
  description: string;
}

export interface DemandMatchResult {
  buyer: BuyerProfile;
  affinityScore: number; // 0.0 a 1.0
  reasons: string[];
  suggestedOutreachMessage: string;
}

export class DemandMatcher {
  /**
   * Ejecuta el emparejamiento inverso de demanda para un inmueble
   */
  static async matchPropertyToBuyers(
    property: PropertyMatchTarget,
    buyers: BuyerProfile[],
    affinityCutoff: number = 0.75
  ): Promise<DemandMatchResult[]> {
    // 1. Filtrado de seguridad multi-tenant (RNF-M1)
    const tenantBuyers = buyers.filter(b => b.tenantId === property.tenantId);
    if (tenantBuyers.length === 0) return [];

    const propertySemanticText = `${property.title} en ${property.zone}. Tipo: ${property.propertyType}. ${property.bedrooms} dormitorios. Precio: ${property.price} euros. ${property.description}`;
    const propertyEmbedding = await generateEmbedding(propertySemanticText);

    const matches: DemandMatchResult[] = [];

    for (const buyer of tenantBuyers) {
      // 2. Filtro preliminar de presupuesto (+/- 15% de margen de negociación)
      const maxViablePrice = buyer.maxBudget * 1.15;
      if (property.price > maxViablePrice) {
        continue;
      }

      // 3. Similitud semántica vectorial (pgvector cosine similarity)
      const buyerSemanticText = `Busca ${buyer.propertyTypePreference} en ${buyer.targetZones.join(', ')}. Presupuesto máximo ${buyer.maxBudget} euros. ${buyer.minBedrooms ? `Al menos ${buyer.minBedrooms} dormitorios.` : ''} ${buyer.notes || ''}`;
      const buyerEmbedding = await generateEmbedding(buyerSemanticText);
      const vectorScore = cosineSimilarity(propertyEmbedding, buyerEmbedding);

      // 4. Ponderación de factores y solvencia financiera
      let finalAffinity = vectorScore;
      const reasons: string[] = [];

      // Concordancia de zona geográfica
      const matchesZone = buyer.targetZones.some(z => 
        property.zone.toLowerCase().includes(z.toLowerCase()) || 
        z.toLowerCase().includes(property.zone.toLowerCase())
      );
      if (matchesZone) {
        finalAffinity = Math.min(1.0, finalAffinity + 0.08);
        reasons.push(`Ubicación coincidente con zona de preferencia (${property.zone})`);
      }

      // Concordancia de precio en presupuesto
      if (property.price <= buyer.maxBudget) {
        finalAffinity = Math.min(1.0, finalAffinity + 0.05);
        reasons.push(`Precio dentro del presupuesto objetivo (${property.price.toLocaleString('es-ES')} € <= ${buyer.maxBudget.toLocaleString('es-ES')} €)`);
      } else {
        reasons.push(`Requiere negociación de precio (${Math.round(((property.price - buyer.maxBudget) / buyer.maxBudget) * 100)}% sobre presupuesto)`);
      }

      // Bonificación por solvencia financiera pre-aprobada
      if (buyer.hasFinancialPreApproval) {
        finalAffinity = Math.min(1.0, finalAffinity + 0.05);
        reasons.push('Perfil con viabilidad hipotecaria pre-aprobada');
      }

      // 5. Aplicar umbral de corte de afinidad (por defecto 0.75)
      if (finalAffinity >= affinityCutoff) {
        const outreachMessage = this.generateOutreachMessage(buyer, property, finalAffinity);
        matches.push({
          buyer,
          affinityScore: Number(finalAffinity.toFixed(2)),
          reasons,
          suggestedOutreachMessage: outreachMessage
        });
      }
    }

    // Ordenar de mayor a menor afinidad
    return matches.sort((a, b) => b.affinityScore - a.affinityScore);
  }

  /**
   * Genera el borrador de comunicación personalizado para el comprador
   */
  private static generateOutreachMessage(
    buyer: BuyerProfile,
    property: PropertyMatchTarget,
    affinity: number
  ): string {
    const formattedPrice = property.price.toLocaleString('es-ES') + ' €';
    const percentMatch = Math.round(affinity * 100);

    return `Hola ${buyer.fullName}, te contacto desde la agencia. Acabamos de incorporar en exclusiva una propiedad en ${property.zone} (${property.title}, ${property.bedrooms} hab., ${formattedPrice}) que coincide al ${percentMatch}% con tus preferencias de búsqueda antes de su salida a portales. ¿Deseas que coordinemos una visita preferente esta semana?`;
  }
}
