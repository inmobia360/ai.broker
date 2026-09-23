"use client";

import React, { useState } from "react";
import { 
  FolderKanban, 
  Sparkles, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
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
  { id: "captacion", name: "1. Captación", stepNumber: 1, color: "border-blue-500/40 text-blue-400 bg-blue-500/10" },
  { id: "calificacion", name: "2. Calificación", stepNumber: 2, color: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10" },
  { id: "comercializacion", name: "3. Comercialización", stepNumber: 3, color: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10" },
  { id: "negociacion", name: "4. Negociación", stepNumber: 4, color: "border-amber-500/40 text-amber-400 bg-amber-500/10" },
  { id: "arras", name: "5. Arras C.C.", stepNumber: 5, color: "border-orange-500/40 text-orange-400 bg-orange-500/10" },
  { id: "tramitacion_notarial", name: "6. Notaría & LPH", stepNumber: 6, color: "border-purple-500/40 text-purple-400 bg-purple-500/10" },
  { id: "postventa", name: "7. Postventa", stepNumber: 7, color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" }
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
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-400" />
            Pipeline de Ciclo Inmobiliario Completo (7 Fases)
          </h2>
          <p className="text-xs text-slate-400">
            Control exhaustivo desde la captación hasta la entrega física de llaves y suministros
          </p>
        </div>

        {/* Selector de Filtro de Etapa */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveStageFilter("todos")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              activeStageFilter === "todos" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
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
                className={`px-2.5 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  activeStageFilter === stage.id ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
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
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between min-h-[380px] space-y-3"
            >
              <div>
                {/* Cabecera de Columna */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${stage.color}`}>
                    {stage.name}
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-medium">
                    {stageCases.length}
                  </span>
                </div>

                {/* Tarjetas de la Etapa */}
                <div className="mt-3 space-y-2.5">
                  {stageCases.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-600">
                      Sin expedientes
                    </div>
                  ) : (
                    stageCases.map(c => (
                      <div 
                        key={c.id}
                        className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono text-blue-400 font-medium">{c.id}</span>
                          <span className="font-bold text-emerald-400">{c.price}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-white line-clamp-1">{c.title}</h4>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{c.clientName}</div>
                        
                        <div className="p-2 bg-slate-900 rounded-lg text-[10px] text-amber-300/90 border border-slate-800 flex items-start gap-1">
                          <FileText className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{c.pendingDoc}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                          <button
                            onClick={() => onExecuteBrokerCase(c.suggestedAction)}
                            className="flex-1 py-1 px-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
                            title="Tramitar acción en Consola BROKER"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            Tramitar
                          </button>
                          {stage.stepNumber < 7 && (
                            <button
                              onClick={() => moveCaseToNextStage(c.id)}
                              className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
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

              <div className="pt-2 text-[10px] text-slate-500 text-center border-t border-slate-800/60">
                Paso {stage.stepNumber} de 7
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
