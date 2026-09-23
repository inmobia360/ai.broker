"use client";

import React from "react";
import { Building2, Users, FolderKanban, TrendingUp, Sparkles, ArrowUpRight } from "lucide-react";

interface MetricCardsProps {
  onQuickAction: (action: "properties" | "cma" | "content" | "leads") => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ onQuickAction }) => {
  const metrics = [
    {
      title: "Cartera Activa",
      value: "5 Propiedades",
      detail: "3 exclusivas / 2 compartidas",
      trend: "+2 este mes",
      icon: Building2,
      color: "text-blue-400",
      bg: "bg-blue-600/10 border-blue-500/20",
      target: "properties" as const
    },
    {
      title: "Leads Calientes",
      value: "4 Prioritarios",
      detail: "Tiempo de respuesta medio: 8 min",
      trend: "Requieren contacto hoy",
      icon: Users,
      color: "text-amber-400",
      bg: "bg-amber-600/10 border-amber-500/20",
      target: "leads" as const
    },
    {
      title: "Expedientes en Curso",
      value: "7 Operaciones",
      detail: "2 en Notaría / 1 en Arras",
      trend: "94% ratio de avance",
      icon: FolderKanban,
      color: "text-emerald-400",
      bg: "bg-emerald-600/10 border-emerald-500/20",
      target: "cma" as const
    },
    {
      title: "Volumen Gestionado",
      value: "3.975.000 €",
      detail: "Comisiones estimadas: 119.250 €",
      trend: "+18% vs trimestre anterior",
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-600/10 border-purple-500/20",
      target: "cma" as const
    }
  ];

  return (
    <div className="space-y-4">
      {/* Tarjetas Principales de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div 
              key={idx}
              onClick={() => onQuickAction(m.target)}
              className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">{m.title}</span>
                  <div className="text-xl font-bold text-white mt-1 group-hover:text-blue-400 transition-colors">
                    {m.value}
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl ${m.bg} border flex items-center justify-center ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">{m.detail}</span>
                <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                  {m.trend}
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de Acciones Rápidas */}
      <div className="p-4 bg-gradient-to-r from-blue-900/30 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Acciones Rápidas del Día
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatiza tu gestión comercial y legal sin salir de tu panel de marca blanca.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onQuickAction("properties")}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            Ver Propiedades & Mapa
          </button>
          <button
            onClick={() => onQuickAction("cma")}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            Tasador ACM Rápido
          </button>
          <button
            onClick={() => onQuickAction("content")}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Generador Copys IA
          </button>
          <button
            onClick={() => onQuickAction("leads")}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            Contactos & Leads
          </button>
        </div>
      </div>
    </div>
  );
};
