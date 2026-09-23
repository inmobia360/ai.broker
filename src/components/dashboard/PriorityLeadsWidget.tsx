"use client";

import React from "react";
import { Phone, MessageSquare, Mail, Sparkles, ArrowUpRight, Trash2, FileCheck, Scale, FolderKanban } from "lucide-react";
import { PriorityLead, PRIORITY_LEADS } from "@/lib/leads/leadTypes";

export type { PriorityLead };
export { PRIORITY_LEADS };

interface PriorityLeadsWidgetProps {
  leads?: PriorityLead[];
  onTriggerBrokerAction: (prompt: string) => void;
  onOpenAllLeads?: () => void;
  onGenerateVisitSheet?: (lead: PriorityLead) => void;
  onGenerateArrasContract?: (lead: PriorityLead) => void;
  onConvertToPipeline?: (lead: PriorityLead) => void;
}

export const PriorityLeadsWidget: React.FC<PriorityLeadsWidgetProps> = ({ 
  leads,
  onTriggerBrokerAction,
  onOpenAllLeads,
  onGenerateVisitSheet,
  onGenerateArrasContract,
  onConvertToPipeline
}) => {
  const displayedLeads = leads && leads.length > 0 ? leads : PRIORITY_LEADS;
  return (
    <div className="space-y-4">
      {/* Cabecera idéntica a inmobia360.com */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-rose-500 text-lg">🔥</span>
          <h2 className="text-base font-bold text-slate-900">
            Leads Calientes Prioritarios (Acción Inmediata)
          </h2>
        </div>
        {onOpenAllLeads && (
          <button
            onClick={onOpenAllLeads}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors"
          >
            Ver todos los leads
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tarjetas de Leads Calientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {displayedLeads.map((lead) => (
          <div 
            key={lead.id}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Indicador de Temperatura y Hora */}
              <div className="flex items-center justify-between text-xs pb-1">
                <div className="flex items-center gap-1.5 font-semibold text-rose-600">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  Lead Caliente (Alta Intención)
                </div>
                <span className="text-slate-400 font-mono text-[11px]">{lead.timeAgo}</span>
              </div>

              {/* Perfil del Lead con Score */}
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${lead.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0`}>
                    {lead.initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {lead.name}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {lead.category} · {lead.location}
                    </div>
                  </div>
                </div>

                {/* Score en Rojo */}
                <div className="text-right">
                  <span className="text-2xl font-black text-rose-600">{lead.score}</span>
                  <span className="text-xs font-semibold text-slate-400">/100</span>
                </div>
              </div>

              {/* Barra de Presupuesto y Plazo */}
              <div className="mt-3 py-2 px-3 bg-slate-50/80 rounded-xl flex items-center justify-between text-xs text-slate-700 font-medium">
                <div>
                  <span className="text-slate-400 font-normal">Presupuesto:</span>{" "}
                  <strong className="text-slate-900">{lead.budget}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-normal">Plazo:</span>{" "}
                  <strong className="text-slate-900">{lead.timeframe}</strong>
                </div>
              </div>

              {/* Mensaje Textual en Recuadro Gris */}
              <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 italic leading-relaxed">
                &ldquo;{lead.inquiry}&rdquo;
              </div>

              {/* Recomendación con IA */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-600 font-bold">
                    + Próxima acción recomendada
                  </span>
                  <span 
                    onClick={() => onTriggerBrokerAction(lead.suggestedPrompt)}
                    className="text-slate-400 hover:text-blue-600 cursor-pointer font-medium"
                  >
                    Re-analizar con IA
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-medium">
                  {lead.recommendedAction}
                </p>
              </div>
            </div>

            {/* Barra Inferior de Contacto Rápido */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${lead.phone}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{lead.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hola ${lead.name.split(" ")[0]}, te contacto desde la agencia por tu interés en el inmueble de ${lead.location}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                  title="Contactar por WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:lead@ejemplo.com`}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Enviar correo"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => onGenerateVisitSheet ? onGenerateVisitSheet(lead) : onTriggerBrokerAction(`Generar Hoja de Visita oficial con reserva de honorarios para ${lead.name} por el inmueble en ${lead.location}`)}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Generar Hoja de Encargo de Visita con blindaje de honorarios y firma digital"
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hoja Visita</span>
                </button>
                <button
                  onClick={() => onGenerateArrasContract ? onGenerateArrasContract(lead) : onTriggerBrokerAction(`Redactar contrato de arras penitenciales según Art. 1454 C.C. para ${lead.name} con importe ${lead.budget} en ${lead.location}`)}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Redactar Contrato de Arras Penitenciales según Art. 1454 del Código Civil"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-600" />
                  <span>Arras 1454</span>
                </button>
                {onConvertToPipeline && (
                  <button
                    onClick={() => onConvertToPipeline(lead)}
                    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/80 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Convertir este lead en un expediente activo dentro del Pipeline Kanban"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
                    <span>A Pipeline</span>
                  </button>
                )}
                <button
                  onClick={() => onTriggerBrokerAction(lead.suggestedPrompt)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Operar con IA
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
