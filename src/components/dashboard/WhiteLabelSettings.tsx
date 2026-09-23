"use client";

import React, { useState } from "react";
import { 
  Building2, 
  Palette, 
  Users, 
  UserPlus, 
  Trash2, 
  Save, 
  Check, 
  AlertTriangle 
} from "lucide-react";
import { 
  WhiteLabelConfig, 
  TeamMember, 
  MAX_TEAM_SEATS, 
  validateTeamCapacity, 
  formatAgencyRole 
} from "@/lib/branding/whiteLabel";

interface WhiteLabelSettingsProps {
  initialConfig: WhiteLabelConfig;
  onSaveConfig: (updated: WhiteLabelConfig) => void;
}

export const WhiteLabelSettings: React.FC<WhiteLabelSettingsProps> = ({ 
  initialConfig, 
  onSaveConfig 
}) => {
  const [config, setConfig] = useState<WhiteLabelConfig>(initialConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddMember = () => {
    const activeCount = config.team.filter(m => m.active).length;
    if (activeCount >= MAX_TEAM_SEATS) {
      setErrorMessage(`Límite alcanzado: El plan actual permite un máximo de ${MAX_TEAM_SEATS} agentes activos.`);
      return;
    }
    setErrorMessage("");
    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      name: "Nuevo Agente",
      email: "agente@miagencia.es",
      role: "agente_asociado",
      phone: "+34 600 000 000",
      active: true
    };
    setConfig(prev => ({
      ...prev,
      team: [...prev.team, newMember]
    }));
  };

  const handleRemoveMember = (id: string) => {
    setConfig(prev => ({
      ...prev,
      team: prev.team.filter(m => m.id !== id)
    }));
  };

  const handleUpdateMember = (id: string, updates: Partial<TeamMember>) => {
    setConfig(prev => ({
      ...prev,
      team: prev.team.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const handleSave = () => {
    const validation = validateTeamCapacity(config.team);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Error en la capacidad del equipo");
      return;
    }
    setErrorMessage("");
    onSaveConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const activeSeats = config.team.filter(m => m.active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Configuración de Agencia y Marca Blanca
          </h2>
          <p className="text-xs text-slate-500">
            Personaliza la identidad corporativa, datos de facturación y equipo de agentes (1 a 5 integrantes)
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          {savedSuccess ? "¡Guardado con Éxito!" : "Guardar Cambios"}
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BLOQUE 1: IDENTIDAD Y MARCA BLANCA (6 columnas) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Palette className="w-4 h-4 text-blue-600" />
            Identidad Visual de la Marca
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-600 font-semibold">Nombre Comercial de la Agencia</label>
              <input
                type="text"
                value={config.agencyName}
                onChange={(e) => setConfig({ ...config, agencyName: e.target.value })}
                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-600 font-semibold">Eslogan Corporativo</label>
              <input
                type="text"
                value={config.brandSlogan}
                onChange={(e) => setConfig({ ...config, brandSlogan: e.target.value })}
                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-semibold">Color Primario</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono text-[11px]"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-600 font-semibold">Color de Acento</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.accentColor}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-slate-600 font-semibold">NIF / CIF Fiscal</label>
                <input
                  type="text"
                  value={config.fiscalId}
                  onChange={(e) => setConfig({ ...config, fiscalId: e.target.value })}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold">Colegiación API / AICAT</label>
                <input
                  type="text"
                  value={config.apiNumber || ""}
                  onChange={(e) => setConfig({ ...config, apiNumber: e.target.value })}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-semibold">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  value={config.contactPhone}
                  onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold">Correo Electrónico</label>
                <input
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-semibold">Dirección de la Agencia</label>
              <input
                type="text"
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* BLOQUE 2: GESTIÓN DE EQUIPO (6 columnas) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Equipo de la Agencia
              </h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                activeSeats <= MAX_TEAM_SEATS 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}>
                {activeSeats} de {MAX_TEAM_SEATS} plazas ocupadas
              </span>
            </div>

            {/* Lista de Miembros */}
            <div className="space-y-3">
              {config.team.map((member) => (
                <div 
                  key={member.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleUpdateMember(member.id, { name: e.target.value })}
                        className="font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-full"
                      />
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>{member.email}</span>
                        <span>·</span>
                        <span>{member.phone}</span>
                      </div>
                    </div>
                    {config.team.length > 1 && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Eliminar del equipo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Rol operativo:</span>
                    <span className="font-bold text-blue-600">{formatAgencyRole(member.role)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleAddMember}
              disabled={activeSeats >= MAX_TEAM_SEATS}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              Añadir Integrante al Equipo (+{MAX_TEAM_SEATS - activeSeats} plazas disponibles)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
