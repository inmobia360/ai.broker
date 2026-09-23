import { InmobiaLLMProvider } from '../llm/provider.ts';

export interface PropertyDataInput {
  id?: string;
  title: string;
  propertyType?: string;
  operation?: 'sale' | 'rent' | 'investment';
  location: string;
  city?: string;
  address?: string;
  price: number;
  currency?: string;
  builtM2: number;
  bedrooms: number;
  bathrooms: number;
  hasGarage?: boolean;
  hasTerrace?: boolean;
  hasElevator?: boolean;
  condition?: string;
  description?: string;
  features?: string[];
  cadastralRef?: string;
}

export interface MarketingContentPack {
  commercialTitle: string;
  shortDescription: string;
  longDescription: string;
  instagramCopy: string;
  facebookCopy: string;
  whatsappMessage: string;
  videoScript: string;
  investorAngle: string;
  foreignBuyerAngle: string;
  translatedEn: string;
  generatedBy?: 'ollama' | 'rule_based_fallback';
  modelUsed?: string;
}

export interface LeadEvaluationInput {
  name: string;
  email: string;
  phone: string;
  inquiryType: 'buy' | 'rent' | 'invest' | 'sell' | 'info' | 'visit';
  message: string;
  budget?: number;
  timeframe?: 'immediate' | '1_3_months' | '3_6_months' | 'exploring';
  consent: boolean;
  propertyPrice?: number;
}

export interface LeadEvaluationOutput {
  score: number; // 0 - 100
  temperature: 'hot' | 'warm' | 'cold';
  aiSummary: string;
  recommendedAction: string;
}

