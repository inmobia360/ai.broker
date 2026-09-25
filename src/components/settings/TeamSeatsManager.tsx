'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Copy, 
  Check, 
  Trash2, 
  Building2, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'director' | 'agent';
  status: 'active' | 'invited';
  avatarInitials: string;
  assignedPropertiesCount: number;
}

interface TeamSeatsManagerProps {
  agencyName?: string;
  planType?: 'solo' | 'boutique';
  maxSeats?: number;
  initialMembers?: TeamMember[];
}

export function TeamSeatsManager({
  agencyName = "Inmobia 360",
  planType = "boutique",
  maxSeats = 5,
  initialMembers
}: TeamSeatsManagerProps) {
  const [members, setMembers] = useState<TeamMember[]>(
    initialMembers || [
      {
        id: "mem-1",
        name: "Director de Agencia (Tú)",
        email: "director@inmobia360.com",
        role: "director",
        status: "active",
        avatarInitials: "DA",
        assignedPropertiesCount: 3
      },
      {
        id: "mem-2",
        name: "Carlos Martínez (Comercial)",
        email: "carlos.martinez@inmobia360.com",
        role: "agent",
        status: "active",
        avatarInitials: "CM",
        assignedPropertiesCount: 2
      }
    ]
  );

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<'agent' | 'director'>('agent');
  const [copiedLink, setCopiedLink] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);

  const availableSeats = maxSeats - members.length;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || availableSeats <= 0) return;

    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      name: inviteName || inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: "invited",
      avatarInitials: (inviteName ? inviteName.substring(0, 2) : inviteEmail.substring(0, 2)).toUpperCase(),
      assignedPropertiesCount: 0
    };

    setMembers([...members, newMember]);
    setGeneratedInviteLink(`https://app.inmobia360.com/invite?token=inv-${Date.now()}`);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) return; // Mantener al menos 1 administrador
    setMembers(members.filter(m => m.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Resumen de Plazas y Capacidad */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Plazas de Equipo ({members.length} de {maxSeats} activas)
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Plan {planType === "boutique" ? "Boutique (5 Plazas)" : "Individual"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cada plaza permite a un agente comercial acceder con su propio usuario, gestionar sus inmuebles y atender sus propios leads asignados.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setGeneratedInviteLink(null);
            setInviteModalOpen(true);
          }}
          disabled={availableSeats <= 0}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs ${
            availableSeats > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-blue-500/20'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          {availableSeats > 0 ? `Invitar Agente (${availableSeats} libres)` : 'Límite de Plazas Alcanzado'}
        </button>
      </div>

      {/* Lista de Miembros y Plazas */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Integrantes de {agencyName}
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            Aislamiento estricto RLS por Agencia
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {members.map((member) => (
            <div key={member.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {member.avatarInitials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 truncate">{member.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      member.role === 'director' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {member.role === 'director' ? 'Director de Agencia' : 'Agente Asociado'}
                    </span>
                    {member.status === 'invited' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        Invitación Pendiente
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                    <span>{member.email}</span>
                    <span>·</span>
                    <span>{member.assignedPropertiesCount} inmuebles asignados</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {member.role !== 'director' && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Dar de baja plaza"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Plazas Vacías Disponibles */}
          {Array.from({ length: availableSeats }).map((_, idx) => (
            <div key={`empty-${idx}`} className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-slate-50/30 border-dashed border-slate-200">
              <div className="flex items-center gap-3.5 text-slate-400">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-xs font-semibold">
                  +{idx + 1}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500">Plaza de Agente Disponible</span>
                  <p className="text-[11px] text-slate-400">Listo para incorporar comercial</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setGeneratedInviteLink(null);
                  setInviteModalOpen(true);
                }}
                className="px-3 py-1.5 border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 rounded-xl text-xs font-semibold transition"
              >
                + Activar Plaza
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Invitación */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Invitar Agente al Equipo</h3>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {!generatedInviteLink ? (
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo del Agente</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Laura Sánchez"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-blue-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico Corporativo</label>
                  <input
                    type="email"
                    required
                    placeholder="laura@inmobia360.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-blue-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rol Operativo</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-blue-600 font-medium"
                  >
                    <option value="agent">Agente Asociado (Solo ve sus leads e inmuebles)</option>
                    <option value="director">Co-Director (Acceso global de agencia)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition"
                  >
                    Generar Invitación
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">¡Invitación creada con éxito!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Comparte este enlace con {inviteName || inviteEmail} para que complete su acceso con su contraseña:
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-700 truncate font-mono">{generatedInviteLink}</span>
                  <button
                    onClick={() => copyToClipboard(generatedInviteLink)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition shrink-0"
                    title="Copiar enlace"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setInviteModalOpen(false);
                    setInviteName("");
                    setInviteEmail("");
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
