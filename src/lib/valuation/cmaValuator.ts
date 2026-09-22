/**
 * Motor de Prevaloración Rápida Inmobiliaria (ACM - Análisis Comparativo de Mercado)
 * Proyecto: AI BROKER (inmobia360)
 * Requisitos Funcionales: RF-CMA2, RF-CMA3
 */

import { NeighborhoodAnalyzer } from '../geo/neighborhoodAnalyzer.ts';
import type { NeighborhoodProfile } from '../geo/neighborhoodAnalyzer.ts';
import { DraftGuard } from '../security/draftGuard.ts';
import type { DraftRecord } from '../security/draftGuard.ts';

export type PropertyCondition = 'a_reformar' | 'buen_estado' | 'reformado' | 'a_estrenar';

export interface CmaPropertyInput {
  address: string;
  builtM2: number;
  bedrooms: number;
  bathrooms: number;
  constructionYear: number;
  hasElevator: boolean;
  condition: PropertyCondition;
  clientTargetPrice?: number; // Pretensión inicial del propietario
  cadastralReference?: string;
  dossierId?: string;
}

export interface CmaValuationOutput {
  propertyAddress: string;
  zone: string;
  builtM2: number;
  estimatedPricePerM2: number;
  recommendedListingPrice: number;
  estimatedClosingPrice: number;
  clientPriceVariancePct: number | null;
  negotiationMarginPct: number;
  neighborhoodProfile: NeighborhoodProfile;
  valuationSummary: string;
  dossierReportDraft: DraftRecord;
}

// Precios base medios por m² según zona de referencia en España
const BASE_PRICES_PER_M2: Record<string, number> = {
  salamanca: 5800,
  goya: 5200,
  serrano: 6200,
  alcala: 4600,
  eixample: 4900,
  gracia: 4400,
  ruzafa: 2900,
  triana: 2700,
  centro: 4300,
  default: 2500
};

export class CmaValuator {
  /**
   * Resuelve el precio base medio por m² según la zona detectada en la dirección
   */
  static getBasePricePerM2(address: string): { baseM2: number; zoneName: string } {
    const lower = address.toLowerCase();
    for (const [key, price] of Object.entries(BASE_PRICES_PER_M2)) {
      if (lower.includes(key)) {
        return { baseM2: price, zoneName: key.charAt(0).toUpperCase() + key.slice(1) };
      }
    }
    return { baseM2: BASE_PRICES_PER_M2.default, zoneName: 'Mercado General' };
  }

