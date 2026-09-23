"use client";

import React, { useState } from "react";
import { 
  FolderKanban, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Building2,
  FileText,
  FileCheck,
  Scale,
  KeyRound
} from "lucide-react";

import { 
  PipelineStage, 
  PipelineCase, 
  INITIAL_PIPELINE_CASES, 
  PIPELINE_STAGES 
} from "@/lib/pipeline/pipelineTypes";

export type { PipelineStage, PipelineCase };
export { INITIAL_PIPELINE_CASES, PIPELINE_STAGES };

export interface InteractivePipelineProps {
  cases?: PipelineCase[];
  onCasesChange?: (cases: PipelineCase[]) => void;
  onExecuteBrokerCase: (suggestedAction: string) => void;
  onGenerateLegalDoc?: (docType: "visita" | "arras" | "lph" | "acta_llaves", pipelineCase: PipelineCase) => void;
}

export const InteractivePipeline: React.FC<InteractivePipelineProps> = ({ 
  cases: propCases,
  onCasesChange,
  onExecuteBrokerCase,
  onGenerateLegalDoc
}) => {
  const [internalCases, setInternalCases] = useState<PipelineCase[]>(INITIAL_PIPELINE_CASES);
  const currentCases = propCases || internalCases;
  const [activeStageFilter, setActiveStageFilter] = useState<PipelineStage | "todos">("todos");

  const updateCases = (updater: (prev: PipelineCase[]) => PipelineCase[]) => {
    if (onCasesChange && propCases) {
      onCasesChange(updater(propCases));
    } else {
      setInternalCases(updater);
    }
  };

  const setCaseStage = (caseId: string, newStage: PipelineStage) => {
    updateCases(prev => prev.map(c => c.id === caseId ? { ...c, stage: newStage } : c));
  };

  const moveCaseToNextStage = (caseId: string) => {
    updateCases(prev => prev.map(c => {
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
    ? currentCases 
    : currentCases.filter(c => c.stage === activeStageFilter);

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
            Todas ({currentCases.length})
          </button>
          {PIPELINE_STAGES.map(stage => {
            const count = currentCases.filter(c => c.stage === stage.id).length;
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
          const stageCases = currentCases.filter(c => c.stage === stage.id);
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

                        {/* Selector directo de fase */}
                        <div className="flex items-center justify-between gap-1 text-[10px] pt-1">
                          <span className="text-slate-400 font-semibold">Cambiar fase:</span>
                          <select
                            value={c.stage}
                            onChange={(e) => setCaseStage(c.id, e.target.value as PipelineStage)}
                            className="bg-white border border-slate-200 rounded-md px-1 py-0.5 text-slate-700 font-bold text-[9px] focus:outline-none"
                          >
                            {PIPELINE_STAGES.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1.5">
                          {c.stage === "comercializacion" && onGenerateLegalDoc ? (
                            <button
                              onClick={() => onGenerateLegalDoc("visita", c)}
                              className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                              title="Generar Hoja de Visita con blindaje de honorarios"
                            >
                              <FileCheck className="w-3 h-3 text-emerald-600" />
                              Hoja Visita
                            </button>
                          ) : (c.stage === "arras" || c.stage === "negociacion") && onGenerateLegalDoc ? (
                            <button
                              onClick={() => onGenerateLegalDoc("arras", c)}
                              className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                              title="Redactar Contrato de Arras Penitenciales (Art. 1454 C.C.)"
                            >
                              <Scale className="w-3 h-3 text-amber-600" />
                              Arras 1454
                            </button>
                          ) : c.stage === "tramitacion_notarial" && onGenerateLegalDoc ? (
                            <button
                              onClick={() => onGenerateLegalDoc("lph", c)}
                              className="flex-1 py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                              title="Requerir Certificado Deuda Cero LPH Art. 9.1.e"
                            >
                              <Building2 className="w-3 h-3 text-purple-600" />
                              Deuda LPH
                            </button>
                          ) : c.stage === "postventa" && onGenerateLegalDoc ? (
                            <button
                              onClick={() => onGenerateLegalDoc("acta_llaves", c)}
                              className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                              title="Generar Acta de Entrega de Llaves y CUPS"
                            >
                              <KeyRound className="w-3 h-3 text-emerald-600" />
                              Acta Llaves
                            </button>
                          ) : (
                            <button
                              onClick={() => onExecuteBrokerCase(c.suggestedAction)}
                              className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                              title="Tramitar acción en Consola BROKER"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              Tramitar
                            </button>
                          )}

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
