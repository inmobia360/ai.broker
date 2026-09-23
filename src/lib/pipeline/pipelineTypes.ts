export type PipelineStage = 
  | "captacion"
  | "calificacion"
  | "comercializacion"
  | "negociacion"
  | "arras"
  | "tramitacion_notarial"
  | "postventa";

export interface PipelineCase {
  id: string;
  title: string;
  clientName: string;
  price: string;
  stage: PipelineStage;
  pendingDoc: string;
  suggestedAction: string;
}

export const INITIAL_PIPELINE_CASES: PipelineCase[] = [
  {
    id: "EXP-2026-001",
    title: "Ático Dúplex en Salamanca",
    clientName: "Carlos Romero (Comprador)",
    price: "890.000 €",
    stage: "negociacion",
    pendingDoc: "Cálculo de Banda de Cierre y ZOPA",
    suggestedAction: "Analizar banda de negociación y oferta en firme para el ático de Salamanca"
  },
  {
    id: "EXP-2026-002",
    title: "Villa de Lujo en Costa Adeje",
    clientName: "Sophie Müller (Visitante)",
    price: "1.450.000 €",
    stage: "comercializacion",
    pendingDoc: "Hoja de Visita con Reserva de Honorarios",
    suggestedAction: "Preparar hoja de visita con blindaje de honorarios para Sophie Müller en Tenerife"
  },
  {
    id: "EXP-2026-003",
    title: "Piso Modernista Eixample",
    clientName: "Elena Rostova (Inversora)",
    price: "620.000 €",
    stage: "calificacion",
    pendingDoc: "Auditoría de Contingencias y Cargas",
    suggestedAction: "Auditar nota simple y cargas registrales para el piso de Eixample Barcelona"
  },
  {
    id: "EXP-2026-004",
    title: "Ático Malvarrosa Valencia",
    clientName: "Marcos Valls (Comprador)",
    price: "475.000 €",
    stage: "arras",
    pendingDoc: "Contrato de Arras Penitenciales (Art. 1454 C.C.)",
    suggestedAction: "Redactar contrato de arras penitenciales con señal del 10% para el ático de Valencia"
  },
  {
    id: "EXP-2026-005",
    title: "Piso Paseo de la Castellana",
    clientName: "Inmobiliaria Albia (Vendedora)",
    price: "520.000 €",
    stage: "tramitacion_notarial",
    pendingDoc: "Certificado Deuda Cero LPH (Art. 9.1.e) y CEE",
    suggestedAction: "Solicitar certificado de deuda cero LPH al Administrador de Fincas para Castellana"
  },
  {
    id: "EXP-2026-006",
    title: "Casa Señorial Santa Cruz Sevilla",
    clientName: "Familia Benjumea",
    price: "540.000 €",
    stage: "captacion",
    pendingDoc: "Dossier de Prevaloración ACM para Captación",
    suggestedAction: "Elaborar informe de prevaloración ACM para la captación en exclusiva de Santa Cruz"
  },
  {
    id: "EXP-2026-007",
    title: "Chalet en Las Rozas Madrid",
    clientName: "Roberto Gómez (Comprador)",
    price: "730.000 €",
    stage: "postventa",
    pendingDoc: "Acta de Llaves y Lectura de Contadores CUPS",
    suggestedAction: "Generar acta de entrega de llaves y lectura de contadores con cambio de suministros"
  }
];

export const PIPELINE_STAGES: Array<{ id: PipelineStage; name: string; stepNumber: number; color: string }> = [
  { id: "captacion", name: "1. Captación", stepNumber: 1, color: "border-blue-200 text-blue-700 bg-blue-50" },
  { id: "calificacion", name: "2. Calificación", stepNumber: 2, color: "border-cyan-200 text-cyan-700 bg-cyan-50" },
  { id: "comercializacion", name: "3. Comercialización", stepNumber: 3, color: "border-indigo-200 text-indigo-700 bg-indigo-50" },
  { id: "negociacion", name: "4. Negociación", stepNumber: 4, color: "border-amber-200 text-amber-700 bg-amber-50" },
  { id: "arras", name: "5. Arras C.C.", stepNumber: 5, color: "border-orange-200 text-orange-700 bg-orange-50" },
  { id: "tramitacion_notarial", name: "6. Notaría & LPH", stepNumber: 6, color: "border-purple-200 text-purple-700 bg-purple-50" },
  { id: "postventa", name: "7. Postventa", stepNumber: 7, color: "border-emerald-200 text-emerald-700 bg-emerald-50" }
];
