"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Users, 
  Palette, 
  Building2, 
  Check, 
  AlertTriangle, 
  UserPlus, 
  Trash2, 
  Save,
  Phone,
  Mail,
  MapPin
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

  // Añadir nuevo miembro de equipo
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

  // Eliminar o desactivar miembro
  const handleRemoveMember = (id: string) => {
    setConfig(prev => ({
      ...prev,
      team: prev.team.filter(m => m.id !== id)
    }));
  };

  // Modificar miembro
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
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Configuración de Agencia y Marca Blanca
          </h2>
          <p className="text-xs text-slate-400">
            Personaliza la identidad corporativa, datos de facturación y equipo de agentes (1 a 5 integrantes)
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          {savedSuccess ? "¡Guardado con Éxito!" : "Guardar Cambios"}
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BLOQUE 1: IDENTIDAD Y MARCA BLANCA (6 columnas) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <Palette className="w-4 h-4 text-blue-400" />
            Identidad Visual de la Marca
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium">Nombre Comercial de la Agencia</label>
              <input
                type="text"
                value={config.agencyName}
                onChange={(e) => setConfig({ ...config, agencyName: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Eslogan Corporativo</label>
              <input
                type="text"
                value={config.brandSlogan}
                onChange={(e) => setConfig({ ...config, brandSlogan: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium">Color Primario</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-slate-800 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-[11px]"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-medium">Color de Acento</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-slate-800 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.accentColor}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-slate-400 font-medium">NIF / CIF Fiscal</label>
                <input
                  type="text"
                  value={config.fiscalId}
                  onChange={(e) => setConfig({ ...config, fiscalId: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium">Colegiación API / AICAT</label>
                <input
                  type="text"
                  value={config.apiNumber || ""}
                  onChange={(e) => setConfig({ ...config, apiNumber: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  value={config.contactPhone}
                  onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium">Correo Electrónico</label>
                <input
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-medium">Dirección de la Agencia</label>
              <input
                type="text"
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* BLOQUE 2: GESTIÓN DE EQUIPO (6 columnas) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                Equipo de la Agencia
              </h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                activeSeats <= MAX_TEAM_SEATS 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}>
                {activeSeats} de {MAX_TEAM_SEATS} plazas ocupadas
              </span>
            </div>

            {/* Lista de Miembros */}
            <div className="space-y-3">
              {config.team.map((member) => (
                <div 
                  key={member.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleUpdateMember(member.id, { name: e.target.value })}
                        className="font-semibold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 outline-none w-full"
                      />
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>{member.email}</span>
                        <span>·</span>
                        <span>{member.phone}</span>
                      </div>
                    </div>
                    {config.team.length > 1 && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                        title="Eliminar del equipo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Rol operativo:</span>
                    <span className="font-medium text-blue-400">{formatAgencyRole(member.role)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleAddMember}
              disabled={activeSeats >= MAX_TEAM_SEATS}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              Añadir Integrante al Equipo (+{MAX_TEAM_SEATS - activeSeats} plazas disponibles)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
