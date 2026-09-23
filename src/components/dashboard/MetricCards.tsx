"use client";

import React from "react";
import { Building2, Users, Flame, Eye, Sparkles, Plus, ArrowUpRight } from "lucide-react";

interface MetricCardsProps {
  onQuickAction: (action: "properties" | "cma" | "content" | "leads") => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ onQuickAction }) => {
  return (
    <div className="space-y-6">
      {/* 4 Tarjetas de Métricas idénticas a inmobia360.com/app/dashboard/ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Propiedades Publicadas */}
        <div 
          onClick={() => onQuickAction("properties")}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                PROPIEDADES PUBLICADAS
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900">5</span>
                <span className="text-xs text-slate-400 font-medium">/ 5 en catálogo</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>0 borradores · 0 listas</span>
          </div>
        </div>

        {/* 2. Leads Recibidos */}
        <div 
          onClick={() => onQuickAction("leads")}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                LEADS RECIBIDOS
              </span>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-3xl font-extrabold text-slate-900">4</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  +2 nuevos
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-medium">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Captación activa en landings
            </span>
          </div>
        </div>

        {/* 3. Leads Prioritarios */}
        <div 
          onClick={() => onQuickAction("leads")}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                LEADS PRIORITARIOS
              </span>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-3xl font-extrabold text-slate-900">2</span>
                <span className="text-[11px] font-bold text-rose-600">
                  HOT SCORE &gt; 80%
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Requieren contacto prioritario</span>
          </div>
        </div>

        {/* 4. Impactos y Visitas */}
        <div 
          onClick={() => onQuickAction("properties")}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                IMPACTOS Y VISITAS
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900">3670</span>
                <span className="text-xs text-slate-400 font-medium">0.1% conversión</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Tráfico en enlaces públicos</span>
          </div>
        </div>
      </div>

      {/* Banner "Acciones Rápidas de Marketing" con gradiente azul oscuro */}
      <div className="bg-gradient-to-r from-[#172554] via-[#1e1b4b] to-[#0f172a] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-amber-400">⚡</span>
            Acciones Rápidas de Marketing
          </h3>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Publica una nueva ficha, activa el generador multicanal con IA o comparte tus landings comerciales con compradores e inversores.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => onQuickAction("properties")}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Crear Propiedad
          </button>
          <button
            onClick={() => onQuickAction("content")}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Generador IA
          </button>
          <button
            onClick={() => onQuickAction("leads")}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            Ver Leads
          </button>
        </div>
      </div>
    </div>
  );
};