  /**
   * Ejecuta el cálculo ACM y emite el Dossier de Prevaloración en borrador seguro
   */
  static async calculateValuation(tenantId: string, input: CmaPropertyInput): Promise<CmaValuationOutput> {
    if (!tenantId || tenantId.trim() === '') {
      throw new Error('Se requiere un tenant_id válido para emitir valoraciones inmobiliarias.');
    }
    if (!input.builtM2 || input.builtM2 <= 0) {
      throw new Error('La superficie construida debe ser un valor numérico positivo.');
    }

    const { baseM2, zoneName } = this.getBasePricePerM2(input.address);
    const neighborhood = await NeighborhoodAnalyzer.analyzeNeighborhood(input.address);

    // Factores de corrección sobre el valor del metro cuadrado
    let conditionFactor = 1.0;
    switch (input.condition) {
      case 'a_reformar':
        conditionFactor = 0.85; // -15%
        break;
      case 'buen_estado':
        conditionFactor = 1.00;
        break;
      case 'reformado':
        conditionFactor = 1.10; // +10%
        break;
      case 'a_estrenar':
        conditionFactor = 1.18; // +18%
        break;
    }

    // Factor ascensor (en España una vivienda sin ascensor en altura penaliza un 10%)
    const elevatorFactor = input.hasElevator ? 1.05 : 0.92;

    // Factor dotaciones de barrio (WalkScore elevado aporta hasta +4%)
    const amenityBonus = neighborhood.walkScore >= 80 ? 1.04 : 1.00;

    // Factor antigüedad
    let ageFactor = 1.00;
    if (input.constructionYear >= 2015) {
      ageFactor = 1.05;
    } else if (input.constructionYear < 1960 && (zoneName === 'Salamanca' || zoneName === 'Eixample')) {
      ageFactor = 1.08; // Finca regia / clásica protegida en zona prime
    } else if (input.constructionYear < 1975) {
      ageFactor = 0.95;
    }

    const estimatedPricePerM2 = Math.round(baseM2 * conditionFactor * elevatorFactor * amenityBonus * ageFactor);
    const estimatedClosingPrice = Math.round(estimatedPricePerM2 * input.builtM2);

    // Margen de negociación medio en España: 5% a 7% sobre el precio de salida
    const negotiationMarginPct = 6.0;
    const recommendedListingPrice = Math.round(estimatedClosingPrice * (1 + negotiationMarginPct / 100));

    // Variación con la pretensión del cliente (si existe)
    let clientPriceVariancePct: number | null = null;
    if (input.clientTargetPrice && input.clientTargetPrice > 0) {
      clientPriceVariancePct = parseFloat((((input.clientTargetPrice - recommendedListingPrice) / recommendedListingPrice) * 100).toFixed(1));
    }

    // Confección del informe maquetado para la visita de captación
    const reportText = `DOSSIER PROFESIONAL DE PREVALORACIÓN INMOBILIARIA (ACM)
==================================================================================
Plataforma: inmobia360 — AI BROKER (Servicios Inmobiliarios)
Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}
Finca evaluada: ${input.address}
Referencia catastral: ${input.cadastralReference || 'Pendiente de asignación'}

1. CARACTERÍSTICAS FÍSICAS Y CATASTRALES DE LA FINCA:
- Superficie construida: ${input.builtM2} m²
- Distribución: ${input.bedrooms} dormitorios, ${input.bathrooms} baños
- Año de construcción: ${input.constructionYear}
- Ascensor en finca: ${input.hasElevator ? 'Sí' : 'No'}
- Estado de conservación: ${input.condition.replace('_', ' ').toUpperCase()}

2. ANÁLISIS DE LA MICRO-ZONA Y DOTACIONES:
- Entorno urbano: ${neighborhood.zone}
- Calificación peatonal: ${neighborhood.walkScore}/100 (${neighborhood.walkScoreLabel})
- Comunicaciones de transporte: ${neighborhood.transportSummary}
- Equipamientos de proximidad: ${neighborhood.servicesSummary}

3. HORQUILLA DE PRECIOS Y VALORACIÓN COMPARATIVA DE MERCADO:
- Valor estimado medio de mercado: ${estimatedPricePerM2.toLocaleString('es-ES')} €/m²
- Precio recomendado de salida en portales: ${recommendedListingPrice.toLocaleString('es-ES')} €
- Precio objetivo estimado de cierre en notaría: ${estimatedClosingPrice.toLocaleString('es-ES')} €
- Margen prudencial de negociación aconsejado: ${negotiationMarginPct}%
${clientPriceVariancePct !== null ? `- Pretensión inicial del propietario: ${input.clientTargetPrice?.toLocaleString('es-ES')} € (${clientPriceVariancePct > 0 ? '+' : ''}${clientPriceVariancePct}% sobre valor de mercado)` : ''}

4. ARGUMENTARIO DE CAPTACIÓN PARA EL AGENTE:
- Si el propietario exige salir por encima de ${recommendedListingPrice.toLocaleString('es-ES')} €, advertir del riesgo de "quemar el inmueble" en los portales durante los primeros 45 días.
- Justificar el precio basándose en la superficie útil, estado de la finca y dotaciones de transporte contrastadas (${neighborhood.transportSummary}).
- Recomendar formalizar la Nota de Encargo con banda autorizada de hasta ${estimatedClosingPrice.toLocaleString('es-ES')} € para cerrar con compradores solventes.
`;

    // Modo Borrador Seguro: El dossier nace en draft_pending para validación del agente
    const draft = DraftGuard.createDraft(tenantId, {
      documentType: 'other',
      title: `Dossier de Prevaloración ACM - ${input.address}`,
      content: reportText,
      dossierId: input.dossierId,
      metadata: {
        type: 'cma_valuation',
        recommendedListingPrice,
        estimatedClosingPrice,
        pricePerM2: estimatedPricePerM2,
        walkScore: neighborhood.walkScore
      }
    });

    return {
      propertyAddress: input.address,
      zone: neighborhood.zone,
      builtM2: input.builtM2,
      estimatedPricePerM2,
      recommendedListingPrice,
      estimatedClosingPrice,
      clientPriceVariancePct,
      negotiationMarginPct,
      neighborhoodProfile: neighborhood,
      valuationSummary: `Prevaloración: ${recommendedListingPrice.toLocaleString('es-ES')} € salida (${estimatedPricePerM2} €/m²) | Cierre estimado en notaría: ${estimatedClosingPrice.toLocaleString('es-ES')} €`,
      dossierReportDraft: draft
    };
  }
}
