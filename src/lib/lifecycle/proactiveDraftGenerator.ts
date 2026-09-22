/**
 * Generador Proactivo de Borradores por Hito del Expediente
 * Proyecto: AI BROKER (inmobia360)
 * Requisitos Funcionales: RF-M2, RF-5, RF-8, RF-9, RF-10
 */

import type { DossierStage, RealEstateDossier } from './dossierStateMachine.ts';
import { generateArrasPenitencialesContract } from '../legal/spain/arras.ts';
import { generateLauContract } from '../legal/spain/lau.ts';
import { generateVisitSheet } from '../legal/spain/visita.ts';
import { DraftGuard } from '../security/draftGuard.ts';
import type { DraftRecord } from '../security/draftGuard.ts';

export interface ProactiveDraftResult {
  dossierId: string;
  stage: DossierStage;
  draft: DraftRecord;
  summary: string;
}

export class ProactiveDraftGenerator {
  /**
   * Genera de forma automática y desatendida el borrador correspondiente
   * a la etapa actual del expediente en estado 'draft_pending'.
   */
  static generateForStage(dossier: RealEstateDossier): ProactiveDraftResult | null {
    const tenantId = dossier.tenantId;
    const vendor = dossier.parties.find(p => p.role === 'vendedor' || p.role === 'arrendador');
    const buyer = dossier.parties.find(p => p.role === 'comprador' || p.role === 'arrendatario');

    switch (dossier.currentStage) {
      // 1. Etapa Captación -> Borrador de Nota de Encargo con Honorarios Protegidos
      case 'captacion': {
        const text = `NOTA DE ENCARGO DE GESTIÓN INMOBILIARIA Y CORRETAJE
==================================================================================
Plataforma: inmobia360 - AI BROKER (España)
Fecha: ${new Date().toLocaleDateString('es-ES')}

REUNIDOS:
De una parte, ${vendor?.fullName || '[PENDIENTE: NOMBRE PROPIETARIO]'}, con DNI/NIE ${vendor?.dniNie || '[PENDIENTE: DNI PROPIETARIO]'}, como PARTE PROPIETARIA.
De otra parte, el Agente Asesor inmobiliario colegiado/acreditado.

EXPONEN:
I. Que la PARTE PROPIETARIA encomienda la comercialización del inmueble sito en:
   ${dossier.propertyAddress || '[PENDIENTE: DIRECCIÓN FINCA]'}
   Referencia Catastral: ${dossier.cadastralReference || '[PENDIENTE: REFERENCIA CATASTRAL]'}

CONDICIONES ECONÓMICAS:
- Precio de venta de salida autorizado: ${dossier.askingPrice ? `${dossier.askingPrice.toLocaleString('es-ES')} €` : '[PENDIENTE: PRECIO]'}
- Precio mínimo de aceptación sin consulta: ${dossier.minAcceptedPrice ? `${dossier.minAcceptedPrice.toLocaleString('es-ES')} €` : 'A consultar'}
- Honorarios profesionales: 3% (+IVA) a cargo de la parte vendedora sobre el precio final formalizado en escritura pública.
- Plazo de encargo: 6 meses con prórroga tácita salvo preaviso de 15 días.
`;
        const draft = DraftGuard.createDraft(tenantId, {
          documentType: 'mandate_agreement',
          title: `Nota de Encargo de Venta - ${dossier.referenceCode}`,
          content: text,
          dossierId: dossier.id,
          metadata: {
            stage: 'captacion',
            askingPrice: dossier.askingPrice
          }
        });

        return {
          dossierId: dossier.id,
          stage: 'captacion',
          draft,
          summary: 'Nota de encargo generada con blindaje de honorarios y precio autorizado.'
        };
      }

      // 2. Etapa Comercialización -> Hoja de Visita con Reserva de Corretaje
      case 'comercializacion': {
        const hoja = generateVisitSheet({
          agencia: {
            nombreAgencia: 'inmobia360 Red Inmobiliaria',
            nombreAgente: 'Agente Asesor'
          },
          visitante: {
            nombreCompleto: buyer?.fullName || 'Visitante Interesado',
            dniNie: buyer?.dniNie || '',
            telefono: buyer?.phone || ''
          },
          inmueble: {
            direccion: dossier.propertyAddress,
            referenciaCatastral: dossier.cadastralReference,
            precioOrientativo: dossier.askingPrice
          },
          honorarios: {
            porcentajeHonorariosVenta: 3.0,
            periodoValidezMeses: 12
          }
        });

        const draft = DraftGuard.createDraft(tenantId, {
          documentType: 'visit_sheet',
          title: `Hoja de Visita con Reserva de Corretaje - ${dossier.referenceCode}`,
          content: hoja.sheetText,
          dossierId: dossier.id,
          metadata: {
            stage: 'comercializacion',
            visitor: buyer?.fullName
          }
        });

        return {
          dossierId: dossier.id,
          stage: 'comercializacion',
          draft,
          summary: 'Hoja de visita preparada con reconocimiento de honorarios y 12 meses de exclusividad.'
        };
      }

      // 3. Etapa Cierre Comercial -> Ficha de Acuerdo Económico Previo
      case 'cierre_comercial': {
        const agreed = dossier.agreedPrice || dossier.minAcceptedPrice || dossier.askingPrice;
        const deposit = dossier.depositAmount || Math.round(agreed * 0.10);

        const text = `MEMORÁNDUM DE CIERRE COMERCIAL PREVIO A ARRAS
==================================================================================
Plataforma: inmobia360 - AI BROKER (España)
Fecha del Acuerdo: ${new Date().toLocaleDateString('es-ES')}

OPERACIÓN INMOBILIARIA: ${dossier.title} (${dossier.referenceCode})
Finca: ${dossier.propertyAddress}

1. PARTES INTERVINIENTES:
- Parte Vendedora: ${vendor?.fullName || '[PENDIENTE: VENDEDOR]'} (${vendor?.dniNie || 'DNI pendiente'})
- Parte Compradora: ${buyer?.fullName || '[PENDIENTE: COMPRADOR]'} (${buyer?.dniNie || 'DNI pendiente'})

2. CONDICIONES ECONÓMICAS CONSOLIDADAS:
- Precio final de compraventa pactado: ${agreed.toLocaleString('es-ES')} €
- Señal de Arras Penitenciales (10%): ${deposit.toLocaleString('es-ES')} €
- Plazo máximo acordado para elevación a escritura pública notarial: 60 días naturales.
- Gastos de otorgamiento de escritura según Ley (Vendedor abona plusvalía municipal y matriz; Comprador abona copias e ITP/AJD).

El presente documento acredita la conformidad comercial de las partes previa a la firma del contrato de Arras Penitenciales.
`;
        const draft = DraftGuard.createDraft(tenantId, {
          documentType: 'commercial_closing_memo',
          title: `Ficha de Cierre Comercial - ${dossier.referenceCode}`,
          content: text,
          dossierId: dossier.id,
          metadata: {
            agreedPrice: agreed,
            depositAmount: deposit
          }
        });

        return {
          dossierId: dossier.id,
          stage: 'cierre_comercial',
          draft,
          summary: 'Ficha de acuerdo económico emitida con precio, señal y plazos consensuados.'
        };
      }

      // 4. Etapa Cierre Documental -> Arras Penitenciales Art. 1454 C.C. o Contrato LAU
      case 'cierre_documental': {
        if (dossier.operationType === 'alquiler') {
          const contract = generateLauContract({
            arrendador: {
              nombreCompleto: vendor?.fullName || 'Arrendador',
              dniNie: vendor?.dniNie || ''
            },
            arrendatario: {
              nombreCompleto: buyer?.fullName || 'Arrendatario',
              dniNie: buyer?.dniNie || ''
            },
            inmueble: {
              direccion: dossier.propertyAddress,
              referenciaCatastral: dossier.cadastralReference
            },
            condiciones: {
              rentaMensual: dossier.agreedPrice || dossier.askingPrice || 1000,
              fianzaLegalMeses: 1
            }
          });

          const draft = DraftGuard.createDraft(tenantId, {
            documentType: 'contract_lau',
            title: `Contrato de Arrendamiento LAU - ${dossier.referenceCode}`,
            content: contract.contractText,
            dossierId: dossier.id,
            metadata: { stage: 'cierre_documental' }
          });

          return {
            dossierId: dossier.id,
            stage: 'cierre_documental',
            draft,
            summary: 'Contrato de alquiler residencial LAU generado con fianza legal obligatoria.'
          };
        } else {
          const agreed = dossier.agreedPrice || dossier.askingPrice;
          const deposit = dossier.depositAmount || Math.round(agreed * 0.10);

          const contract = generateArrasPenitencialesContract({
            vendedor: {
              nombreCompleto: vendor?.fullName || 'Parte Vendedora',
              dniNie: vendor?.dniNie || ''
            },
            comprador: {
              nombreCompleto: buyer?.fullName || 'Parte Compradora',
              dniNie: buyer?.dniNie || ''
            },
            inmueble: {
              direccion: dossier.propertyAddress,
              referenciaCatastral: dossier.cadastralReference
            },
            condiciones: {
              precioTotal: agreed,
              importeSenalArras: deposit,
              plazoMaximoNotaria: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')
            }
          });

          const draft = DraftGuard.createDraft(tenantId, {
            documentType: 'contract_arras',
            title: `Contrato de Arras Penitenciales (Art. 1454 C.C.) - ${dossier.referenceCode}`,
            content: contract.contractText,
            dossierId: dossier.id,
            metadata: { stage: 'cierre_documental' }
          });

          return {
            dossierId: dossier.id,
            stage: 'cierre_documental',
            draft,
            summary: 'Contrato de arras penitenciales redactado bajo el Art. 1454 del Código Civil español.'
          };
        }
      }

      // 5. Etapa Tramitación Notarial -> Checklist y Dossier de Preparación de Firma
      case 'tramitacion_notarial': {
        const text = `DOSSIER Y CHECKLIST DE CONTROL PREVIO A ESCRITURA NOTARIAL
==================================================================================
Expediente: ${dossier.referenceCode} - ${dossier.propertyAddress}
Plataforma: inmobia360 - AI BROKER

DOCUMENTACIÓN OBLIGATORIA A AUDITAR ANTES DE NOTARÍA (LEGISLACIÓN ESPAÑOLA):
[ ] 1. TÍTULO DE PROPIEDAD: Escritura original de compraventa/adjudicación de herencia.
[ ] 2. NOTA SIMPLE INFORMATIVA: Expedida en los últimos 30 días naturales sin cargas sobrevenidas.
[ ] 3. CERTIFICADO ENERGÉTICO (CEE): Vigente (RD 390/2021) con etiqueta oficial registrada.
[ ] 4. CERTIFICADO COMUNIDAD DE PROPIETARIOS: Emitido por el Administrador/Secretario al amparo del
       Artículo 9.1.e de la Ley de Propiedad Horizontal (LPH), acreditando saldo cero deudas.
[ ] 5. IMPUESTO DE BIENES INMUEBLES (IBI): Último recibo anual liquidado y referencia catastral concordante.
[ ] 6. CANCELACIÓN DE CARGAS: Si existe hipoteca viva, certificado bancario de saldo deudor o certificado de deuda cero.
[ ] 7. MEDIOS DE PAGO (Ley 10/2010 Prevención Blanqueo de Capitales): Copia de cheques bancarios nominativos
       o transferencias OMF vía Banco de España con trazabilidad de origen y destino.
`;
        const draft = DraftGuard.createDraft(tenantId, {
          documentType: 'notary_checklist',
          title: `Checklist Notarial y Control de Firma - ${dossier.referenceCode}`,
          content: text,
          dossierId: dossier.id,
          metadata: { stage: 'tramitacion_notarial' }
        });

        return {
          dossierId: dossier.id,
          stage: 'tramitacion_notarial',
          draft,
          summary: 'Dossier notarial de control con verificación de deudas de comunidad (Art. 9.1.e LPH) y CEE.'
        };
      }

      default:
        return null;
    }
  }
}
