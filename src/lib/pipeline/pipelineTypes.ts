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
  clientDni?: string;
  clientPhone?: string;
  clientEmail?: string;
  price: string;
  stage: PipelineStage;
  pendingDoc: string;
  suggestedAction: string;
  cadastralRef?: string;
  assignedAgent?: string;
  visitDate?: string;
  visitTime?: string;
  feePercentage?: number;
  validityMonths?: number;
}

export const INITIAL_PIPELINE_CASES: PipelineCase[] = [
  {
    id: "EXP-2026-001",
    title: "Ático Dúplex en Salamanca",
    clientName: "Carlos Romero (Comprador)",
    clientDni: "53891402X",
    clientPhone: "+34 600 123 456",
    clientEmail: "carlos.romero@familyoffice-madrid.es",
    price: "890.000 €",
    stage: "negociacion",
    pendingDoc: "Cálculo de Banda de Cierre y ZOPA",
    suggestedAction: "Analizar banda de negociación y oferta en firme para el ático de Salamanca",
    cadastralRef: "5432101VK4753B0001TR",
    assignedAgent: "Director de Agencia",
    visitDate: "26/09/2026",
    visitTime: "11:30",
    feePercentage: 3,
    validityMonths: 12
  },
  {
    id: "EXP-2026-002",
    title: "Villa de Lujo en Costa Adeje",
    clientName: "Sophie Müller (Visitante)",
    clientDni: "Y-8492014-K",
    clientPhone: "+34 600 987 654",
    clientEmail: "sophie.muller@invest-europa.com",
    price: "1.450.000 €",
    stage: "comercializacion",
    pendingDoc: "Hoja de Visita con Reserva de Honorarios",
    suggestedAction: "Preparar hoja de visita con blindaje de honorarios para Sophie Müller en Tenerife",
    cadastralRef: "38001A005001230000TG",
    assignedAgent: "Carlos Martínez (Comercial)",
    visitDate: "26/09/2026",
    visitTime: "17:30",
    feePercentage: 3,
    validityMonths: 12
  },
  {
    id: "EXP-2026-003",
    title: "Piso Modernista Eixample",
    clientName: "Elena Rostova (Inversora)",
    clientDni: "X-7744112-L",
    clientPhone: "+34 622 889 900",
    clientEmail: "elena.rostova@barcelonaprime.es",
    price: "620.000 €",
    stage: "calificacion",
    pendingDoc: "Auditoría de Contingencias y Cargas",
    suggestedAction: "Auditar nota simple y cargas registrales para el piso de Eixample Barcelona",
    cadastralRef: "08019A012000540001XF",
    assignedAgent: "Carlos Martínez (Comercial)",
    visitDate: "27/09/2026",
    visitTime: "10:00",
    feePercentage: 3,
    validityMonths: 12
  },
  {
    id: "EXP-2026-004",
    title: "Ático Malvarrosa Valencia",
    clientName: "Marcos Valls (Comprador)",
    clientDni: "24567891B",
    clientPhone: "+34 612 345 678",
    clientEmail: "marcos.valls@valenciaprime.es",
    price: "475.000 €",
    stage: "arras",
    pendingDoc: "Contrato de Arras Penitenciales (Art. 1454 C.C.)",
    suggestedAction: "Redactar contrato de arras penitenciales con señal del 10% para el ático de Valencia",
    cadastralRef: "46900A015000760001BH",
    assignedAgent: "Carlos Martínez (Comercial)",
    visitDate: "26/09/2026",
    visitTime: "16:00",
    feePercentage: 3,
    validityMonths: 12
  },
  {
    id: "EXP-2026-005",
    title: "Piso Paseo de la Castellana",
    clientName: "Inmobiliaria Albia (Vendedora)",
    clientDni: "B-88392104",
    clientPhone: "+34 913 456 789",
    clientEmail: "patrimonio@inmobiliaria-albia.es",
    price: "520.000 €",
    stage: "tramitacion_notarial",
    pendingDoc: "Certificado Deuda Cero LPH (Art. 9.1.e) y CEE",
    suggestedAction: "Solicitar certificado de deuda cero LPH al Administrador de Fincas para Castellana",
    cadastralRef: "7845120VK4774E0001KL",
    assignedAgent: "Director de Agencia",
    visitDate: "28/09/2026",
    visitTime: "12:00",
    feePercentage: 3,
    validityMonths: 12
  },
  {
    id: "EXP-2026-006",
    title: "Casa Señorial Santa Cruz Sevilla",
    clientName: "Familia Benjumea",
    clientDni: "28994512J",
    clientPhone: "+34 655 112 233",
    clientEmail: "benjumea.sevilla@patrimonio.es",
    price: "540.000 €",
    stage: "captacion",
    pendingDoc: "Dossier de Prevaloración ACM para Captación",
    suggestedAction: "Elaborar informe de prevaloración ACM para la captación en exclusiva de Santa Cruz",
    cadastralRef: "41091A002000880001AZ",
    assignedAgent: "Carlos Martínez (Comercial)",
    visitDate: "29/09/2026",
    visitTime: "18:00",
    feePercentage: 3,
    validityMonths: 12
  },
  {
    id: "EXP-2026-007",
    title: "Chalet en Las Rozas Madrid",
    clientName: "Roberto Gómez (Comprador)",
    clientDni: "05432198M",
    clientPhone: "+34 677 889 900",
    clientEmail: "roberto.gomez@madridnorte.es",
    price: "730.000 €",
    stage: "postventa",
    pendingDoc: "Acta de Llaves y Lectura de Contadores CUPS",
    suggestedAction: "Generar acta de entrega de llaves y lectura de contadores con cambio de suministros",
    cadastralRef: "28127A003001890001UY",
    assignedAgent: "Director de Agencia",
    visitDate: "25/09/2026",
    visitTime: "11:00",
    feePercentage: 3,
    validityMonths: 12
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