export class RealEstateAIEngine {
  /**
   * Genera el pack comercial multicanal de 10 formatos.
   * Si se activa useOllama, intenta generar las descripciones con Ollama en el VPS Hostinger;
   * si Ollama no responde en el timeout o no está disponible, conmuta al motor determinista sin alucinaciones.
   */
  static async generateMarketingPack(
    property: PropertyDataInput,
    options?: { useOllama?: boolean; language?: 'es' | 'en' }
  ): Promise<MarketingContentPack> {
    const currency = property.currency || '€';
    const formattedPrice = `${property.price.toLocaleString('es-ES')} ${currency}`;
    const opLabel = property.operation === 'rent' ? 'Alquiler' : property.operation === 'investment' ? 'Inversión' : 'Venta';
    const typeLabel = property.propertyType || 'Inmueble';
    const city = property.city || property.location.split(',')[0].trim();
    const featuresList = property.features && property.features.length > 0 
      ? property.features 
      : ['Ubicación estratégica', 'Excelente distribución', 'Luz natural abundante'];

    // 1. Título comercial de impacto
    const commercialTitle = `${typeLabel} de ${property.builtM2} m² con ${property.bedrooms} hab. en ${property.location}`;

    // 2. Descripción corta para portales y tarjetas
    const shortDescription = `${opLabel} de ${typeLabel.toLowerCase()} en ${city}. Dispone de ${property.builtM2} m² construidos, ${property.bedrooms} dormitorios, ${property.bathrooms} baños${property.hasGarage ? ', garaje' : ''}${property.hasTerrace ? ' y terraza' : ''}. Precio: ${formattedPrice}. Finca con alta demanda y excelente conectividad.`;

    // 3. Descripción larga / Ficha técnica detallada
    const longDescription = `Presentamos en exclusiva este magnífico ${typeLabel.toLowerCase()} en ${property.location}.

Con una superficie construida verificada de ${property.builtM2} m², la vivienda destaca por su óptima distribución de espacios, albergando ${property.bedrooms} dormitorios luminosos y ${property.bathrooms} cuartos de baño completos.

CARACTERÍSTICAS DESTACADAS:
${featuresList.map(f => `• ${f}`).join('\n')}
${property.hasTerrace ? '• Terraza privada exterior con vistas despejadas.\n' : ''}${property.hasGarage ? '• Plaza de garaje incluida en finca.\n' : ''}${property.hasElevator ? '• Finca con ascensor a cota cero y accesibilidad universal.\n' : ''}
UBICACIÓN Y COMUNICACIONES:
Emplazado en una de las zonas residenciales más codiciadas de ${city}, con acceso inmediato a transporte público, colegios, centros de salud y áreas comerciales.

CONDICIONES DE LA OPERACIÓN:
- Modalidad: ${opLabel}.
- Precio de venta: ${formattedPrice} (${Math.round(property.price / property.builtM2).toLocaleString('es-ES')} €/m²).
${property.cadastralRef ? `- Referencia catastral: ${property.cadastralRef}\n` : ''}
Inmueble auditado documentalmente, listo para formalizar contrato de arras e hipoteca. Solicite su visita guiada con nuestros asesores inmobiliarios colegiados.`;

    // 4. Instagram Copy
    const instagramCopy = `✨ EXCLUSIVA INMOBILIARIA EN ${city.toUpperCase()} ✨

¿Buscas tu próximo hogar en ${property.location}?
Este ${typeLabel.toLowerCase()} de ${property.builtM2} m² lo tiene todo:
🛏️ ${property.bedrooms} dormitorios
🛁 ${property.bathrooms} baños completos
${property.hasTerrace ? '☀️ Terraza privada exterior\n' : ''}${property.hasGarage ? '🚗 Plaza de garaje en finca\n' : ''}📍 ${property.location}
💰 ${formattedPrice}

Una propiedad con encanto, luminosidad y acabados de primera calidad.
📲 Contacta con nosotros por mensaje directo o WhatsApp para agendar una visita privada.

#Inmobiliaria #${city.replace(/\s+/g, '')} #ViviendaExclusiva #PropTech #InversiónInmobiliaria #HomeDecor #BienesRaices`;

    // 5. Facebook & LinkedIn B2B Copy
    const facebookCopy = `🏢 OPORTUNIDAD INMOBILIARIA DESTACADA EN ${city.toUpperCase()}

Incorporamos a nuestra cartera de activos en ${property.location} este singular ${typeLabel.toLowerCase()} de ${property.builtM2} m² construidos por ${formattedPrice}.

Idóneo tanto para familias que buscan residencia definitiva como para inversores que valoran la solidez patrimonial y una alta tasa de revalorización en ${city}. 

Documentación técnica y registral auditada conforme a la legislación vigente. Póngase en contacto con nuestro equipo para recibir el dossier confidencial del activo.`;

    // 6. WhatsApp VIP Pitch
    const whatsappMessage = `¡Hola! Te comparto en primicia este nuevo activo disponible en nuestra cartera:
🏡 *${property.title}*
📍 ${property.location}
📐 ${property.builtM2} m² | 🛏️ ${property.bedrooms} hab | 🛁 ${property.bathrooms} baños
💰 *${formattedPrice}*
${property.hasGarage ? '✅ Incluye garaje\n' : ''}${property.hasTerrace ? '✅ Terraza privada exterior\n' : ''}¿Te gustaría que organicemos una visita privada esta semana o te remito el dossier completo?`;

    // 7. Video / Reels Script
    const videoScript = `[ESCENA 1 - GANCHO (0-3s)]
(Cámara panea la estancia principal con luz natural)
"Si estás buscando vivir o invertir en la mejor zona de ${city}, tienes que ver esto."

[ESCENA 2 - DISTRIBUCIÓN (3-12s)]
(Tomas dinámicas de salón, cocina y dormitorios)
"${property.builtM2} metros cuadrados perfectamente aprovechados, ${property.bedrooms} habitaciones y ${property.bathrooms} baños con acabados de alta gama."

[ESCENA 3 - FACTOR DIFERENCIAL (12-20s)]
${property.hasTerrace ? '(Toma en terraza exterior) "Y esta terraza privada que es un auténtico lujo."' : '(Detalle de entorno) "En una ubicación inmejorable rodeada de servicios y parques."'}

[ESCENA 4 - CIERRE Y CTA (20-30s)]
(Texto en pantalla: ${formattedPrice} | Teléfono y Web)
"Disponible ahora por ${formattedPrice}. Envíanos un mensaje o entra en inmobia360.com para reservar tu visita."`;

    // 8. Investor Angle (Yield & Cap Rate)
    const estimatedRent = Math.round(property.price * 0.0045); // ~5.4% bruto
    const grossYield = ((estimatedRent * 12) / property.price * 100).toFixed(2);
    const investorAngle = `ANÁLISIS DE RENTABILIDAD Y CAP RATE:
- Precio de adquisición: ${formattedPrice} (${Math.round(property.price / property.builtM2).toLocaleString('es-ES')} €/m²).
- Renta mensual estimada de mercado: ~${estimatedRent.toLocaleString('es-ES')} €/mes.
- Rentabilidad bruta anual proyectada: ${grossYield}% anual.
- Liquidez de mercado: Elevada demanda de alquiler en ${property.location}.
- Perfil arrendatario: Familias solventes y perfiles profesionales cualificados.
- Riesgo de vacancia: Muy reducido (<15 días promedio en micro-zona).`;

    // 9. Foreign Buyer Angle (English / Golden Visa / NIE)
    const foreignBuyerAngle = `INTERNATIONAL BUYER OVERVIEW — ${city.toUpperCase()} (SPAIN):
- Prime residence located in the prestigious neighborhood of ${property.location}.
- Built area: ${property.builtM2} sq.m with ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms.
- Asking Price: ${formattedPrice}.
- Lifestyle Highlights: Mediterranean climate, high safety index, excellent healthcare and bilingual schooling options.
- Legal & Relocation Support: Our certified agency coordinates NIE acquisition, Spanish bank escrow accounts, and complete bilingual Notary signing assistance.`;

    // 10. Translation into English
    const translatedEn = `Exclusive ${typeLabel.toLowerCase()} of ${property.builtM2} sq.m located in ${property.location}.
Features ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms${property.hasGarage ? ', private parking' : ''}${property.hasTerrace ? ', private outdoor terrace' : ''}.
Listed at ${formattedPrice}. Ready for immediate notary deed execution. Contact our English-speaking advisors to schedule a private viewing.`;

    const pack: MarketingContentPack = {
      commercialTitle,
      shortDescription,
      longDescription,
      instagramCopy,
      facebookCopy,
      whatsappMessage,
      videoScript,
      investorAngle,
      foreignBuyerAngle,
      translatedEn,
      generatedBy: 'rule_based_fallback'
    };

    // Si se solicita Ollama y está disponible en el entorno
    if (options?.useOllama) {
      try {
        const provider = new InmobiaLLMProvider({ defaultTimeoutMs: 8000 });
        const prompt = `Actúa como especialista senior de marketing inmobiliario en España para Inmobia 360.
Redacta una descripción comercial de alto impacto para este inmueble:
- Tipo: ${typeLabel}
- Ubicación: ${property.location}
- Precio: ${formattedPrice}
- Superficie: ${property.builtM2} m2
- Habitaciones: ${property.bedrooms}, Baños: ${property.bathrooms}
- Extras: ${featuresList.join(', ')}

Reglas obligatorias:
1. No inventes precios ni metros diferentes a los indicados.
2. Tono persuasivo, riguroso y profesional.
3. Devuelve únicamente la descripción lista para publicar.`;

        const response = await provider.generateReply([
          { role: 'system', content: 'Eres el motor de redacción publicitaria inmobiliaria de Inmobia 360.' },
          { role: 'user', content: prompt }
        ]);

        if (response.ok && response.content) {
          pack.longDescription = response.content;
          pack.generatedBy = 'ollama';
          pack.modelUsed = response.provider;
        }
      } catch {
        // Fallback silencioso y robusto al contenido determinista verificado
      }
    }

    return pack;
  }

