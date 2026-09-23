/**
 * Almacén de Memoria Operativa Estructurada y Aprendizaje de Casos Resueltos
 * Proyecto: AI BROKER (inmobia360)
 * Requisito Funcional: RF-M8
 */

import { generateEmbedding, cosineSimilarity } from '../db/vectorStore.ts';

export type OperationalMemoryCategory = 
  | 'negociacion_objeciones'
  | 'contingencias_resueltas'
  | 'politicas_comerciales'
  | 'patrones_demanda';

export interface OperationalCaseRecord {
  id: string;
  tenantId: string;
  category: OperationalMemoryCategory;
  title: string;
  problemDescription: string;
  solutionApplied: string;
  tags: string[];
  embedding: number[];
  resolvedAt: string;
}

export const ECOSYSTEM_COLLECTIVE_TENANT = 'inmobia360_collective_ecosystem';

export interface RetrievedMemoryCase {
  record: OperationalCaseRecord;
  similarityScore: number;
  isCollectiveKnowledge?: boolean;
}

// Almacén en memoria estructurado por tenant (persistencia vectorial)
const inMemoryExperienceStore: OperationalCaseRecord[] = [];

/**
 * Sanitizador de Información de Identificación Personal (PII).
 * Anonimiza correos, teléfonos, DNIs, nombres específicos y direcciones postales.
 */
export function sanitizePII(text: string, customNamesToRedact: string[] = []): string {
  if (!text) return '';
  let sanitized = text;

  // Redactar nombres y razones sociales específicos
  for (const name of customNamesToRedact) {
    if (name && name.trim().length > 2) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      sanitized = sanitized.replace(new RegExp(escaped, 'gi'), '[PARTE_ANONIMIZADA]');
    }
  }

  // Redactar correos electrónicos
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_PROTEGIDO]');

  // Redactar teléfonos españoles e internacionales
  sanitized = sanitized.replace(/(\+34\s?)?[6-9]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/g, '[TEL_PROTEGIDO]');

  // Redactar DNI/NIE/CIF
  sanitized = sanitized.replace(/\b[0-9XYZxyz][0-9]{7}[A-Za-z]\b/g, '[DNI_PROTEGIDO]');
  sanitized = sanitized.replace(/\b[ABCDEFGHJNPQRSUVWabcdefghjnpqrsuvw][0-9]{7}[0-9A-Ja-j]\b/g, '[CIF_PROTEGIDO]');

  // Redactar direcciones postales callejeras detalladas
  sanitized = sanitized.replace(/\b(calle|c\/|avenida|avda|paseo|pza|plaza|camino)\s+[^,.;\n]+/gi, '[UBICACIÓN_ANONIMIZADA]');

  return sanitized;
}

export class OperationalMemoryStore {
  /**
   * Registra una resolución o precedente exitoso en la memoria privada de la agencia
   */
  static async recordCaseMemory(params: {
    tenantId: string;
    category: OperationalMemoryCategory;
    title: string;
    problemDescription: string;
    solutionApplied: string;
    tags?: string[];
  }): Promise<OperationalCaseRecord> {
    if (!params.tenantId) {
      throw new Error('No se puede almacenar memoria operativa sin tenant_id');
    }

    const fullSemanticText = `[${params.category.toUpperCase()}] ${params.title}. Problema: ${params.problemDescription}. Solución aplicada: ${params.solutionApplied}. Etiquetas: ${(params.tags || []).join(', ')}`;
    const embedding = await generateEmbedding(fullSemanticText);

    const record: OperationalCaseRecord = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tenantId: params.tenantId,
      category: params.category,
      title: params.title,
      problemDescription: params.problemDescription,
      solutionApplied: params.solutionApplied,
      tags: params.tags || [],
      embedding,
      resolvedAt: new Date().toISOString()
    };

