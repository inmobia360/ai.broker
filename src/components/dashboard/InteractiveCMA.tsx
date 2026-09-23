"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  ExternalLink, 
  Sparkles, 
  MapPin, 
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
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-500" />
            Tasador ACM Interactivo (Análisis Comparativo de Mercado)
          </h2>
          <p className="text-xs text-slate-500">
            Cálculo inmediato de valor de mercado en España basado en testigos, micro-zona y dotaciones
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORMULARIO DE PARÁMETROS (5 columnas) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
            Datos Físicos del Inmueble
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-600 font-semibold">Dirección / Micro-Zona</label>
              <div className="mt-1 relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:border-amber-500 transition-colors"
                  placeholder="Ej: Calle Serrano 45, Madrid"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 font-semibold">Superficie (m² constr.)</label>
                <input
                  type="number"
                  min="20"
                  max="1000"
                  value={builtM2}
                  onChange={(e) => setBuiltM2(Number(e.target.value))}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 font-semibold">Año Construcción</label>
                <input
                  type="number"
                  min="1900"
                  max="2026"
                  value={constructionYear}
                  onChange={(e) => setConstructionYear(Number(e.target.value))}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 font-semibold">Estado Conservación</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as PropertyCondition)}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="a_reformar">A Reformar (-15%)</option>
                  <option value="buen_estado">Buen Estado (Base)</option>
                  <option value="reformado">Reformado (+12%)</option>
                  <option value="a_estrenar">A Estrenar (+20%)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 font-semibold">Ascensor</label>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHasElevator(true)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      hasElevator ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasElevator(false)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      !hasElevator ? "bg-rose-50 text-rose-700 border-rose-300" : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-semibold">Referencia Catastral</label>
              <input
                type="text"
                value={cadastralRef}
                onChange={(e) => setCadastralRef(e.target.value)}
                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-amber-500 transition-colors"
                placeholder="20 caracteres alfanuméricos"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Enlaces de Entorno</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href={deepLinks.googleEarth3D}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Google Earth 3D
              </a>
              <a
                href={deepLinks.catastroVisor}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors font-semibold"
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
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                    Venta Rápida (&lt;30d)
                  </span>
                  <div className="text-lg font-extrabold text-slate-900">
                    {Math.round(valuationResult.estimatedClosingPrice * 0.95).toLocaleString("es-ES")} €
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {Math.round((valuationResult.estimatedClosingPrice * 0.95) / builtM2).toLocaleString("es-ES")} €/m²
                  </div>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1 shadow-xs">
                  <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Precio Salida Portales
                  </span>
                  <div className="text-xl font-extrabold text-amber-900">
                    {Math.round(valuationResult.recommendedListingPrice).toLocaleString("es-ES")} €
                  </div>
                  <div className="text-[10px] text-amber-700 font-medium">
                    {Math.round(valuationResult.recommendedListingPrice / builtM2).toLocaleString("es-ES")} €/m² (Recomendado)
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                    Cierre Notaría Estimado
                  </span>
                  <div className="text-lg font-extrabold text-slate-900">
                    {Math.round(valuationResult.estimatedClosingPrice).toLocaleString("es-ES")} €
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Margen neg.: -{valuationResult.negotiationMarginPct}%
                  </div>
                </div>
              </div>

              {/* Radiografía de Micro-Zona */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Dotaciones y Servicios a Pie (Isócrona 5-10 min)
                  </h4>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    WalkScore: {valuationResult.neighborhoodProfile.walkScore} / 100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium">Metro / Cercanías</div>
                    <div className="font-bold text-slate-800 mt-0.5 truncate">
                      {valuationResult.neighborhoodProfile.amenities.transit.name}
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold">{valuationResult.neighborhoodProfile.amenities.transit.walkTimeMinutes} min a pie</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium">Colegio</div>
                    <div className="font-bold text-slate-800 mt-0.5 truncate">
                      {valuationResult.neighborhoodProfile.amenities.school.name}
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold">{valuationResult.neighborhoodProfile.amenities.school.walkTimeMinutes} min a pie</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium">Centro de Salud</div>
                    <div className="font-bold text-slate-800 mt-0.5 truncate">
                      {valuationResult.neighborhoodProfile.amenities.health.name}
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold">{valuationResult.neighborhoodProfile.amenities.health.walkTimeMinutes} min a pie</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium">Zonas Verdes</div>
                    <div className="font-bold text-slate-800 mt-0.5 truncate">
                      {valuationResult.neighborhoodProfile.amenities.park.name}
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold">{valuationResult.neighborhoodProfile.amenities.park.walkTimeMinutes} min a pie</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  {valuationResult.valuationSummary}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Modo Borrador Seguro (Human-in-the-Loop)</span>
                  </div>

                  <button
                    onClick={() => onGenerateDossier(`Generar informe formal de valoración ACM para la vivienda de ${address} (${builtM2} m²) con precio de salida ${Math.round(valuationResult.recommendedListingPrice).toLocaleString("es-ES")} € y cierre notarial de ${Math.round(valuationResult.estimatedClosingPrice).toLocaleString("es-ES")} €.`)}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
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
