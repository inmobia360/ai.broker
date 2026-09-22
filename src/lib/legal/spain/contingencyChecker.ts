/**
 * Protocolo de Seguridad Jurídica y Auditor de Contingencias Registrales
 * Proyecto: AI BROKER (inmobia360)
 * Requisito Funcional: RF-M7
 */

export interface RegistryAuditingInput {
  propertyAddress: string;
  cadastralReference?: string;
  hasActiveMortgage?: boolean;
  mortgageBalanceEuro?: number;
  hasJudicialEmbargo?: boolean;
  embargoAmountEuro?: number;
  hasTaxLiens?: boolean; // Afecciones fiscales
  registryAreaSqm?: number;
  cadastreAreaSqm?: number;
  hasCommunityDebt?: boolean;
  energyCertificateStatus?: 'vigente' | 'tramitando' | 'ausente';
}

export interface LegalContingencyItem {
  code: string;
  severity: 'critica' | 'advertencia' | 'informativa';
  title: string;
  description: string;
  solutionAction: string;
}

export interface ContingencyReport {
  hasCriticalBlockers: boolean;
  notaryReadinessScore: number; // 0 - 100%
  contingencies: LegalContingencyItem[];
  resolutionChecklist: string[];
  summary: string;
}

export class ContingencyChecker {
  /**
   * Audita la información jurídica y registral del inmueble antes de elevar a público
   */
  static auditProperty(input: RegistryAuditingInput): ContingencyReport {
    const contingencies: LegalContingencyItem[] = [];
    const checklist: string[] = [];

    // 1. Carga Hipotecaria Viva
    if (input.hasActiveMortgage) {
      contingencies.push({
        code: 'CARGA_HIPOTECA',
        severity: 'advertencia',
        title: 'Carga Hipotecaria Registral Pendiente',
        description: `Existe hipoteca inscrita con saldo pendiente estimado de ${input.mortgageBalanceEuro ? `${input.mortgageBalanceEuro.toLocaleString('es-ES')} €` : 'importe a certificar'}.`,
        solutionAction: 'Solicitar a la entidad bancaria del vendedor el Certificado de Deuda Cero o Saldo Deudor para retención notarial y posterior cancelación registral.'
      });
      checklist.push('Retención notarial del importe de cancelación económica y honorarios de gestoría para cancelación registral.');
    }

    // 2. Embargos Judiciales o Administrativos
    if (input.hasJudicialEmbargo) {
      contingencies.push({
        code: 'EMBARGO_JUDICIAL',
        severity: 'critica',
        title: 'Anotación Preventiva de Embargo',
        description: `Existe embargo registrado por importe de ${input.embargoAmountEuro ? `${input.embargoAmountEuro.toLocaleString('es-ES')} €` : 'cuantía no especificada'}.`,
        solutionAction: 'Imprescindible Mandamiento Judicial de Cancelación de Embargo o comparecencia del acreedor en notaría con carta de pago antes de formalizar la compraventa.'
      });
      checklist.push('Carta de pago y mandamiento judicial de levantamiento de cargas.');
    }

    // 3. Discrepancias de Superficie Registro vs Catastro
    if (input.registryAreaSqm && input.cadastreAreaSqm) {
      const diff = Math.abs(input.registryAreaSqm - input.cadastreAreaSqm);
      const diffPercentage = (diff / input.registryAreaSqm) * 100;

      if (diffPercentage > 10.0) {
        contingencies.push({
          code: 'DISCREPANCIA_METROS',
          severity: 'advertencia',
          title: 'Discrepancia Catastro - Registro (>10%)',
          description: `Superficie registral (${input.registryAreaSqm} m²) difiere un ${diffPercentage.toFixed(1)}% de la catastral (${input.cadastreAreaSqm} m²).`,
          solutionAction: 'Revisar si procede subsanación de discrepancias según Ley 13/2015 de Coordinación Catastro-Registro con informe de técnico competente.'
        });
        checklist.push('Informe pericial / certificado de técnico colegiado de georreferenciación si se requiere rectificación de cabida.');
      }
    }

    // 4. Deudas de Comunidad de Propietarios
    if (input.hasCommunityDebt) {
      contingencies.push({
        code: 'DEUDA_COMUNIDAD',
        severity: 'critica',
        title: 'Deudas con la Comunidad de Propietarios',
        description: 'La finca presenta recibos o derramas pendientes con la comunidad de propietarios.',
        solutionAction: 'El vendedor debe liquidar los saldos pendientes y aportar Certificado de Corriente de Pago emitido por el Administrador al amparo del Art. 9.1.e LPH.'
      });
      checklist.push('Certificado oficial del Administrador/Secretario de la Comunidad de Propietarios.');
    }

    // 5. Certificado de Eficiencia Energética (CEE)
    if (input.energyCertificateStatus === 'ausente') {
      contingencies.push({
        code: 'CEE_AUSENTE',
        severity: 'advertencia',
        title: 'Certificado Energético (CEE) Ausente o Caducado',
        description: 'No consta certificado energético registrado conforme al RD 390/2021.',
        solutionAction: 'Encargar visita de técnico cualificado para registro de etiqueta energética oficial antes de notaría.'
      });
      checklist.push('Registro oficial de etiqueta energética autonómica.');
    }

    // 6. Afecciones Fiscales Habituales
    if (input.hasTaxLiens) {
      contingencies.push({
        code: 'AFECCION_FISCAL',
        severity: 'informativa',
        title: 'Afección Fiscal por Autoliquidación Previa',
        description: 'Afección registral estándar por liquidación del Impuesto de Transmisiones Patrimoniales (ITP) o Sucesiones.',
        solutionAction: 'Si han transcurrido más de 5 años desde la liquidación, se cancelará por caducidad legal ordinaria.'
      });
    }

    const hasCritical = contingencies.some(c => c.severity === 'critica');
    
    // Cálculo de puntuación de preparación notarial
    let score = 100;
    for (const c of contingencies) {
      if (c.severity === 'critica') score -= 35;
      else if (c.severity === 'advertencia') score -= 15;
      else score -= 5;
    }
    score = Math.max(0, score);

    const summary = hasCritical
      ? 'Atención: Existen contingencias críticas que impiden la elevación a público sin resolución previa.'
      : contingencies.length > 0
      ? 'Finca apta para elevación a público con trámites subsanables en notaría (retenciones bancarias o certificados).'
      : 'Finca plenamente limpia de cargas y lista para firma notarial inmediata.';

    return {
      hasCriticalBlockers: hasCritical,
      notaryReadinessScore: score,
      contingencies,
      resolutionChecklist: checklist,
      summary
    };
  }
}