    inMemoryExperienceStore.push(record);
    return record;
  }

  /**
   * Anonimiza y comparte un aprendizaje exitoso en el ecosistema colectivo global de Inmobia360.
   * Elimina cualquier dato personal, DNI, teléfono, dirección o cliente antes de indexar.
   */
  static async anonymizeAndContributeToEcosystem(params: {
    originTenantId: string;
    category: OperationalMemoryCategory;
    title: string;
    problemDescription: string;
    solutionApplied: string;
    namesToRedact?: string[];
    tags?: string[];
  }): Promise<OperationalCaseRecord> {
    const sanitizedTitle = sanitizePII(params.title, params.namesToRedact);
    const sanitizedProblem = sanitizePII(params.problemDescription, params.namesToRedact);
    const sanitizedSolution = sanitizePII(params.solutionApplied, params.namesToRedact);

    const fullSemanticText = `[CONOCIMIENTO COLECTIVO ANONIMIZADO] [${params.category.toUpperCase()}] ${sanitizedTitle}. Situación: ${sanitizedProblem}. Táctica/Solución probada: ${sanitizedSolution}. Etiquetas: ${(params.tags || []).join(', ')}`;
    const embedding = await generateEmbedding(fullSemanticText);

    const collectiveRecord: OperationalCaseRecord = {
      id: `eco-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tenantId: ECOSYSTEM_COLLECTIVE_TENANT,
      category: params.category,
      title: sanitizedTitle,
      problemDescription: sanitizedProblem,
      solutionApplied: sanitizedSolution,
      tags: [...(params.tags || []), 'ecosistema_inmobia360', 'aprendizaje_anonimizado'],
      embedding,
      resolvedAt: new Date().toISOString()
    };

    inMemoryExperienceStore.push(collectiveRecord);
    return collectiveRecord;
  }

  /**
   * Recupera los casos previos más afines para alimentar el contexto del Director BROKER.
   * Consulta la memoria privada del tenant y opcionalmente el pool colectivo anonimizado.
   */
  static async retrieveSimilarCases(
    tenantId: string,
    queryText: string,
    options?: {
      category?: OperationalMemoryCategory;
      limit?: number;
      minSimilarity?: number;
      includeCollectiveKnowledge?: boolean;
    }
  ): Promise<RetrievedMemoryCase[]> {
    const limit = options?.limit ?? 3;
    const minSim = options?.minSimilarity ?? 0.45;
    const includeCollective = options?.includeCollectiveKnowledge ?? true;
    const queryEmbedding = await generateEmbedding(queryText);

    // 1. Filtrar casos accesibles: privados del tenant y/o conocimiento colectivo anonimizado
    const allowedRecords = inMemoryExperienceStore.filter(r => {
      const isMyTenant = r.tenantId === tenantId;
      const isCollective = includeCollective && r.tenantId === ECOSYSTEM_COLLECTIVE_TENANT;
      
      if (!isMyTenant && !isCollective) return false;
      if (options?.category && r.category !== options.category) return false;
      return true;
    });

    const scored = allowedRecords.map(record => ({
      record,
      similarityScore: cosineSimilarity(queryEmbedding, record.embedding),
      isCollectiveKnowledge: record.tenantId === ECOSYSTEM_COLLECTIVE_TENANT
    }));

    return scored
      .filter(item => item.similarityScore >= minSim)
      .sort((a, b) => {
        // Priorizar precedentes internos de la agencia sobre el conocimiento colectivo
        const aPriority = a.isCollectiveKnowledge ? 0 : 0.05;
        const bPriority = b.isCollectiveKnowledge ? 0 : 0.05;
        return (b.similarityScore + bPriority) - (a.similarityScore + aPriority);
      })
      .slice(0, limit);
  }

  /**
   * Formatea los casos recuperados como bloque de contexto para el prompt del LLM
   */
  static formatFewShotContext(cases: RetrievedMemoryCase[]): string {
    if (cases.length === 0) return '';

    let context = '\n--- EXPERIENCIA PREVIA Y CASOS SIMILARES RESUELTOS DISPONIBLES ---\n';
    cases.forEach((item, index) => {
      const { record, similarityScore, isCollectiveKnowledge } = item;
      const originTag = isCollectiveKnowledge 
        ? '[Ecosistema Inmobia 360 - Aprendizaje Colectivo Anonimizado]' 
        : '[Precedente Interno de tu Agencia]';

      context += `\n[Caso ${index + 1} - ${originTag} - Afinidad: ${(similarityScore * 100).toFixed(0)}%]\n`;
      context += `Categoría: ${record.category}\nTítulo: ${record.title}\n`;
      context += `Situación previa: ${record.problemDescription}\n`;
      context += `Solución exitosa demostrada: ${record.solutionApplied}\n`;
    });
    context += '\nInstrucción: Aplica estos precedentes probados para guiar tu resolución de forma jurídica y comercialmente óptima.\n';
    return context;
  }

  /**
   * Carga conocimientos base iniciales para una nueva agencia
   */
  static async seedAgencyKnowledge(tenantId: string): Promise<void> {
    const defaultCases: Array<{
      category: OperationalMemoryCategory;
      title: string;
      problem: string;
      solution: string;
      tags: string[];
    }> = [
      {
        category: 'negociacion_objeciones',
        title: 'Descuento agresivo por comprador con hipoteca',
        problem: 'Comprador ofrece un 10% por debajo del precio pero solicita 60 días para concesión de hipoteca.',
        solution: 'Pactar contraoferta con descuento limitado al 3%, fijando que si el comprador no presenta pre-aprobación en 15 días, el vendedor retiene el inmueble en comercialización.',
        tags: ['oferta', 'contraoferta', 'hipoteca']
      },
      {
        category: 'contingencias_resueltas',
        title: 'Hipoteca bancaria antigua pagada pero no cancelada en registro',
        problem: 'La Nota Simple refleja una hipoteca de 1998 de una entidad absorbida (ej. Banesto o Argentaria) ya liquidada económicamente.',
        solution: 'Solicitar al banco absorbente el Certificado de Deuda Cero sin coste y gestionar en notaría la escritura de cancelación registral abonando los honorarios con retención al vendedor.',
        tags: ['cargas', 'registro', 'cancelacion_hipoteca']
      },
      {
        category: 'politicas_comerciales',
        title: 'Honorarios en alquiler de vivienda habitual según Ley 12/2023',
        problem: 'Dudas sobre a quién repercutir los honorarios de intermediación y gestión de contrato de arrendamiento.',
        solution: 'En contratos de vivienda habitual sometidos a la LAU, los gastos de gestión inmobiliaria y formalización corresponden imperativamente al arrendador (Art. 20.1 LAU modificado).',
        tags: ['honorarios', 'alquiler', 'lau']
      }
    ];

    for (const c of defaultCases) {
      await this.recordCaseMemory({
        tenantId,
        category: c.category,
        title: c.title,
        problemDescription: c.problem,
        solutionApplied: c.solution,
        tags: c.tags
      });
    }
  }
}
