/**
 * Generador de Copys Comerciales y Anuncios Inmobiliarios Enriquecidos
 * Proyecto: AI BROKER (inmobia360)
 * Requisito Funcional: RF-CMA4
 */

import { NeighborhoodAnalyzer } from '../geo/neighborhoodAnalyzer.ts';
import type { NeighborhoodProfile } from '../geo/neighborhoodAnalyzer.ts';
import { DeepLinkGenerator } from '../geo/deepLinkGenerator.ts';
import type { InspectionLinks } from '../geo/deepLinkGenerator.ts';
import { DraftGuard } from '../security/draftGuard.ts';
import type { DraftRecord } from '../security/draftGuard.ts';

export interface ListingCopyInput {
  address: string;
  price: number;
  builtM2: number;
  bedrooms: number;
  bathrooms: number;
  hasElevator: boolean;
  hasTerrace?: boolean;
  conditionDescription?: string;
  cadastralReference?: string;
  dossierId?: string;
}

export interface ListingCopyOutput {
  headline: string;
  portalDescription: string;
  socialMediaPost: string;
  inspectionLinks: InspectionLinks;
  neighborhoodProfile: NeighborhoodProfile;
  draft: DraftRecord;
}

export class ListingCopyGenerator {
  /**
   * Redacta anuncios inmobiliarios optimizados integrando datos de micro-zona reales
   */
  static async generateListingCopy(tenantId: string, input: ListingCopyInput): Promise<ListingCopyOutput> {
    if (!tenantId || tenantId.trim() === '') {
      throw new Error('Se requiere un tenant_id válido para generar anuncios comerciales.');
    }

    const neighborhood = await NeighborhoodAnalyzer.analyzeNeighborhood(input.address);
    const links = DeepLinkGenerator.generateLinks({
      lat: neighborhood.coordinates.lat,
      lon: neighborhood.coordinates.lon,
      cadastralReference: input.cadastralReference,
      propertyAddress: input.address
    });

    const headline = `Exclusivo inmueble de ${input.builtM2} m² en ${neighborhood.zone} — ${input.bedrooms} hab.${input.hasTerrace ? ' con terraza' : ''}`;

    const portalDescription = `${headline}

Ubicación inmejorable en pleno corazón de ${neighborhood.zone}, una de las áreas más demandadas por su calidad de vida y servicios.

CARACTERÍSTICAS PRINCIPALES:
- Superficie: ${input.builtM2} m² construidos con excelente distribución.
- Habitaciones: ${input.bedrooms} dormitorios luminosos.
- Baños: ${input.bathrooms} baño(s) completo(s).
- Finca: ${input.hasElevator ? 'Edificio con ascensor' : 'Finca clásica cuidada'}.${input.hasTerrace ? '\n- Exterior: Agradable terraza para disfrutar del aire libre.' : ''}
- Estado: ${input.conditionDescription || 'Vivienda lista para entrar a vivir o rentabilizar.'}

ENTORNO Y COMUNICACIONES EXCEPCIONALES (Calificación peatonal: ${neighborhood.walkScore}/100):
- Transporte: ${neighborhood.transportSummary}.
- Servicios a pie: ${neighborhood.servicesSummary}.
- Una zona dotada de una amplia oferta gastronómica, comercio tradicional, colegios de primer nivel y zonas verdes.

CONDICIONES COMERCIALES:
- Precio de venta: ${input.price.toLocaleString('es-ES')} €
- Gestión profesional y acompañamiento integral por parte de nuestra agencia.

Solicite su visita presencial o explore previamente la ubicación y perspectiva aérea de la finca a través del enlace satelital.
`;

    const socialMediaPost = `🏡 ¡NUEVA OPORTUNIDAD EN ${neighborhood.zone.toUpperCase()}!
📍 ${input.address}
📐 ${input.builtM2} m² | 🛏️ ${input.bedrooms} hab. | 🚿 ${input.bathrooms} baños ${input.hasElevator ? '| 🛗 Ascensor' : ''}
💶 ${input.price.toLocaleString('es-ES')} €

🌟 Destacado: Ubicación privilegiada a escasos minutos a pie de:
🚇 ${neighborhood.amenities.find(a => a.category === 'transporte')?.name || 'Transporte público'}
🏫 ${neighborhood.amenities.find(a => a.category === 'educacion')?.name || 'Colegios'}
🌳 ${neighborhood.amenities.find(a => a.category === 'zonas_verdes')?.name || 'Parques y zonas verdes'}

📲 Escríbenos por WhatsApp o DM para coordinar tu visita preferente.
`;

    // Persistir en borrador seguro para revisión del agente
    const draft = DraftGuard.createDraft(tenantId, {
      documentType: 'other',
      title: `Copia Comercial para Portales - ${input.address}`,
      content: portalDescription,
      dossierId: input.dossierId,
      metadata: {
        type: 'listing_copy',
        headline,
        walkScore: neighborhood.walkScore,
        googleEarth3D: links.googleEarth3D,
        googleMapsSatellite: links.googleMapsSatellite
      }
    });

    return {
      headline,
      portalDescription,
      socialMediaPost,
      inspectionLinks: links,
      neighborhoodProfile: neighborhood,
      draft
    };
  }
}
