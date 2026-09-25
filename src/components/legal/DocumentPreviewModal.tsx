'use client';

import React, { useState } from 'react';
import { X, Printer, Download, PenTool, CheckCircle, ShieldCheck, Building } from 'lucide-react';
import { SignaturePadModal } from './SignaturePadModal';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  documentType: 'visita' | 'arras' | 'lph' | 'llaves';
  content: string;
  agencyName?: string;
  associationNumber?: string;
  taxId?: string;
  clientName?: string;
  clientDni?: string;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  title,
  documentType,
  content,
  agencyName = "Inmobia 360 Real Estate Tech",
  associationNumber = "API-COL-45892",
  taxId = "B-88392104",
  clientName = "Cliente",
  clientDni = ""
}: DocumentPreviewModalProps) {
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
          {/* Barra de Herramientas Superior */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">{title}</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {agencyName} · {associationNumber ? `Colegiado: ${associationNumber}` : 'Documento Oficial'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSignatureModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition flex items-center gap-1.5 shadow-xs"
              >
                <PenTool className="w-3.5 h-3.5" />
                {signatureDataUrl ? 'Cambiar Firma' : 'Firmar en Pantalla'}
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-xs shadow-blue-500/20"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir / PDF
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hoja de Documento con Membrete Oficial (Imprimible) */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100/60 print:bg-white print:p-0 print:overflow-visible">
            <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-12 print:border-none print:shadow-none print:p-0 space-y-6">
              {/* Membrete de la Agencia */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">{agencyName}</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Servicios Profesionales de Intermediación Inmobiliaria
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    NIF/CIF: {taxId} | Nº Colegiado: {associationNumber}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Documento Válido en Derecho
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Fecha: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Título Principal */}
              <div className="text-center py-2">
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  {title}
                </h2>
              </div>

              {/* Cuerpo del Documento Legal */}
              <div className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed space-y-4">
                {content}
              </div>

              {/* Bloque de Firmas */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8">
                {/* Firma Agencia */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-900 uppercase">Por la Agencia Intermediaria:</div>
                  <div className="h-24 border border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center p-2 text-center">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Firma y Sello Oficial
                      <br />
                      {agencyName}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">Agente Colegiado / Director</div>
                </div>

                {/* Firma Cliente */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-900 uppercase">Por la Parte Interesada / Comprador:</div>
                  <div className="h-24 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-center p-2 relative overflow-hidden">
                    {signatureDataUrl ? (
                      <img
                        src={signatureDataUrl}
                        alt="Firma Digitalizada"
                        className="h-full object-contain"
                      />
                    ) : (
                      <button
                        onClick={() => setSignatureModalOpen(true)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        Pulsar para firmar aquí
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {clientName} {clientDni ? `· DNI: ${clientDni}` : ''}
                  </div>
                </div>
              </div>

              {/* Pie de Página de Seguridad */}
              <div className="pt-6 border-t border-slate-100 text-[10px] text-slate-400 text-center flex items-center justify-between">
                <span>Inmobia 360 Legal Protection System · Conforme a Ley 12/2023 por el Derecho a la Vivienda</span>
                <span>Página 1 de 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Firma Pad */}
      <SignaturePadModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onSaveSignature={(dataUrl) => setSignatureDataUrl(dataUrl)}
        signerName={clientName}
        signerDni={clientDni}
      />
    </>
  );
}
