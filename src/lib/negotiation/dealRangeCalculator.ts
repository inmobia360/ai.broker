/**
 * Módulo de Negociación: Evaluador de Banda de Acuerdo y Argumentario Comercial
 * Proyecto: AI BROKER (inmobia360)
 * Requisitos Funcionales: RF-M5, RF-M6
 */

export interface DealNegotiationInput {
  askingPrice: number;
  minAcceptedPrice: number;
  offeredPrice: number;
  buyerHasMortgagePreApproval?: boolean;
  buyerDownPaymentPercentage?: number; // ej. 20%, 30%
  proposedCompletionDays?: number; // ej. 30, 45, 60 días
  marketEstimatedPrice?: number;
}

export interface DealNegotiationAnalysis {
  isViable: boolean;
  dealZone: {
    minViablePrice: number;
    targetPrice: number;
    suggestedCounterOffer: number;
  };
  discountPercentage: number;
  closingProbability: 'alta' | 'media' | 'baja';
  keyCommercialArguments: string[];
  recommendationToAgent: string;
}

export class DealRangeCalculator {
  /**
   * Analiza la oferta económica, calcula la banda de acuerdo viable
   * y genera los argumentos comerciales para defender la operación.
   */
  static analyzeDeal(input: DealNegotiationInput): DealNegotiationAnalysis {
    const { askingPrice, minAcceptedPrice, offeredPrice } = input;
    
    // Descuento respecto al precio de salida
    const discountPercentage = Number((((askingPrice - offeredPrice) / askingPrice) * 100).toFixed(1));
    
    // Banda de acuerdo: el suelo es el mínimo aceptado, el techo el precio de salida
    const minViablePrice = minAcceptedPrice;
    const targetPrice = Math.round((minAcceptedPrice + askingPrice) / 2);

    const keyCommercialArguments: string[] = [];
    let closingProbability: 'alta' | 'media' | 'baja' = 'media';
    let suggestedCounterOffer: number;
    let isViable = false;

    if (offeredPrice >= askingPrice) {
      // Caso oferta plena
      isViable = true;
      closingProbability = 'alta';
      suggestedCounterOffer = askingPrice;
      keyCommercialArguments.push('Oferta a precio pleno de salida. Proceder de inmediato al Cierre Documental con Arras (Art. 1454 C.C.).');
    } else if (offeredPrice >= minAcceptedPrice) {
      // Caso dentro del margen ya autorizado por el propietario
      isViable = true;
      closingProbability = 'alta';
      // Contraoferta táctica ligeramente superior para cerrar en target
      suggestedCounterOffer = Math.min(askingPrice, Math.round((offeredPrice + targetPrice) / 2));
      keyCommercialArguments.push(`La oferta de ${offeredPrice.toLocaleString('es-ES')} € se sitúa por encima del suelo autorizado de ${minAcceptedPrice.toLocaleString('es-ES')} €.`);
      keyCommercialArguments.push(`Se aconseja plantear contraoferta de cierre en ${suggestedCounterOffer.toLocaleString('es-ES')} €.`);
    } else {
      // Caso oferta por debajo del suelo mínimo
      const gapToMin = minAcceptedPrice - offeredPrice;
      const gapPercentage = Number(((gapToMin / minAcceptedPrice) * 100).toFixed(1));

      if (gapPercentage <= 6.0) {
        // Brecha corta (<6%): altamente negociable
        isViable = true;
        closingProbability = 'media';
        suggestedCounterOffer = minAcceptedPrice;
        keyCommercialArguments.push(`Brecha negociable del ${gapPercentage}% respecto al suelo del vendedor.`);
        keyCommercialArguments.push(`Recomendar al vendedor aceptación condicionada a reducción de plazos de escritura.`);
      } else {
        // Brecha amplia (>6%): baja viabilidad directa
        isViable = false;
        closingProbability = 'baja';
        suggestedCounterOffer = Math.round((minAcceptedPrice + offeredPrice) / 2);
        keyCommercialArguments.push(`Oferta con descuento agresivo del ${discountPercentage}%, por debajo del suelo de encargo en ${gapToMin.toLocaleString('es-ES')} €.`);
        keyCommercialArguments.push('Presentar contraoferta formal con argumentario de comparables de mercado de la zona.');
      }
    }

    // Argumentos de agilidad financiera
    if (input.buyerHasMortgagePreApproval) {
      keyCommercialArguments.push('Comprador con pre-aprobación bancaria: minimiza el riesgo de denegación de hipoteca y agiliza la firma en 45 días.');
    }
    if (input.proposedCompletionDays && input.proposedCompletionDays <= 45) {
      keyCommercialArguments.push(`Plazo de elevación a público muy ágil (${input.proposedCompletionDays} días naturales), reduciendo los costes de mantenimiento del vendedor.`);
    }

    const recommendation = isViable
      ? `Operación viable. Se sugiere contraofertar ${suggestedCounterOffer.toLocaleString('es-ES')} € solicitando señal de arras del 10% para formalizar el Cierre Documental.`
      : `Oferta por debajo del umbral mínimo del encargo. Contraofertar ${suggestedCounterOffer.toLocaleString('es-ES')} € o solicitar entrevista de ajuste con el comprador.`;

    return {
      isViable,
      dealZone: {
        minViablePrice,
        targetPrice,
        suggestedCounterOffer
      },
      discountPercentage,
      closingProbability,
      keyCommercialArguments,
      recommendationToAgent: recommendation
    };
  }
}
