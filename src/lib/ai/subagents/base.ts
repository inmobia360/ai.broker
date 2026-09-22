import type { SpecialistDomain, SpecialistTaskRequest, SpecialistResponse } from "./types.ts";

export class SubagentDirectAccessBlockedError extends Error {
  public statusCode: number = 403;
  constructor(specialistName: string) {
    super(
      `Acceso directo denegado al subagente '${specialistName}'. Conforme al RF-4 y el Principio 2 de la Constitución, los subagentes especializados (Legal, Comercial, Marketing) no pueden responder de forma directa ni desintermediada al usuario. Todas las consultas deben canalizarse a través del Director BROKER.`
    );
    this.name = "SubagentDirectAccessBlockedError";
  }
}

export class CanonicalMemoryWriteForbiddenError extends Error {
  public statusCode: number = 403;
  constructor(specialistName: string) {
    super(
      `Violación de Memoria Canónica por '${specialistName}'. Conforme al Principio 2 de la Constitución de AI BROKER, los subagentes especializados son herramientas de cálculo y redacción sin autorización de escritura en la memoria canónica de la agencia. Solo el Director BROKER puede consolidar conocimiento.`
    );
    this.name = "CanonicalMemoryWriteForbiddenError";
  }
}

export abstract class BaseSpecialistSubagent {
  abstract readonly domain: SpecialistDomain;
  abstract readonly specialistName: string;

  /**
   * Intento prohibido de interacción directa sin la mediación del Director BROKER (RF-4).
   */
  public async handleUserDirectly(_userMessage: string): Promise<never> {
    throw new SubagentDirectAccessBlockedError(this.specialistName);
  }

  /**
   * Intento prohibido de escritura en memoria canónica por un subagente (Principio 2 Constitución).
   */
  public async writeCanonicalMemory(_entry: Record<string, any>): Promise<never> {
    throw new CanonicalMemoryWriteForbiddenError(this.specialistName);
  }

  /**
   * Ejecución de tarea especializada invocada y coordinada exclusivamente por el Director BROKER.
   */
  public abstract executeInternalTask(req: SpecialistTaskRequest): Promise<SpecialistResponse>;

  /**
   * Verifica la legitimidad del token de sesión de orquestación interna del Director BROKER.
   */
  protected verifyBrokerToken(token: string): boolean {
    return Boolean(token && token.startsWith("broker-internal-auth:"));
  }
}
