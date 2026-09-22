/**
 * Generador de Enlaces Profundos 3D y Cartográficos (Deep Links)
 * Proyecto: AI BROKER (inmobia360)
 * Requisito Funcional: RF-CMA5
 */

export interface DeepLinkOptions {
  lat: number;
  lon: number;
  altitudeMeters?: number;
  tiltAngle?: number; // Inclinación de cámara 3D (ej. 45º o 60º)
  cadastralReference?: string;
  propertyAddress?: string;
}

export interface InspectionLinks {
  googleEarth3D: string;
  googleMapsSatellite: string;
  catastroVisor: string;
  whatsappSnippet: string;
}

export class DeepLinkGenerator {
  /**
   * Genera los enlaces profundos interactivos con coordenadas serializadas
   */
  static generateLinks(options: DeepLinkOptions): InspectionLinks {
    const { lat, lon, cadastralReference, propertyAddress } = options;
    const altitude = options.altitudeMeters || 350;
    const tilt = options.tiltAngle || 45;

    // 1. Google Earth 3D directo a la finca con inclinación y rango de cámara
    const googleEarth3D = `https://earth.google.com/web/@${lat.toFixed(6)},${lon.toFixed(6)},${altitude}a,400d,35y,0h,${tilt}t,0r`;

    // 2. Google Maps vista satélite cenital en alta resolución
    const googleMapsSatellite = `https://www.google.com/maps/@${lat.toFixed(6)},${lon.toFixed(6)},19z/data=!3m1!1e3`;

    // 3. Sede Electrónica del Catastro de España (Visor Cartográfico Oficial)
    let catastroVisor = `https://www1.sedecatastro.gob.es/Cartografia/OVCFotoCiudad.aspx?Coordenadas=${lat},${lon}`;
    if (cadastralReference && cadastralReference.trim() !== '') {
      catastroVisor = `https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?refcat=${encodeURIComponent(cadastralReference.trim())}`;
    }

    // 4. Bloque estructurado para enviar por WhatsApp al comprador interesado
    const addressLabel = propertyAddress || 'Inmueble seleccionado';
    const whatsappSnippet = `📍 *EXPLORACIÓN AÉREA DEL ENTORNO — inmobia360*
Finca: ${addressLabel}

Puedes ver la finca y el entorno del barrio en vista satélite antes de la visita:
🛰️ *Vista aérea satelital*: ${googleMapsSatellite}
🌐 *Perspectiva 3D*: ${googleEarth3D}
🏛️ *Ficha oficial Catastro*: ${catastroVisor}
`;

    return {
      googleEarth3D,
      googleMapsSatellite,
      catastroVisor,
      whatsappSnippet
    };
  }
}
