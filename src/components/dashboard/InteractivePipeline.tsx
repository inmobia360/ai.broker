"use client";

import React, { useState } from "react";
import { 
  FolderKanban, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Building2,
  FileText
} from "lucide-react";

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

interface InteractivePipelineProps {
  onExecuteBrokerCase: (suggestedAction: string) => void;
}

export const InteractivePipeline: React.FC<InteractivePipelineProps> = ({ onExecuteBrokerCase }) => {
  const [cases, setCases] = useState<PipelineCase[]>(INITIAL_PIPELINE_CASES);
  const [activeStageFilter, setActiveStageFilter] = useState<PipelineStage | "todos">("todos");

  const moveCaseToNextStage = (caseId: string) => {
    setCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;
      const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === c.stage);
      if (currentIndex < PIPELINE_STAGES.length - 1) {
        const nextStage = PIPELINE_STAGES[currentIndex + 1].id;
        return { ...c, stage: nextStage };
      }
      return c;
    }));
  };

  const filteredCases = activeStageFilter === "todos" 
    ? cases 
    : cases.filter(c => c.stage === activeStageFilter);

  return (
    <div className="space-y-6">
      {/* Cabecera del Pipeline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-600" />
            Pipeline de Ciclo Inmobiliario Completo (7 Fases)
          </h2>
          <p className="text-xs text-slate-500">
            Control de expedientes desde la captación hasta la entrega física de llaves y suministros
          </p>
        </div>

        {/* Selector de Filtro de Etapa */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveStageFilter("todos")}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap ${
              activeStageFilter === "todos" ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900"
            }`}
          >
            Todas ({cases.length})
          </button>
          {PIPELINE_STAGES.map(stage => {
            const count = cases.filter(c => c.stage === stage.id).length;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStageFilter(stage.id)}
                className={`px-2.5 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap ${
                  activeStageFilter === stage.id ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900"
                }`}
              >
                {stage.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Tablero Kanban de 7 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map(stage => {
          const stageCases = cases.filter(c => c.stage === stage.id);
          const isFilterActive = activeStageFilter === "todos" || activeStageFilter === stage.id;

          if (!isFilterActive) return null;

          return (
            <div 
              key={stage.id}
              className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between min-h-[400px] space-y-3 shadow-xs"
            >
              <div>
                {/* Cabecera de Columna */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${stage.color}`}>
                    {stage.name}
                  </span>
                  <span className="text-xs text-slate-500 font-bold font-mono">
                    {stageCases.length}
                  </span>
                </div>

                {/* Tarjetas de la Etapa */}
                <div className="mt-3 space-y-2.5">
                  {stageCases.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      Sin expedientes
                    </div>
                  ) : (
                    stageCases.map(c => (
                      <div 
                        key={c.id}
                        className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 hover:shadow-xs transition-all"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-blue-600 font-bold">{c.id}</span>
                          <span className="font-extrabold text-emerald-600">{c.price}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h4>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{c.clientName}</div>
                        
                        <div className="p-2 bg-white rounded-lg text-[10px] text-slate-700 border border-slate-200/80 flex items-start gap-1 font-medium">
                          <FileText className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{c.pendingDoc}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1.5">
                          <button
                            onClick={() => onExecuteBrokerCase(c.suggestedAction)}
                            className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                            title="Tramitar acción en Consola BROKER"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                            Tramitar
                          </button>
                          {stage.stepNumber < 7 && (
                            <button
                              onClick={() => moveCaseToNextStage(c.id)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors"
                              title="Avanzar a siguiente fase"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 font-medium text-center border-t border-slate-100">
                Paso {stage.stepNumber} de 7
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
