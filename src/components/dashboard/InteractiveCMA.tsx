"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  ExternalLink, 
  Sparkles, 
  MapPin, 
  FileCheck,
  ShieldCheck,
  Scale,
  Building,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Loader2
} from "lucide-react";
import { CmaValuator } from "@/lib/valuation/cmaValuator";
import type { PropertyCondition, CmaValuationOutput } from "@/lib/valuation/cmaValuator";
import { DeepLinkGenerator } from "@/lib/geo/deepLinkGenerator";

export interface InteractiveCMAProps {
  initialAddress?: string;
  initialM2?: number;
  initialPrice?: number;
  onGenerateDossier: (summary: string) => void;
  onOpenOfficialDossier?: (valuation: CmaValuationOutput) => void;
  agencyName?: string;
  apiNumber?: string;
  fiscalId?: string;
}

export const InteractiveCMA: React.FC<InteractiveCMAProps> = ({ 
  initialAddress = "Calle Serrano 45, Barrio de Salamanca, Madrid",
  initialM2 = 120,
  initialPrice,
  onGenerateDossier,
  onOpenOfficialDossier,
  agencyName = "Inmobia 360",
  apiNumber = "RAICV-0000",
  fiscalId = "B-88776655"
}) => {
  const [address, setAddress] = useState(initialAddress);
  const [builtM2, setBuiltM2] = useState<number>(initialM2);
  const [condition, setCondition] = useState<PropertyCondition>("buen_estado");
  const [hasElevator, setHasElevator] = useState(true);
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [constructionYear, setConstructionYear] = useState(1985);
  const [cadastralRef, setCadastralRef] = useState("5432101VK4753B0001TR");
  const [clientTargetPrice, setClientTargetPrice] = useState<number | undefined>(initialPrice);

  const [valuationResult, setValuationResult] = useState<CmaValuationOutput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsCalculating(true);

    CmaValuator.calculateValuation("inmobia360", {
      address,
      builtM2: Number(builtM2) || 80,
      condition,
      hasElevator,
      bedrooms,
      bathrooms,
      constructionYear,
      cadastralReference: cadastralRef,
      clientTargetPrice
    }, {
      agencyName,
      associationNumber: apiNumber,
      fiscalId
    })
    .then(res => {
      if (isMounted) {
        setValuationResult(res);
        setIsCalculating(false);
      }
    })
    .catch(err => {
      console.error("Error calculando ACM:", err);
      if (isMounted) setIsCalculating(false);
    });

    return () => {
      isMounted = false;
    };
  }, [address, builtM2, condition, hasElevator, bedrooms, bathrooms, constructionYear, cadastralRef, clientTargetPrice, agencyName, apiNumber, fiscalId]);

  const fallbackDeepLinks = DeepLinkGenerator.generateLinks({
    lat: 40.4285,
    lon: -3.6875,
    cadastralReference: cadastralRef
  });

  const activeLinks = valuationResult?.deepLinks || fallbackDeepLinks;

  // Extracción segura de dotaciones por categoría
  const amenitiesList = valuationResult?.neighborhoodProfile?.amenities || [];
  const transitItem = amenitiesList.find(a => a.category === "transporte");
  const schoolItem = amenitiesList.find(a => a.category === "educacion");
  const healthItem = amenitiesList.find(a => a.category === "salud");
  const parkItem = amenitiesList.find(a => a.category === "zonas_verdes");

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
            Cálculo inmediato de valor venal de mercado en España basado en testigos homologados, micro-zona y Catastro 3D
          </p>
        </div>
        {valuationResult && (
          <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-1.5 rounded-xl font-semibold">
            <span>Zona de Mercado:</span>
            <strong className="text-slate-900">{valuationResult.zone}</strong>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORMULARIO DE PARÁMETROS (5 columnas) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Datos Físicos del Inmueble</span>
            {isCalculating && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-600 font-semibold">Dirección Postal o Barrio</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-medium outline-none focus:border-amber-500 transition-colors"
                  placeholder="Ej: Calle Serrano 45, Barrio de Salamanca, Madrid"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 font-semibold">Superficie Const. (m²)</label>
                <input
                  type="number"
                  min="20"
                  max="1500"
                  value={builtM2}
                  onChange={(e) => setBuiltM2(Number(e.target.value))}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 font-semibold">Año Construcción</label>
                <input
                  type="number"
                  min="1850"
                  max="2026"
                  value={constructionYear}
                  onChange={(e) => setConstructionYear(Number(e.target.value))}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 font-semibold">Dormitorios</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none focus:border-amber-500 transition-colors"
                >
                  <option value={1}>1 Dormitorio</option>
                  <option value={2}>2 Dormitorios</option>
                  <option value={3}>3 Dormitorios</option>
                  <option value={4}>4 Dormitorios</option>
                  <option value={5}>5+ Dormitorios</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-semibold">Baños</label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none focus:border-amber-500 transition-colors"
                >
                  <option value={1}>1 Baño</option>
                  <option value={2}>2 Baños</option>
                  <option value={3}>3 Baños</option>
                  <option value={4}>4+ Baños</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-semibold">Estado de Conservación</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as PropertyCondition)}
                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none focus:border-amber-500 transition-colors"
              >
                <option value="a_reformar">A reformar (-15% sobre media)</option>
                <option value="buen_estado">Buen estado (Base de mercado)</option>
                <option value="reformado">Reformado con calidades (+10%)</option>
                <option value="a_estrenar">A estrenar / Obra nueva (+18%)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-semibold">Ascensor en la Finca</label>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setHasElevator(true)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    hasElevator ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}
                >
                  Sí (+5%)
                </button>
                <button
                  type="button"
                  onClick={() => setHasElevator(false)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    !hasElevator ? "bg-rose-50 text-rose-700 border-rose-300" : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}
                >
                  No (-8%)
                </button>
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

            <div>
              <label className="text-xs text-slate-600 font-semibold flex items-center justify-between">
                <span>Pretensión del Propietario (Opcional)</span>
                <span className="text-[10px] text-slate-400">Para análisis de desviación</span>
              </label>
              <input
                type="number"
                value={clientTargetPrice || ""}
                onChange={(e) => setClientTargetPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none focus:border-amber-500 transition-colors"
                placeholder="Ej: 520000"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Visor Catastral y Entorno 3D</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href={activeLinks.googleEarth3D}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Google Earth 3D
              </a>
              <a
                href={activeLinks.catastroVisor}
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
          {valuationResult ? (
            <>
              {/* Tarjetas de las 3 Bandas de Precio (ZOPA) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-blue-500" />
                    Venta Rápida (&lt;30d)
                  </span>
                  <div className="text-lg font-extrabold text-slate-900">
                    {valuationResult.fastSalePrice.toLocaleString("es-ES")} €
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {Math.round(valuationResult.fastSalePrice / builtM2).toLocaleString("es-ES")} €/m² (-5%)
                  </div>
                </div>

                <div className="p-4 bg-white border border-purple-200 bg-purple-50/30 rounded-2xl space-y-1 shadow-xs">
                  <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Scale className="w-3 h-3 text-purple-600" />
                    Cierre Notaría Estimado
                  </span>
                  <div className="text-xl font-black text-slate-900">
                    {valuationResult.estimatedClosingPrice.toLocaleString("es-ES")} €
                  </div>
                  <div className="text-[10px] text-purple-700 font-semibold">
                    {valuationResult.estimatedPricePerM2.toLocaleString("es-ES")} €/m² (Valor Central)
                  </div>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1 shadow-xs">
                  <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-600" />
                    Salida Recomendada Portales
                  </span>
                  <div className="text-lg font-extrabold text-amber-900">
                    {valuationResult.recommendedListingPrice.toLocaleString("es-ES")} €
                  </div>
                  <div className="text-[10px] text-amber-700 font-medium">
                    {Math.round(valuationResult.recommendedListingPrice / builtM2).toLocaleString("es-ES")} €/m² (+{valuationResult.negotiationMarginPct}%)
                  </div>
                </div>
              </div>

              {/* Barra Visual de Negociación ZOPA */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-purple-600" />
                    Banda de Negociación ZOPA (Zone of Possible Agreement)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Margen de maniobra aconsejado: <strong>{valuationResult.negotiationMarginPct}%</strong>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 relative overflow-hidden flex">
                  <div className="bg-blue-400 h-full w-[25%]" title="Rango de Liquidación Rápida"></div>
                  <div className="bg-purple-500 h-full w-[50%]" title="Rango Central Notarial"></div>
                  <div className="bg-amber-400 h-full w-[25%]" title="Rango de Salida en Portales"></div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Mínimo: {valuationResult.fastSalePrice.toLocaleString("es-ES")} €</span>
                  <span className="font-bold text-purple-700">Objetivo: {valuationResult.estimatedClosingPrice.toLocaleString("es-ES")} €</span>
                  <span>Máximo: {valuationResult.recommendedListingPrice.toLocaleString("es-ES")} €</span>
                </div>
                {valuationResult.clientPriceVariancePct !== null && (
                  <div className={`mt-2 p-2.5 rounded-xl text-xs flex items-center justify-between ${
                    valuationResult.clientPriceVariancePct > 10 
                      ? "bg-rose-50 text-rose-800 border border-rose-200" 
                      : valuationResult.clientPriceVariancePct > 0 
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}>
                    <span>Pretensión del Propietario: <strong>{clientTargetPrice?.toLocaleString("es-ES")} €</strong></span>
                    <strong className="font-mono">
                      {valuationResult.clientPriceVariancePct > 0 ? `+${valuationResult.clientPriceVariancePct}%` : `${valuationResult.clientPriceVariancePct}%`} vs Mercado
                    </strong>
                  </div>
                )}
              </div>

              {/* Testigos Comparables Homologados en la Zona */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    Testigos Comparables Homologados en la Micro-Zona
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {valuationResult.witnesses.length} testigos auditados
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {valuationResult.witnesses.map((witness) => (
                    <div 
                      key={witness.id}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs hover:border-blue-300 transition-colors"
                    >
                      <div className="text-[10px] text-blue-600 font-semibold truncate" title={witness.address}>
                        {witness.address}
                      </div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {witness.price.toLocaleString("es-ES")} €
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>{witness.builtM2} m²</span>
                        <strong className="text-emerald-700">{witness.pricePerM2.toLocaleString("es-ES")} €/m²</strong>
                      </div>
                      <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-400">
                        <span>A {witness.distanceMeters} m</span>
                        <span className="capitalize">{witness.condition.replace("_", " ")}</span>
                      </div>
                    </div>
                  ))}
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
                      {transitItem ? transitItem.name : "Metro cercano"}
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold">
                      {transitItem ? `${transitItem.walkMinutes} min a pie` : "3-5 min a pie"}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium">Colegio</div>
                    <div className="font-bold text-slate-800 mt-0.5 truncate">
                      {schoolItem ? schoolItem.name : "Colegio de zona"}
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold">
                      {schoolItem ? `${schoolItem.walkMinutes} min a pie` : "5 min a pie"}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium">Centro de Salud</div>
                    <div className="font-bold text-slate-800 mt-0.5 truncate">
                      {healthItem ? healthItem.name : "Centro de Salud"}
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold">
                      {healthItem ? `${healthItem.walkMinutes} min a pie` : "6 min a pie"}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium">Zonas Verdes</div>
                    <div className="font-bold text-slate-800 mt-0.5 truncate">
                      {parkItem ? parkItem.name : "Parque de proximidad"}
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold">
                      {parkItem ? `${parkItem.walkMinutes} min a pie` : "4 min a pie"}
                    </div>
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
                    onClick={() => {
                      if (onOpenOfficialDossier && valuationResult) {
                        onOpenOfficialDossier(valuationResult);
                      } else {
                        onGenerateDossier(
                          `Generar informe formal de valoración ACM para la vivienda de ${address} (${builtM2} m²) con precio de salida ${Math.round(valuationResult.recommendedListingPrice).toLocaleString("es-ES")} € y cierre notarial de ${Math.round(valuationResult.estimatedClosingPrice).toLocaleString("es-ES")} €.`
                        );
                      }
                    }}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Generar y abrir Dossier oficial maquetado para la visita de captación"
                  >
                    <FileCheck className="w-4 h-4" />
                    Generar Dossier de Captación Oficial
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <p className="text-xs font-medium">Calculando valoración y consultando micro-zona...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
