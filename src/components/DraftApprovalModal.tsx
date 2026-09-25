"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  MessageSquare, 
  FileDown, 
  Mail, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";

export interface ActionProposal {
  id: string;
  title: string;
  description: string;
  actionType: string;
  status: "pending" | "approved" | "rejected";
  downloadUrl?: string;
  fileName?: string;
  rawContent?: string;
  recipientPhone?: string;
  recipientEmail?: string;
}

interface DraftApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ActionProposal | null;
  onConfirmApproval: (channel: "whatsapp" | "email" | "pdf") => Promise<void>;
  onPreviewOfficialDocument?: () => void;
  isLoading?: boolean;
}

export function DraftApprovalModal({
  isOpen,
  onClose,
  proposal,
  onConfirmApproval,
  onPreviewOfficialDocument,
  isLoading = false,
}: DraftApprovalModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<"whatsapp" | "email" | "pdf">("whatsapp");

  if (!isOpen || !proposal) return null;

  const handleConfirm = async () => {
    await onConfirmApproval(selectedChannel);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado del Modal */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-white">Revisión de Borrador Seguro</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                  Human-in-the-Loop
                </span>
              </div>
              <p className="text-xs text-slate-400">
                La IA no enviará ningún documento sin tu confirmación explícita previa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Ficha de la Acción */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Propuesta: {proposal.actionType}
              </span>
              <span className="text-xs font-mono text-slate-500">ID: {proposal.id}</span>
            </div>
            <h4 className="font-medium text-white text-base">{proposal.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{proposal.description}</p>
          </div>

          {/* Previsualización del Contenido Legal */}
          {proposal.rawContent && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Texto del Documento Legal a Tramitar
              </label>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl max-h-48 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {proposal.rawContent}
              </div>
            </div>
          )}

          {/* Selector de Canal de Salida */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
              Selecciona el Canal de Entrega
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Opción WhatsApp */}
              <button
                type="button"
                onClick={() => setSelectedChannel("whatsapp")}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                  selectedChannel === "whatsapp"
                    ? "bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  {selectedChannel === "whatsapp" && (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-white text-xs">WhatsApp Web</div>
                  <div className="text-[11px] text-slate-400">Mensaje directo con enlace al cliente</div>
                </div>
              </button>

              {/* Opción PDF */}
              <button
                type="button"
                onClick={() => setSelectedChannel("pdf")}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                  selectedChannel === "pdf"
                    ? "bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-950/50"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <FileDown className="w-4 h-4" />
                  </div>
                  {selectedChannel === "pdf" && (
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-white text-xs">Descargar PDF</div>
                  <div className="text-[11px] text-slate-400">Documento oficial listo para firma</div>
                </div>
              </button>

              {/* Opción Email */}
              <button
                type="button"
                onClick={() => setSelectedChannel("email")}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                  selectedChannel === "email"
                    ? "bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  {selectedChannel === "email" && (
                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-white text-xs">Correo Electrónico</div>
                  <div className="text-[11px] text-slate-400">Envío formal con archivo adjunto</div>
                </div>
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-blue-950/30 border border-blue-900/40 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-200/90 leading-relaxed">
              Al confirmar, el sistema registrará la auditoría de aprobación con tu usuario y tenant, marcando el expediente como autorizado en la caja fuerte documental.
            </p>
          </div>
        </div>

        {/* Pie del Modal con Acciones */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div>
            {onPreviewOfficialDocument && (
              <button
                type="button"
                onClick={onPreviewOfficialDocument}
                className="px-3.5 py-2 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors flex items-center gap-1.5"
              >
                Previsualizar Oficial / Firmar
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Volver a editar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-5 py-2.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Tramitando autorización...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Autorizar y Proceder
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
