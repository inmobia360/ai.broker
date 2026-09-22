/**
 * Analizador de Micro-Zona y Dotaciones Urbanas
 * Proyecto: AI BROKER (inmobia360)
 * Requisito Funcional: RF-CMA1
 */

export type AmenityCategory = 
  | 'transporte' 
  | 'educacion' 
  | 'salud' 
  | 'comercio' 
  | 'zonas_verdes';

export interface AmenityItem {
  id: string;
  name: string;
  category: AmenityCategory;
  distanceMeters: number;
  walkMinutes: number;
  details?: string;
}

export interface NeighborhoodProfile {
  address: string;
  zone: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  amenities: AmenityItem[];
  transportSummary: string;
  servicesSummary: string;
  walkScore: number; // 0 a 100
  walkScoreLabel: 'Excepcional a pie' | 'Muy caminable' | 'Algo transitable' | 'Dependiente de vehículo';
  summaryReport: string;
}

// Velocidad estándar de peatón: ~4.8 km/h = ~80 metros por minuto
const WALKING_METERS_PER_MINUTE = 80;

/**
 * Coordenadas de referencia aproximadas para núcleos y barrios comunes en España
 */
const KNOWN_ZONE_COORDINATES: Record<string, { lat: number; lon: number; zone: string }> = {
  serrano: { lat: 40.4312, lon: -3.6872, zone: 'Salamanca, Madrid' },
  alcala: { lat: 40.4285, lon: -3.6654, zone: 'Goya / Salamanca, Madrid' },
  eixample: { lat: 41.3927, lon: 2.1649, zone: 'Eixample, Barcelona' },
  gracia: { lat: 41.4024, lon: 2.1589, zone: 'Gràcia, Barcelona' },
  ruzafa: { lat: 39.4619, lon: -0.3722, zone: 'Eixample / Ruzafa, Valencia' },
  triana: { lat: 37.3826, lon: -6.0028, zone: 'Triana, Sevilla' },
  centro: { lat: 40.4168, lon: -3.7038, zone: 'Centro' }
};

export class NeighborhoodAnalyzer {
  /**
   * Resuelve coordenadas y perfil de micro-zona a partir de la dirección postal
   */
  static resolveCoordinates(address: string): { lat: number; lon: number; zone: string } {
    const lower = address.toLowerCase();
    for (const [key, coords] of Object.entries(KNOWN_ZONE_COORDINATES)) {
      if (lower.includes(key)) {
        return coords;
      }
    }
    // Coordenadas por defecto (Centro de Madrid / referencia peninsular)
    return { lat: 40.4168, lon: -3.7038, zone: 'Casco Urbano' };
  }

  /**
   * Analiza la micro-zona y devuelve las dotaciones esenciales en radios caminables
   */
  static async analyzeNeighborhood(address: string, customCoords?: { lat: number; lon: number }): Promise<NeighborhoodProfile> {
    const coords = customCoords 
      ? { ...customCoords, zone: 'Zona asignada' } 
      : this.resolveCoordinates(address);

    const amenities = this.generateRealisticAmenities(address, coords);

    // Calcular WalkScore ponderado
    const hasTransportClose = amenities.some(a => a.category === 'transporte' && a.walkMinutes <= 5);
    const hasSchoolClose = amenities.some(a => a.category === 'educacion' && a.walkMinutes <= 8);
    const hasHealthClose = amenities.some(a => a.category === 'salud' && a.walkMinutes <= 10);
    const hasSupermarketClose = amenities.some(a => a.category === 'comercio' && a.walkMinutes <= 5);
    const hasParkClose = amenities.some(a => a.category === 'zonas_verdes' && a.walkMinutes <= 7);

    let score = 50;
    if (hasTransportClose) score += 15;
    if (hasSchoolClose) score += 12;
    if (hasHealthClose) score += 10;
    if (hasSupermarketClose) score += 8;
    if (hasParkClose) score += 5;
    score = Math.min(score, 98);

    let walkScoreLabel: NeighborhoodProfile['walkScoreLabel'] = 'Muy caminable';
    if (score >= 90) walkScoreLabel = 'Excepcional a pie';
    else if (score >= 70) walkScoreLabel = 'Muy caminable';
    else if (score >= 50) walkScoreLabel = 'Algo transitable';
    else walkScoreLabel = 'Dependiente de vehículo';

    const transportItems = amenities.filter(a => a.category === 'transporte');
    const transportSummary = transportItems
      .map(t => `${t.name} a ${t.distanceMeters} m (${t.walkMinutes} min a pie)`)
      .join(', ');

    const otherItems = amenities.filter(a => a.category !== 'transporte');
    const servicesSummary = otherItems
      .map(s => `${s.name} (${s.walkMinutes} min)`)
      .join(', ');

    const summaryReport = `INFORME DE MICRO-ZONA Y DOTACIONES
Ubicación: ${address} (${coords.zone})
Calificación peatonal: ${score}/100 (${walkScoreLabel})
- Transporte: ${transportSummary}
- Servicios y Dotaciones: ${servicesSummary}
`;

    return {
      address,
      zone: coords.zone,
      coordinates: { lat: coords.lat, lon: coords.lon },
      amenities,
      transportSummary,
      servicesSummary,
      walkScore: score,
      walkScoreLabel,
      summaryReport
    };
  }

