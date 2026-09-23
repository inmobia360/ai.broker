"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  TrendingUp, 
  ExternalLink, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Building2,
  FileCheck,
  ShieldCheck
} from "lucide-react";
import { CmaValuator } from "@/lib/valuation/cmaValuator";
import type { PropertyCondition } from "@/lib/valuation/cmaValuator";
import { DeepLinkGenerator } from "@/lib/geo/deepLinkGenerator";

interface InteractiveCMAProps {
  initialAddress?: string;
  initialM2?: number;
  onGenerateDossier: (summary: string) => void;
}

export const InteractiveCMA: React.FC<InteractiveCMAProps> = ({ 
  initialAddress = "Calle Serrano 45, Barrio de Salamanca, Madrid",
  initialM2 = 120,
  onGenerateDossier 
}) => {
  const [address, setAddress] = useState(initialAddress);
  const [builtM2, setBuiltM2] = useState<number>(initialM2);
  const [condition, setCondition] = useState<PropertyCondition>("buen_estado");
  const [hasElevator, setHasElevator] = useState(true);
  const [bedrooms, setBedrooms] = useState(3);
  const [constructionYear, setConstructionYear] = useState(1985);
  const [cadastralRef, setCadastralRef] = useState("5432101VK4753B0001TR");

  const [valuationResult, setValuationResult] = useState<any>(null);

  // Recalcular en tiempo real al cambiar cualquier parámetro
  useEffect(() => {
    try {
      const output = CmaValuator.calculateValuation("inmobia360", {
        address,
        builtM2: Number(builtM2) || 80,
        condition,
        hasElevator,
        bedrooms,
        bathrooms: 2,
        constructionYear,
        cadastralReference: cadastralRef
      });
      setValuationResult(output);
    } catch (e) {
      console.error("Error calculando ACM:", e);
    }
  }, [address, builtM2, condition, hasElevator, bedrooms, constructionYear, cadastralRef]);

  const deepLinks = DeepLinkGenerator.generateLinks({
    lat: 40.4285,
    lon: -3.6875,
    cadastralReference: cadastralRef
  });

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            Tasador ACM Interactivo (Análisis Comparativo de Mercado)
          </h2>
          <p className="text-xs text-slate-400">
            Cálculo inmediato de valor de mercado en España basado en testigos, micro-zona y dotaciones
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORMULARIO DE PARÁMETROS (5 columnas) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
            Datos Físicos del Inmueble
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-medium">Dirección / Micro-Zona</label>
              <div className="mt-1 relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-amber-400 transition-colors"
                  placeholder="Ej: Calle Serrano 45, Madrid"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">Superficie (m² constr.)</label>
                <input
                  type="number"
                  min="20"
                  max="1000"
                  value={builtM2}
                  onChange={(e) => setBuiltM2(Number(e.target.value))}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Año Construcción</label>
                <input
                  type="number"
                  min="1900"
                  max="2026"
                  value={constructionYear}
                  onChange={(e) => setConstructionYear(Number(e.target.value))}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">Estado Conservación</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as PropertyCondition)}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="a_reformar">A Reformar (-15%)</option>
                  <option value="buen_estado">Buen Estado (Base)</option>
                  <option value="reformado">Reformado (+12%)</option>
                  <option value="a_estrenar">A Estrenar (+20%)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Ascensor</label>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHasElevator(true)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      hasElevator ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40" : "bg-slate-950 text-slate-400 border-slate-800"
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasElevator(false)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      !hasElevator ? "bg-rose-600/20 text-rose-400 border-rose-500/40" : "bg-slate-950 text-slate-400 border-slate-800"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Referencia Catastral</label>
              <input
                type="text"
                value={cadastralRef}
                onChange={(e) => setCadastralRef(e.target.value)}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-400 transition-colors"
                placeholder="20 caracteres alfanuméricos"
              />
            </div>
          </div>

          {/* Accesos a Exploración 3D y Catastro */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Enlaces de Entorno</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href={deepLinks.googleEarth3D}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-950 hover:bg-slate-800 text-blue-400 rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Google Earth 3D
              </a>
              <a
                href={deepLinks.catastroVisor}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Sede Catastro
              </a>
            </div>
          </div>
        </div>

        {/* RESULTADOS DE VALORACIÓN (7 columnas) */}
        <div className="lg:col-span-7 space-y-5">
          {valuationResult && (
            <>
              {/* Tarjetas de las 3 Bandas de Precio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 1. Precio de Captación Rápida */}
                <div className="p-4 bg-slate-900 border border-blue-500/20 rounded-2xl space-y-1">
                  <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                    Venta Rápida (&lt;30d)
                  </span>
                  <div className="text-lg font-bold text-white">
                    {Math.round(valuationResult.estimatedClosingPrice * 0.95).toLocaleString("es-ES")} €
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {Math.round((valuationResult.estimatedClosingPrice * 0.95) / builtM2).toLocaleString("es-ES")} €/m²
                  </div>
                </div>

                {/* 2. Precio de Salida en Portales */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1 relative">
                  <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Precio Salida Portales
                  </span>
                  <div className="text-xl font-extrabold text-amber-300">
                    {Math.round(valuationResult.recommendedListingPrice).toLocaleString("es-ES")} €
                  </div>
                  <div className="text-[10px] text-amber-400/80 font-medium">
                    {Math.round(valuationResult.recommendedListingPrice / builtM2).toLocaleString("es-ES")} €/m² (Recomendado)
                  </div>
                </div>

                {/* 3. Precio Objetivo Notaría */}
                <div className="p-4 bg-slate-900 border border-emerald-500/20 rounded-2xl space-y-1">
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                    Cierre Notaría Estimado
                  </span>
                  <div className="text-lg font-bold text-white">
                    {Math.round(valuationResult.estimatedClosingPrice).toLocaleString("es-ES")} €
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Margen neg.: -{valuationResult.negotiationMarginPct}%
                  </div>
                </div>
              </div>

              {/* Radiografía de Micro-Zona y Dotaciones */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Dotaciones y Servicios a Pie (Isócrona 5-10 min)
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    WalkScore: {valuationResult.neighborhoodProfile.walkScore} / 100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <div className="text-[10px] text-slate-500">Metro / Cercanías</div>
                    <div className="font-semibold text-slate-200 mt-0.5 truncate">
                      {valuationResult.neighborhoodProfile.amenities.transit.name}
                    </div>
                    <div className="text-[10px] text-blue-400">{valuationResult.neighborhoodProfile.amenities.transit.walkTimeMinutes} min a pie</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <div className="text-[10px] text-slate-500">Colegio</div>
                    <div className="font-semibold text-slate-200 mt-0.5 truncate">
                      {valuationResult.neighborhoodProfile.amenities.school.name}
                    </div>
                    <div className="text-[10px] text-blue-400">{valuationResult.neighborhoodProfile.amenities.school.walkTimeMinutes} min a pie</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <div className="text-[10px] text-slate-500">Centro de Salud</div>
                    <div className="font-semibold text-slate-200 mt-0.5 truncate">
                      {valuationResult.neighborhoodProfile.amenities.health.name}
                    </div>
                    <div className="text-[10px] text-blue-400">{valuationResult.neighborhoodProfile.amenities.health.walkTimeMinutes} min a pie</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <div className="text-[10px] text-slate-500">Zonas Verdes</div>
                    <div className="font-semibold text-slate-200 mt-0.5 truncate">
                      {valuationResult.neighborhoodProfile.amenities.park.name}
                    </div>
                    <div className="text-[10px] text-blue-400">{valuationResult.neighborhoodProfile.amenities.park.walkTimeMinutes} min a pie</div>
                  </div>
                </div>

                {/* Resumen Ejecutivo */}
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  {valuationResult.valuationSummary}
                </div>

                {/* Botón de Emisión de Dossier */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Emisión en Modo Borrador Seguro (Human-in-the-Loop)</span>
                  </div>

                  <button
                    onClick={() => onGenerateDossier(`Generar informe formal de valoración ACM para la vivienda de ${address} (${builtM2} m²) con precio de salida ${Math.round(valuationResult.recommendedListingPrice).toLocaleString("es-ES")} € y cierre notarial de ${Math.round(valuationResult.estimatedClosingPrice).toLocaleString("es-ES")} €.`)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/10"
                  >
                    <FileCheck className="w-4 h-4" />
                    Generar Dossier de Captación
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