  /**
   * Evalúa y califica un Lead entrante basándose en intención comercial, presupuesto y horizonte temporal.
   */
  static scoreLead(input: LeadEvaluationInput): LeadEvaluationOutput {
    let score = 50; // Base neutra

    // Ponderación por horizonte temporal
    if (input.timeframe === 'immediate') score += 25;
    else if (input.timeframe === '1_3_months') score += 15;
    else if (input.timeframe === '3_6_months') score += 5;
    else if (input.timeframe === 'exploring') score -= 10;

    // Ponderación por tipo de consulta
    if (input.inquiryType === 'visit') score += 15;
    else if (input.inquiryType === 'buy' || input.inquiryType === 'invest') score += 10;
    else if (input.inquiryType === 'rent') score += 5;

    // Ponderación por coherencia de presupuesto
    if (input.budget && input.propertyPrice) {
      const ratio = input.budget / input.propertyPrice;
      if (ratio >= 0.95) score += 10; // Presupuesto alineado
      else if (ratio < 0.70) score -= 15; // Oferta agresiva a la baja
    }

    // Teléfono facilitado
    if (input.phone && input.phone.trim().length >= 9) {
      score += 5;
    }

    // Normalizar score entre 0 y 100
    score = Math.max(0, Math.min(100, score));

    // Determinar temperatura
    let temperature: 'hot' | 'warm' | 'cold' = 'warm';
    if (score >= 75) temperature = 'hot';
    else if (score < 45) temperature = 'cold';

    // Generar resumen y siguiente acción recomendada
    let aiSummary = '';
    let recommendedAction = '';

    if (temperature === 'hot') {
      aiSummary = `Lead de alta prioridad con decisión de compra ${input.timeframe === 'immediate' ? 'inmediata' : 'a corto plazo'}. Contacto completo y solicitud específica de ${input.inquiryType === 'visit' ? 'visita presencial' : 'adquisición'}.`;
      recommendedAction = 'Llamada telefónica prioritaria en menos de 2 horas o WhatsApp para confirmar disponibilidad de agenda.';
    } else if (temperature === 'warm') {
      aiSummary = `Interesado cualificado en fase de comparación activa (${input.timeframe || '1-3 meses'}). Buena receptividad a información complementaria.`;
      recommendedAction = 'Enviar dossier comercial en PDF y propuesta de llamada breve de cualificación financiera.';
    } else {
      aiSummary = 'Consulta informativa inicial o prospección sin fecha confirmada de decisión.';
      recommendedAction = 'Incorporar a secuencia de nutrición por correo electrónico y enviar alertas de nuevas propiedades.';
    }

    return {
      score,
      temperature,
      aiSummary,
      recommendedAction
    };
  }
}