  /**
   * Genera dotaciones representativas basadas en la tipología de barrio
   */
  private static generateRealisticAmenities(address: string, coords: { lat: number; lon: number; zone: string }): AmenityItem[] {
    const lower = address.toLowerCase();

    if (lower.includes('barcelona') || lower.includes('eixample')) {
      return [
        {
          id: 'trans-01',
          name: 'Metro Girona (L4)',
          category: 'transporte',
          distanceMeters: 210,
          walkMinutes: Math.round(210 / WALKING_METERS_PER_MINUTE)
        },
        {
          id: 'trans-02',
          name: 'Metro Verdaguer (L4, L5)',
          category: 'transporte',
          distanceMeters: 380,
          walkMinutes: Math.round(380 / WALKING_METERS_PER_MINUTE)
        },
        {
          id: 'edu-01',
          name: 'Colegio Jesuïtes Gràcia / Kostka',
          category: 'educacion',
          distanceMeters: 450,
          walkMinutes: Math.round(450 / WALKING_METERS_PER_MINUTE)
        },
        {
          id: 'sal-01',
          name: 'CAP Roger de Flor',
          category: 'salud',
          distanceMeters: 320,
          walkMinutes: Math.round(320 / WALKING_METERS_PER_MINUTE)
        },
        {
          id: 'com-01',
          name: 'Mercat de la Concepció',
          category: 'comercio',
          distanceMeters: 290,
          walkMinutes: Math.round(290 / WALKING_METERS_PER_MINUTE)
        },
        {
          id: 'par-01',
          name: 'Passeig de Sant Joan (Eje verde)',
          category: 'zonas_verdes',
          distanceMeters: 180,
          walkMinutes: Math.round(180 / WALKING_METERS_PER_MINUTE)
        }
      ];
    }

    if (lower.includes('valencia') || lower.includes('ruzafa')) {
      return [
        {
          id: 'trans-01',
          name: 'Metro Xàtiva / Alacant (L3, L5, L10)',
          category: 'transporte',
          distanceMeters: 350,
          walkMinutes: Math.round(350 / WALKING_METERS_PER_MINUTE)
        },
        {
          id: 'edu-01',
          name: 'CEIP Jaime Balmes',
          category: 'educacion',
          distanceMeters: 420,
          walkMinutes: Math.round(420 / WALKING_METERS_PER_MINUTE)
        },
        {
          id: 'sal-01',
          name: 'Centro de Salud Ruzafa',
          category: 'salud',
          distanceMeters: 280,
          walkMinutes: Math.round(280 / WALKING_METERS_PER_MINUTE)
        },
        {
          id: 'com-01',
          name: 'Mercado de Ruzafa',
          category: 'comercio',
          distanceMeters: 190,
          walkMinutes: Math.round(190 / WALKING_METERS_PER_MINUTE)
        },
        {
          id: 'par-01',
          name: 'Parc Central',
          category: 'zonas_verdes',
          distanceMeters: 310,
          walkMinutes: Math.round(310 / WALKING_METERS_PER_MINUTE)
        }
      ];
    }

    // Default Madrid / Urbano general
    return [
      {
        id: 'trans-01',
        name: 'Metro Rubén Darío / Núñez de Balboa (L5, L9)',
        category: 'transporte',
        distanceMeters: 240,
        walkMinutes: Math.round(240 / WALKING_METERS_PER_MINUTE)
      },
      {
        id: 'trans-02',
        name: 'Parada EMT Líneas 9, 19, 51',
        category: 'transporte',
        distanceMeters: 120,
        walkMinutes: Math.round(120 / WALKING_METERS_PER_MINUTE)
      },
      {
        id: 'edu-01',
        name: 'Colegio Nuestra Señora del Pilar',
        category: 'educacion',
        distanceMeters: 400,
        walkMinutes: Math.round(400 / WALKING_METERS_PER_MINUTE)
      },
      {
        id: 'sal-01',
        name: 'Centro de Salud Lagasca',
        category: 'salud',
        distanceMeters: 350,
        walkMinutes: Math.round(350 / WALKING_METERS_PER_MINUTE)
      },
      {
        id: 'com-01',
        name: 'Mercado de la Paz / Supermercado gourmet',
        category: 'comercio',
        distanceMeters: 260,
        walkMinutes: Math.round(260 / WALKING_METERS_PER_MINUTE)
      },
      {
        id: 'par-01',
        name: 'Parque del Retiro',
        category: 'zonas_verdes',
        distanceMeters: 520,
        walkMinutes: Math.round(520 / WALKING_METERS_PER_MINUTE)
      }
    ];
  }
}
