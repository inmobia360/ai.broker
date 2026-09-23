"use client";

import React, { useState } from "react";
import { 
  Building2, 
  KeyRound, 
  Gauge, 
  FileCheck, 
  Sparkles, 
  Download, 
  AlertTriangle,
  Send,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { generateLPHDebtCertificateRequest } from "@/lib/legal/spain/communityLPH";
import { generateKeyHandoverAct } from "@/lib/legal/spain/handoverPostventa";
import type { ActionProposal } from "@/components/DraftApprovalModal";

interface LegalPostventaModuleProps {
  onRequestApproval: (proposal: ActionProposal) => void;
}

export const LegalPostventaModule: React.FC<LegalPostventaModuleProps> = ({ onRequestApproval }) => {
  const [activeSubTab, setActiveSubTab] = useState<"lph" | "keys" | "utilities">("lph");

  // Estados Formulario LPH
  const [lphAddress, setLphAddress] = useState("Calle Serrano 45, 28001 Madrid");
  const [lphCoefficient, setLphCoefficient] = useState(2.45);
  const [lphOrdinaryFee, setLphOrdinaryFee] = useState(135);
  const [lphAdminName, setLphAdminName] = useState("Don Juan Carlos Arriaga");
  const [lphAdminCollege, setLphAdminCollege] = useState("CAF Madrid Col. 3489");
  const [lphAdminEmail, setLphAdminEmail] = useState("administracion@arriagafincas.es");
  const [lphOwnerName, setLphOwnerName] = useState("Doña Carmen Gómez Alarcón");
  const [lphOwnerDni, setLphOwnerDni] = useState("52987654M");

  // Estados Formulario Llaves
  const [keyAddress, setKeyAddress] = useState("Calle Serrano 45, 28001 Madrid");
  const [keySellerName, setKeySellerName] = useState("Doña Carmen Gómez Alarcón");
  const [keySellerDni, setKeySellerDni] = useState("52987654M");
  const [keyBuyerName, setKeyBuyerName] = useState("Don Carlos Romero");
  const [keyBuyerDni, setKeyBuyerDni] = useState("09876543T");
  const [keyMainSets, setKeyMainSets] = useState(3);
  const [keyPortalSets, setKeyPortalSets] = useState(2);
  const [keyMailbox, setKeyMailbox] = useState(2);
  const [keyStorage, setKeyStorage] = useState(1);
  const [keyGarageRemotes, setKeyGarageRemotes] = useState(2);

  // Estados Suministros
  const [cupsElectricidad, setCupsElectricidad] = useState("ES0021000001234567AB");
  const [readingElectricidad, setReadingElectricidad] = useState(4852);
  const [companyElectricidad, setCompanyElectricidad] = useState("Iberdrola Clientes");
  const [meterAgua, setMeterAgua] = useState("CYII-998822");
  const [readingAgua, setReadingAgua] = useState(148);
  const [companyAgua, setCompanyAgua] = useState("Canal de Isabel II");
  const [meterGas, setMeterGas] = useState("GAS-774411");
  const [readingGas, setReadingGas] = useState(932);

  // Generar Solicitud LPH
  const handleGenerateLPH = () => {
    const result = generateLPHDebtCertificateRequest({
      details: {
        propertyAddress: lphAddress,
        cadastralCoefficient: lphCoefficient,
        monthlyOrdinaryFee: lphOrdinaryFee,
        administrator: {
          name: lphAdminName,
          collegeNumber: lphAdminCollege,
          email: lphAdminEmail
        },
        ownerName: lphOwnerName,
        ownerDni: lphOwnerDni,
        pendingDerramas: [
          {
            concept: "Rehabilitación de zaguán y bajantes generales",
            totalAmount: 480,
            monthlyFee: 40,
            remainingMonths: 12
          }
        ]
      }
    });

    const proposal: ActionProposal = {
      id: `prop-lph-${Date.now()}`,
      title: "Solicitud de Certificado Deuda Cero LPH (Art. 9.1.e)",
      description: "Requerimiento formal al Administrador de Fincas con plazo de expedición preceptivo de 7 días naturales.",
      actionType: "contract_arras",
      status: "pending",
      rawContent: result.documentText,
      fileName: `Solicitud_LPH_Art9_1_e_${lphOwnerName.replace(/\s+/g, "_")}.pdf`
    };

    onRequestApproval(proposal);
  };

  // Generar Acta de Entrega de Llaves y Contadores
  const handleGenerateHandover = () => {
    const result = generateKeyHandoverAct({
      propertyAddress: keyAddress,
      transferType: "compraventa",
      transferor: {
        fullName: keySellerName,
        dniNie: keySellerDni,
        phone: "+34600112233",
        email: "vendedor@ejemplo.com"
      },
      acquirer: {
        fullName: keyBuyerName,
        dniNie: keyBuyerDni,
        phone: "+34600445566",
        email: "comprador@ejemplo.com"
      },
      agencyName: "Inmobia 360",
      keys: {
        mainDoorSets: keyMainSets,
        portalSets: keyPortalSets,
        mailboxKeys: keyMailbox,
        storageRoomKeys: keyStorage,
        garageRemotes: keyGarageRemotes
      },
      utilities: {
        electricity: {
          serviceType: "electricidad",
          companyName: companyElectricidad,
          cups: cupsElectricidad,
          readingValue: readingElectricidad,
          unit: "kWh"
        },
        water: {
          serviceType: "agua",
          companyName: companyAgua,
          meterNumber: meterAgua,
          readingValue: readingAgua,
          unit: "m³"
        },
        gas: {
          serviceType: "gas",
          companyName: "Naturgy",
          meterNumber: meterGas,
          readingValue: readingGas,
          unit: "m³"
        }
      }
    });

    const proposal: ActionProposal = {
      id: `prop-handover-${Date.now()}`,
      title: "Acta de Entrega de Llaves, Posesión y Lectura de Contadores",
      description: "Documento acreditativo de posesión física conforme al Art. 1462 C.C. con lecturas de luz (CUPS), agua y gas.",
      actionType: "visit_sheet",
      status: "pending",
      rawContent: result.actText + "\n\n" + result.utilityTransferAuthorizationText,
      fileName: `Acta_Entrega_Llaves_y_Suministros_${keyBuyerName.replace(/\s+/g, "_")}.pdf`
    };

    onRequestApproval(proposal);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-400" />
            Módulo Jurídico LPH y Postventa Física
          </h2>
          <p className="text-xs text-slate-400">
            Formalización de certificados comunitarios Art. 9.1.e LPH, entrega material de llaves y traspaso de suministros
          </p>
        </div>

        {/* Pestañas Secundarias */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveSubTab("lph")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === "lph" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Comunidad LPH & Finca Madre
          </button>
          <button
            onClick={() => setActiveSubTab("keys")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === "keys" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Acta de Entrega de Llaves
          </button>
          <button
            onClick={() => setActiveSubTab("utilities")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === "utilities" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            Lectura de Contadores (CUPS)
          </button>
        </div>
      </div>

      {/* SUBTAB 1: COMUNIDAD LPH */}
      {activeSubTab === "lph" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Requerimiento de Certificado de Deuda Cero (Art. 9.1.e LPH)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exigible por el Notario con plazo imperativo de emisión de 7 días naturales por la administración
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              Ley 49/1960 de Propiedad Horizontal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                Datos de la Propiedad y Titular
              </h4>
              <div>
                <label className="text-slate-400 font-medium">Dirección Inmueble</label>
                <input
                  type="text"
                  value={lphAddress}
                  onChange={(e) => setLphAddress(e.target.value)}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Cuota Finca Madre (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={lphCoefficient}
                    onChange={(e) => setLphCoefficient(Number(e.target.value))}
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Cuota Ordinaria (€/mes)</label>
                  <input
                    type="number"
                    value={lphOrdinaryFee}
                    onChange={(e) => setLphOrdinaryFee(Number(e.target.value))}
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Nombre Propietario</label>
                  <input
                    type="text"
                    value={lphOwnerName}
                    onChange={(e) => setLphOwnerName(e.target.value)}
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">DNI/NIE Propietario</label>
                  <input
                    type="text"
                    value={lphOwnerDni}
                    onChange={(e) => setLphOwnerDni(e.target.value)}
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                Administrador de Fincas Colegiado
              </h4>
              <div>
                <label className="text-slate-400 font-medium">Nombre del Administrador / Despacho</label>
                <input
                  type="text"
                  value={lphAdminName}
                  onChange={(e) => setLphAdminName(e.target.value)}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium">Colegiación Oficial</label>
                <input
                  type="text"
                  value={lphAdminCollege}
                  onChange={(e) => setLphAdminCollege(e.target.value)}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium">Correo Electrónico de Notificación</label>
                <input
                  type="email"
                  value={lphAdminEmail}
                  onChange={(e) => setLphAdminEmail(e.target.value)}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Se emitirá en Modo Borrador Seguro para revisión humana previa</span>
            </div>
            <button
              onClick={handleGenerateLPH}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <FileCheck className="w-4 h-4" />
              Generar Requerimiento Formal LPH
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 2 & 3: ENTREGA DE LLAVES Y LECTURA DE CONTADORES */}
      {(activeSubTab === "keys" || activeSubTab === "utilities") && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Acta de Transmisión de Posesión y Lectura de Contadores
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Art. 1462 Código Civil: constancia fehaciente de entrega física y códigos de suministro (CUPS)
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Cierre Notarial / Entrega de Posesión
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Inventario de Llaves */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                Inventario de Llaves y Mandos
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400">Juegos Puerta Blindada</label>
                  <input
                    type="number"
                    value={keyMainSets}
                    onChange={(e) => setKeyMainSets(Number(e.target.value))}
                    className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Juegos Portal Edificio</label>
                  <input
                    type="number"
                    value={keyPortalSets}
                    onChange={(e) => setKeyPortalSets(Number(e.target.value))}
                    className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Llaves Buzón</label>
                  <input
                    type="number"
                    value={keyMailbox}
                    onChange={(e) => setKeyMailbox(Number(e.target.value))}
                    className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Mandos Garaje / Parking</label>
                  <input
                    type="number"
                    value={keyGarageRemotes}
                    onChange={(e) => setKeyGarageRemotes(Number(e.target.value))}
                    className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Lectura de Contadores */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-blue-400" />
                Lectura Numérica de Contadores
              </h4>
              <div className="space-y-2.5">
                <div>
                  <label className="text-slate-400">Electricidad (Código CUPS)</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <input
                      type="text"
                      value={cupsElectricidad}
                      onChange={(e) => setCupsElectricidad(e.target.value)}
                      className="col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px]"
                    />
                    <input
                      type="number"
                      value={readingElectricidad}
                      onChange={(e) => setReadingElectricidad(Number(e.target.value))}
                      placeholder="kWh"
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400">Agua (N.º Contador / m³)</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <input
                      type="text"
                      value={meterAgua}
                      onChange={(e) => setMeterAgua(e.target.value)}
                      className="col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px]"
                    />
                    <input
                      type="number"
                      value={readingAgua}
                      onChange={(e) => setReadingAgua(Number(e.target.value))}
                      placeholder="m³"
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-right"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Incluye minuta de autorización de cambio de titular sin corte de servicio</span>
            </div>
            <button
              onClick={handleGenerateHandover}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <FileCheck className="w-4 h-4" />
              Generar Acta de Llaves y Traspaso
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
