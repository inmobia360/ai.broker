"use client";

import React from "react";
import { Users, Phone, MessageSquare, FileSpreadsheet, Flame, ArrowRight, ExternalLink } from "lucide-react";

export interface PriorityLead {
  id: string;
  name: string;
  category: string;
  location: string;
  budget: string;
  inquiry: string;
  recommendedAction: string;
  phone: string;
  urgency: "inmediata" | "alta" | "media";
  suggestedPrompt: string;
}

interface PriorityLeadsWidgetProps {
  onTriggerBrokerAction: (prompt: string) => void;
  onOpenAllLeads?: () => void;
}

export const PRIORITY_LEADS: PriorityLead[] = [
  {
    id: "lead-1",
    name: "Carlos Romero (Family Office)",
    category: "Compra / Inversión Patrimonial",
    location: "Barrio de Salamanca, Madrid",
    budget: "850.000 € (Contado sin hipoteca)",
    inquiry: "Hola, buscamos un ático de 3 habitaciones en Barrio de Salamanca con terraza y garaje para inversión patrimonial. Contamos con 850.000€ al contado sin necesidad de hipoteca.",
    recommendedAction: "Llamar en menos de 15 minutos y enviar dossier financiero de rentabilidad y Cap Rate.",
    phone: "+34600123456",
    urgency: "inmediata",
    suggestedPrompt: "Generar dossier financiero de rentabilidad neta y Cap Rate para Carlos Romero del Family Office sobre el ático de Salamanca."
  },
  {
    id: "lead-2",
    name: "Sophie Müller",
    category: "Compra Residencial / Inversión",
    location: "Costa Adeje, Tenerife (Canarias)",
    budget: "1.450.000 €",
    inquiry: "Hello, we are looking for a luxury villa in Tenerife South with sea views and holiday license. We are currently in Costa Adeje and would like to arrange a private viewing this Saturday.",
    recommendedAction: "Contactar por WhatsApp en inglés para coordinar visita privada y transferir ficha técnica.",
    phone: "+34600987654",
    urgency: "inmediata",
    suggestedPrompt: "Redactar mensaje de WhatsApp en inglés para Sophie Müller coordinando visita privada el sábado a la Villa de Costa Adeje con ficha técnica."
  },
  {
    id: "lead-3",
    name: "Elena Rostova",
    category: "Inversión Alquiler Tradicional",
    location: "Eixample Dret, Barcelona",
    budget: "620.000 €",
    inquiry: "Buenas tardes. Me interesa el activo modernista en Eixample, Barcelona. ¿Tienen el desglose de IBI, gastos de comunidad y la rentabilidad neta estimada?",
    recommendedAction: "Enviar desglose de costes IBI/LPH y calcular rentabilidad neta neta previa a la visita.",
    phone: "+34600554433",
    urgency: "alta",
    suggestedPrompt: "Calcular rentabilidad neta, IBI y cuota comunitaria LPH para Elena Rostova sobre el piso modernista de Eixample Barcelona."
  },
  {
    id: "lead-4",
    name: "Javier Domínguez",
    category: "Captación / Valoración de Venta",
    location: "Playa de la Malvarrosa, Valencia",
    budget: "Propietario Vendedor",
    inquiry: "He visto vuestra publicación del ático frente al mar en Valencia. Tengo una vivienda en la zona que quiero valorar para venta y me gustaría conocer vuestro plan de marketing.",
    recommendedAction: "Ofrecer Análisis Comparativo de Mercado (ACM) gratuito y agendar cita presencial para captación en exclusiva.",
    phone: "+34600778899",
    urgency: "alta",
    suggestedPrompt: "Preparar propuesta de valoración ACM y plan de comercialización en exclusiva para Javier Domínguez en Valencia."
  }
];

export const PriorityLeadsWidget: React.FC<PriorityLeadsWidgetProps> = ({ 
  onTriggerBrokerAction,
  onOpenAllLeads
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              Leads Calientes Prioritarios (Acción Inmediata)
            </h2>
            <p className="text-xs text-slate-400">
              Contactos filtrados que requieren respuesta rápida para maximizar la conversión comercial.
            </p>
          </div>
        </div>
        {onOpenAllLeads && (
          <button
            onClick={onOpenAllLeads}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
          >
            Ver todos los contactos
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PRIORITY_LEADS.map((lead) => {
          const isImmediate = lead.urgency === "inmediata";
          return (
            <div 
              key={lead.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{lead.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                        isImmediate 
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {isImmediate ? "⚡ Contactar < 15 min" : "Prioridad Alta"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {lead.category} · <strong className="text-slate-300">{lead.location}</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-400">{lead.budget}</span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-300 italic leading-relaxed">
                  &ldquo;{lead.inquiry}&rdquo;
                </div>

                <div className="mt-2.5 text-xs text-amber-300/90 font-medium flex items-start gap-1.5">
                  <span className="text-amber-400">👉</span>
                  <span><strong>Acción recomendada:</strong> {lead.recommendedAction}</span>
                </div>
              </div>

              {/* Botones de Acción Inmediata */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hola ${lead.name.split(" ")[0]}, te contacto desde la agencia por tu interés en el inmueble de ${lead.location}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Abrir WhatsApp directo"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${lead.phone}`}
                    className="p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Llamar directamente"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Llamar</span>
                  </a>
                </div>

                <button
                  onClick={() => onTriggerBrokerAction(lead.suggestedPrompt)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Tramitar con Director BROKER
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
