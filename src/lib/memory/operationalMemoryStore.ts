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

export interface RetrievedMemoryCase {
  record: OperationalCaseRecord;
  similarityScore: number;
}

// Almacén en memoria estructurado por tenant (persistencia vectorial)
const inMemoryExperienceStore: OperationalCaseRecord[] = [];

export class OperationalMemoryStore {
  /**
   * Registra una resolución o precedente exitoso en la memoria de la agencia
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
   * Recupera los casos previos más afines para alimentar el contexto del Director BROKER
   */
  static async retrieveSimilarCases(
    tenantId: string,
    queryText: string,
    options?: {
      category?: OperationalMemoryCategory;
      limit?: number;
      minSimilarity?: number;
    }
  ): Promise<RetrievedMemoryCase[]> {
    const limit = options?.limit ?? 3;
    const minSim = options?.minSimilarity ?? 0.45;
    const queryEmbedding = await generateEmbedding(queryText);

    // Filtrar estrictamente por tenant_id (Aislamiento RLS)
    const tenantRecords = inMemoryExperienceStore.filter(r => {
      if (r.tenantId !== tenantId) return false;
      if (options?.category && r.category !== options.category) return false;
      return true;
    });

    const scored = tenantRecords.map(record => ({
      record,
      similarityScore: cosineSimilarity(queryEmbedding, record.embedding)
    }));

    return scored
      .filter(item => item.similarityScore >= minSim)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  }

  /**
   * Formatea los casos recuperados como bloque de contexto para el prompt del LLM
   */
  static formatFewShotContext(cases: RetrievedMemoryCase[]): string {
    if (cases.length === 0) return '';

    let context = '\n--- EXPERIENCIA PREVIA Y CASOS SIMILARES RESUELTOS EN LA AGENCIA ---\n';
    cases.forEach((item, index) => {
      const { record, similarityScore } = item;
      context += `\n[Precedente ${index + 1} - Afinidad: ${(similarityScore * 100).toFixed(0)}%]\n`;
      context += `Categoría: ${record.category}\nTítulo: ${record.title}\n`;
      context += `Caso previo: ${record.problemDescription}\n`;
      context += `Solución exitosa demostrada: ${record.solutionApplied}\n`;
    });
    context += '\nInstrucción: Utiliza estos precedentes probados de la agencia para guiar la respuesta de forma coherente.\n';
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
