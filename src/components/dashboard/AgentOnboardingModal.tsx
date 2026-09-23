'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  FileText, 
  Award, 
  X, 
  Loader2, 
  ArrowRight,
  Palette
} from 'lucide-react';
import { WhiteLabelConfig } from '@/lib/branding/whiteLabel';
import { BrandLogo } from '@/components/brand/BrandLogo';

interface AgentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: WhiteLabelConfig;
  onSave: (updated: WhiteLabelConfig) => Promise<void>;
}

export const AgentOnboardingModal: React.FC<AgentOnboardingModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSaving, setIsSaving] = useState(false);

  const [agencyName, setAgencyName] = useState(currentConfig.agencyName || 'Inmobia 360');
  const [brandSlogan, setBrandSlogan] = useState(currentConfig.brandSlogan || 'Servicios Inmobiliarios de Excelencia');
  const [contactPhone, setContactPhone] = useState(currentConfig.contactPhone || '+34 600 000 000');
  const [contactEmail, setContactEmail] = useState(currentConfig.contactEmail || 'contacto@tu-agencia.com');
  const [apiNumber, setApiNumber] = useState(currentConfig.apiNumber || 'API-COL-45892');
  const [fiscalId, setFiscalId] = useState(currentConfig.fiscalId || 'B-12345678');
  const [address, setAddress] = useState(currentConfig.address || 'Calle Mayor 12, Madrid');
  const [primaryColor, setPrimaryColor] = useState(currentConfig.primaryColor || '#1D63FF');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated: WhiteLabelConfig = {
      ...currentConfig,
      agencyName,
      brandSlogan,
      contactPhone,
      contactEmail,
      apiNumber,
      fiscalId,
      address,
      primaryColor
    };

    try {
      await onSave(updated);
      onClose();
    } catch (err) {
      console.error('Error al guardar configuración:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera con Pasos */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Configuración y Onboarding de Agencia
              </h3>
              <p className="text-xs text-slate-400">
                Paso {step} de 3 — Personaliza tu marca blanca y canales comerciales
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicador de Pasos */}
        <div className="grid grid-cols-3 gap-1 px-6 pt-4">
          <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-orange-500' : 'bg-slate-200'}`}></div>
          <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-orange-500' : 'bg-slate-200'}`}></div>
          <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? 'bg-orange-500' : 'bg-slate-200'}`}></div>
        </div>

        {/* Contenido del Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* PASO 1: Identidad Corporativa */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-orange-500" />
                  Identidad Comercial y Marca
                </h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Comercial de la Agencia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Inmobiliaria Chamberí Exclusiva"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lema o Eslogan Corporativo</label>
                <input
                  type="text"
                  placeholder="Ej: Asesoramiento patrimonial de alta gama en Madrid"
                  value={brandSlogan}
                  onChange={(e) => setBrandSlogan(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dirección de la Oficina</label>
                <input
                  type="text"
                  placeholder="Ej: Calle Serrano 45, Planta 2ª, 28001 Madrid"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:outline-none transition"
                />
              </div>
            </div>
          )}

          {/* PASO 2: Contacto Directo & WhatsApp de Captación */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Canales de Contacto Directo y WhatsApp
                </h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono y WhatsApp Directo (para recibir leads) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+34 600 000 000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:outline-none transition"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Los clientes que pulsen "WhatsApp" en las landings públicas escribirán a este número.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico de Atención al Cliente *</label>
                <input
                  type="email"
                  required
                  placeholder="info@tu-agencia.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:outline-none transition"
                />
              </div>
            </div>
          )}

          {/* PASO 3: Acreditación Profesional & Colegiación */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  Acreditación Profesional & Registro Inmobiliario
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nº Colegiación API / RAICV / AICAT</label>
                  <input
                    type="text"
                    placeholder="API-COL-45892"
                    value={apiNumber}
                    onChange={(e) => setApiNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:outline-none transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CIF / NIF Fiscal</label>
                  <input
                    type="text"
                    placeholder="B-88776655"
                    value={fiscalId}
                    onChange={(e) => setFiscalId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              {/* Vista Previa de la Tarjeta del Agente */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Previsualización de Tarjeta Pública en Fichas Web:
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {agencyName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">{agencyName}</div>
                    <div className="text-[10px] text-slate-500 truncate">{apiNumber ? `Colegiado: ${apiNumber}` : 'Agencia Inmobiliaria'}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      WhatsApp: {contactPhone}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Navegación del Asistente */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Anterior
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando Perfil...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Activar Perfil de Agencia</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
