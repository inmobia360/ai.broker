"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  LayoutDashboard,
  MessageSquare, 
  FolderKanban, 
  FileText, 
  BrainCircuit, 
  KeyRound, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Download,
  Loader2,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Users,
  Calculator,
  Palette,
  Layers,
  MapPin
} from "lucide-react";
import { DraftApprovalModal, ActionProposal } from "@/components/DraftApprovalModal";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { PriorityLeadsWidget } from "@/components/dashboard/PriorityLeadsWidget";
import { PropertyCatalog, DEMO_PROPERTIES, PropertyItem } from "@/components/dashboard/PropertyCatalog";
import { InteractivePipeline } from "@/components/dashboard/InteractivePipeline";
import { InteractiveCMA } from "@/components/dashboard/InteractiveCMA";
import { ContentStudioAI } from "@/components/dashboard/ContentStudioAI";
import { LegalPostventaModule } from "@/components/dashboard/LegalPostventaModule";
import { WhiteLabelSettings } from "@/components/dashboard/WhiteLabelSettings";
import { 
  WhiteLabelConfig, 
  getDefaultWhiteLabelConfig 
} from "@/lib/branding/whiteLabel";

interface Message {
  id: string;
  sender: "user" | "broker";
  text: string;
  provider?: string;
  proposals?: ActionProposal[];
  timestamp: string;
}

interface HealthInfo {
  ok: boolean;
  provider: string;
  latencyMs: number;
  model?: string;
  hasApiKey?: boolean;
}

export type ActiveTabType = 
  | "dashboard"
  | "properties"
  | "leads"
  | "pipeline"
  | "cma"
  | "content"
  | "legal"
  | "chat"
  | "docs"
  | "settings";

export default function BrokerDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>("dashboard");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState("");
  
  // Marca Blanca
  const [brandConfig, setBrandConfig] = useState<WhiteLabelConfig>(getDefaultWhiteLabelConfig("inmobia360"));

  // Estado para el modal de aprobación Human-in-the-Loop
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ActionProposal | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Monitor de salud en tiempo real
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "broker",
      text: "¡Hola! Soy BROKER, el director cognitivo de tu agencia inmobiliaria. Estoy coordinando tus expedientes comerciales, cálculo de valoraciones ACM, borradores legales conformes a la legislación española (Arras Art. 1454 C.C., Alquileres LAU, LPH y Entrega de Llaves) y gestión de leads bajo el principio de Borrador Seguro. ¿En qué operación trabajamos hoy?",
      timestamp: "10:00"
    }
  ]);

  const [vaultDocs, setVaultDocs] = useState([
    { id: "doc-1", name: "Nota_Simple_Registro_Salamanca.pdf", size: "2.4 MB", date: "20/09/2026", status: "Auditado", channel: "Registro de la Propiedad" },
    { id: "doc-2", name: "Certificado_Energetico_CEE_Serrano.pdf", size: "1.1 MB", date: "18/09/2026", status: "Válido", channel: "Oficial ICAEN" },
    { id: "doc-3", name: "Dossier_ACM_Captacion_Salamanca.pdf", size: "3.2 MB", date: "22/09/2026", status: "Generado", channel: "Tasador ACM" }
  ]);

  // Consultar salud del sistema al iniciar
  const fetchHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      if (data.ok && data.llm) {
        setHealth({
          ok: true,
          provider: data.llm.provider || "Cognitive Engine",
          latencyMs: data.llm.latencyMs || 0,
          model: data.llm.model,
          hasApiKey: data.llm.hasApiKey
        });
      }
    } catch {
      setHealth(null);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage("");
    setIsLoading(true);
    setThinkingStep("Director BROKER razonando conforme a la legislación española...");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          tenantId: brandConfig.tenantId,
          history: messages.slice(-5).map(m => ({ role: m.sender, content: m.text }))
        })
      });

      const data = await response.json();

      let formattedProposals: ActionProposal[] = [];
      if (data.proposals && Array.isArray(data.proposals)) {
        formattedProposals = data.proposals.map((p: any) => ({
          id: p.id || `prop-${Date.now()}`,
          title: p.title || "Propuesta de Acción Generada",
          description: p.description || p.rawContent || "Documento preparado en modo borrador seguro.",
          actionType: p.actionType || "contract_arras",
          status: p.status || "pending",
          rawContent: p.rawContent || p.description,
          fileName: p.fileName
        }));
      }

      // Si la consulta fue sobre Arras, Alquiler o Visita y no vinieron propuestas directas, estructurarla
      if (formattedProposals.length === 0 && (textToSend.toLowerCase().includes("arras") || textToSend.toLowerCase().includes("alquiler") || textToSend.toLowerCase().includes("visita") || textToSend.toLowerCase().includes("lph") || textToSend.toLowerCase().includes("llaves"))) {
        const isArras = textToSend.toLowerCase().includes("arras");
        const isAlquiler = textToSend.toLowerCase().includes("alquiler");
        const isLph = textToSend.toLowerCase().includes("lph");
        const isLlaves = textToSend.toLowerCase().includes("llaves");
        
        formattedProposals.push({
          id: `prop-${Date.now()}`,
          title: isArras 
            ? "Borrador de Contrato de Arras Penitenciales (Art. 1454 C.C.)" 
            : isAlquiler
            ? "Borrador de Contrato de Alquiler Residencial (LAU 29/1994)"
            : isLph
            ? "Requerimiento de Certificado Deuda Cero LPH (Art. 9.1.e)"
            : isLlaves
            ? "Acta de Entrega de Llaves y Lectura de Contadores"
            : "Hoja de Visita con Blindaje y Pacto de Honorarios",
          description: "Documento oficial preparado conforme a la legislación española en Modo Borrador Seguro.",
          actionType: isArras ? "contract_arras" : isAlquiler ? "contract_lau" : "visit_sheet",
          status: "pending",
          rawContent: data.reply || textToSend
        });
      }

      const brokerMsg: Message = {
        id: `brk-${Date.now()}`,
        sender: "broker",
        text: data.reply || data.error || "Operación procesada conforme a los expedientes de la agencia.",
        provider: data.provider || (health?.provider ? health.provider : "inmobia360 Cognitive Engine"),
        proposals: formattedProposals,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, brokerMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "broker",
          text: "Ha ocurrido una incidencia de red al procesar la respuesta. El sistema preserva la integridad de los expedientes.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
      setThinkingStep("");
    }
  };

  // Abrir modal de aprobación Human-in-the-Loop
  const handleOpenApprovalModal = (proposal: ActionProposal) => {
    setSelectedProposal(proposal);
    setApprovalModalOpen(true);
  };

  // Descartar propuesta
  const handleRejectProposal = (proposalId: string) => {
    setMessages(prev => prev.map(msg => {
      if (!msg.proposals) return msg;
      return {
        ...msg,
        proposals: msg.proposals.map(p => p.id === proposalId ? { ...p, status: "rejected" } : p)
      };
    }));
  };

  // Confirmar aprobación humana y ejecutar canal seleccionado
  const handleConfirmApproval = async (channel: "whatsapp" | "email" | "pdf") => {
    if (!selectedProposal) return;
    setIsApproving(true);

    try {
      const fileName = selectedProposal.fileName || `${selectedProposal.title.replace(/\s+/g, "_")}.pdf`;

      // Simulación de aprobación de borrador seguro
      setVaultDocs(prev => [
        {
          id: `doc-${Date.now()}`,
          name: fileName,
          size: "1.4 MB",
          date: new Date().toLocaleDateString("es-ES"),
          status: "Autorizado",
          channel: channel === "whatsapp" ? "WhatsApp DeepLink" : channel === "email" ? "Correo Electrónico" : "Descarga PDF"
        },
        ...prev
      ]);

      setMessages(prev => prev.map(msg => {
        if (!msg.proposals) return msg;
        return {
          ...msg,
          proposals: msg.proposals.map(p => {
            if (p.id === selectedProposal.id) {
              return { ...p, status: "approved", fileName };
            }
            return p;
          })
        };
      }));

      // Si es descarga de PDF, generar archivo local
      if (channel === "pdf") {
        const blob = new Blob([selectedProposal.rawContent || selectedProposal.description], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName.replace(".pdf", ".txt");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setApprovalModalOpen(false);
      setSelectedProposal(null);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownloadDoc = (fileName: string, content?: string) => {
    const textContent = content || `Documento oficial: ${fileName}\nCustodiado con aislamiento RLS bajo tenant_id: ${brandConfig.tenantId}\nFecha de certificación: ${new Date().toLocaleDateString("es-ES")}`;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(".pdf", ".txt");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Acciones rápidas desde tarjetas de dashboard
  const handleDashboardQuickAction = (target: "properties" | "cma" | "content" | "leads") => {
    setActiveTab(target);
  };

  // Ejecutar prompt desde lead prioritario o caso hacia el Director BROKER
  const handleTriggerBroker = (promptText: string) => {
    setActiveTab("chat");
    handleSendMessage(promptText);
  };

  // Manejar acción desde catálogo de propiedades
  const handlePropertyAction = (actionType: "chat" | "cma" | "content", property: PropertyItem) => {
    if (actionType === "cma") {
      setActiveTab("cma");
    } else if (actionType === "content") {
      setActiveTab("content");
    } else {
      setActiveTab("chat");
      handleSendMessage(`Analizar el expediente del inmueble ${property.title} ubicado en ${property.location} por ${property.formattedPrice}.`);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* SIDEBAR DE NAVEGACIÓN (Marca Blanca y Accesos) */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Cabecera con Marca Blanca */}
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shrink-0"
              style={{ backgroundColor: brandConfig.primaryColor }}
            >
              {brandConfig.agencyName.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h1 className="font-semibold text-sm text-white tracking-wide truncate">
                {brandConfig.agencyName}
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                {brandConfig.brandSlogan}
              </p>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="p-3 space-y-1 text-xs">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                activeTab === "dashboard" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Panel General
            </button>

            <button 
              onClick={() => setActiveTab("properties")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                activeTab === "properties" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                Propiedades & Mapa
              </div>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-300">
                {DEMO_PROPERTIES.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab("leads")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                activeTab === "leads" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                Contactos & Leads
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-1.5 py-0.5 rounded-full">
                4 nuevos
              </span>
            </button>

            <button 
              onClick={() => setActiveTab("pipeline")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                activeTab === "pipeline" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              Pipeline (7 Fases)
            </button>

            <button 
              onClick={() => setActiveTab("cma")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                activeTab === "cma" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              Tasador ACM
            </button>

            <button 
              onClick={() => setActiveTab("content")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                activeTab === "content" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              Redactor Copys IA
            </button>

            <button 
              onClick={() => setActiveTab("legal")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                activeTab === "legal" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <KeyRound className="w-4 h-4 text-emerald-400" />
              LPH & Postventa Física
            </button>

            <div className="pt-2 border-t border-slate-800/60 my-2"></div>

            <button 
              onClick={() => setActiveTab("chat")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                activeTab === "chat" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Consola Director BROKER
            </button>

            <button 
              onClick={() => setActiveTab("docs")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                activeTab === "docs" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                Bóveda Documental
              </div>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-300">
                {vaultDocs.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                activeTab === "settings" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Palette className="w-4 h-4 text-blue-400" />
              Marca Blanca & Equipo
            </button>
          </nav>
        </div>

        {/* Footer Sidebar con aislamiento RLS y plazas */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/40 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Aislamiento RLS
            </span>
            <span className="text-emerald-400 font-mono text-[10px]">Activo</span>
          </div>
          <div className="text-slate-500 font-mono text-[10px] truncate">
            tenant: {brandConfig.tenantId} · {brandConfig.team.filter(m => m.active).length}/5 plazas
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DE TRABAJO */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Superior con Monitor de Salud */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              Plataforma SaaS en Producción
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">|</span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              {brandConfig.agencyName} ({brandConfig.fiscalId})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Monitor de Salud del Motor Cognitivo */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-slate-800 bg-slate-900/80 text-xs">
              <span className={`w-2 h-2 rounded-full ${health?.ok ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
              <span className="text-slate-300 font-medium">
                {health?.provider ? health.provider.replace("Hostinger Ollama", "Ollama Hostinger") : "Conectando..."}
              </span>
              {health?.latencyMs ? (
                <span className="text-[10px] text-slate-500 font-mono">({health.latencyMs} ms)</span>
              ) : null}
              <button
                onClick={fetchHealth}
                disabled={isCheckingHealth}
                className="ml-1 text-slate-400 hover:text-white transition-colors"
                title="Actualizar estado del motor"
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingHealth ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA ACTIVA */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 1. PANEL GENERAL (DASHBOARD OPERATIVO) */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <MetricCards onQuickAction={handleDashboardQuickAction} />
              <PriorityLeadsWidget 
                onTriggerBrokerAction={handleTriggerBroker}
                onOpenAllLeads={() => setActiveTab("leads")}
              />
              <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white">Cartera Reciente Destacada</h3>
                  <button 
                    onClick={() => setActiveTab("properties")}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    Ver todas las propiedades ({DEMO_PROPERTIES.length})
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DEMO_PROPERTIES.slice(0, 3).map(p => (
                    <div 
                      key={p.id}
                      onClick={() => setActiveTab("properties")}
                      className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all cursor-pointer space-y-2"
                    >
                      <img src={p.imageUrl} alt="" className="w-full h-32 rounded-lg object-cover" />
                      <div className="font-semibold text-xs text-white line-clamp-1">{p.title}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-400 font-bold">{p.formattedPrice}</span>
                        <span className="text-slate-400">{p.m2} m²</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. PROPIEDADES & MAPA */}
          {activeTab === "properties" && (
            <div className="max-w-7xl mx-auto">
              <PropertyCatalog onSelectPropertyAction={handlePropertyAction} />
            </div>
          )}

          {/* 3. CONTACTOS & LEADS */}
          {activeTab === "leads" && (
            <div className="max-w-7xl mx-auto space-y-6">
              <PriorityLeadsWidget onTriggerBrokerAction={handleTriggerBroker} />
            </div>
          )}

          {/* 4. PIPELINE KANBAN (7 FASES) */}
          {activeTab === "pipeline" && (
            <div className="max-w-7xl mx-auto">
              <InteractivePipeline onExecuteBrokerCase={handleTriggerBroker} />
            </div>
          )}

          {/* 5. TASADOR ACM INTERACTIVO */}
          {activeTab === "cma" && (
            <div className="max-w-7xl mx-auto">
              <InteractiveCMA onGenerateDossier={handleTriggerBroker} />
            </div>
          )}

          {/* 6. REDACTOR DE CONTENIDOS IA */}
          {activeTab === "content" && (
            <div className="max-w-7xl mx-auto">
              <ContentStudioAI onSendToBroker={handleTriggerBroker} />
            </div>
          )}

          {/* 7. LPH Y POSTVENTA FÍSICA */}
          {activeTab === "legal" && (
            <div className="max-w-7xl mx-auto">
              <LegalPostventaModule onRequestApproval={handleOpenApprovalModal} />
            </div>
          )}

          {/* 8. CONSOLA DIRECTOR BROKER (CHAT CON HUMAN-IN-THE-LOOP) */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto">
              {/* Botones de Consulta Rápida */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 shrink-0">
                <button 
                  onClick={() => handleSendMessage("Redactar un contrato de arras penitenciales según el artículo 1454 del Código Civil español para el piso de Alcalá por 420.000 € y 42.000 € de señal")}
                  className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Arras Penitenciales (Art. 1454 C.C.)
                </button>
                <button 
                  onClick={() => handleSendMessage("Preparar requerimiento formal de certificado de deuda cero al Administrador de Fincas según el Art. 9.1.e LPH")}
                  className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Building2 className="w-3 h-3 text-blue-400" />
                  Certificado LPH Art. 9.1.e
                </button>
                <button 
                  onClick={() => handleSendMessage("Generar acta de entrega de llaves y lectura de contadores con código CUPS para posesión notarial")}
                  className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <KeyRound className="w-3 h-3 text-emerald-400" />
                  Acta de Llaves y CUPS
                </button>
              </div>

              {/* Historial de Mensajes */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((m) => (
                  <div 
                    key={m.id} 
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div 
                      className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        m.sender === "user" 
                          ? "bg-blue-600 text-white rounded-br-none" 
                          : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                        <span>{m.provider ? `Motor: ${m.provider}` : ""}</span>
                        <span>{m.timestamp}</span>
                      </div>
                    </div>

                    {/* Tarjetas de Propuesta de Acción (Human-in-the-Loop) */}
                    {m.proposals && m.proposals.length > 0 && (
                      <div className="mt-2 space-y-2 w-full max-w-2xl">
                        {m.proposals.map(prop => (
                          <div key={prop.id} className="p-4 bg-slate-900/95 border border-amber-500/40 rounded-xl flex items-center justify-between gap-4 shadow-lg shadow-black/40">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <div className="text-xs font-semibold text-amber-300">{prop.title}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{prop.description}</div>
                                <div className="mt-1 text-[10px] text-amber-400/80 font-mono">
                                  Modo Borrador Seguro: Requiere aprobación antes de emitir
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {prop.status === "pending" ? (
                                <>
                                  <button 
                                    onClick={() => handleOpenApprovalModal(prop)}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Aprobar y Enviar
                                  </button>
                                  <button 
                                    onClick={() => handleRejectProposal(prop.id)}
                                    className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs transition-colors"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : prop.status === "approved" ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Autorizado
                                  </span>
                                  {prop.fileName && (
                                    <button 
                                      onClick={() => handleDownloadDoc(prop.fileName!, prop.rawContent)}
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      Descargar PDF
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-rose-500/20 text-rose-400">
                                  Descartado
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-3 text-xs text-blue-300 bg-blue-950/40 p-3.5 rounded-xl max-w-md border border-blue-500/30 animate-pulse shadow-md">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                    <span>{thinkingStep || "Director BROKER analizando..."}</span>
                  </div>
                )}
              </div>

              {/* Barra de Entrada de Texto */}
              <div className="mt-4 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2 focus-within:border-blue-500/50 transition-colors shadow-inner shrink-0">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Formula una consulta legal, pide redactar contratos o auditar contingencias al Director BROKER..."
                  className="flex-1 bg-transparent px-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 9. BÓVEDA DOCUMENTAL */}
          {activeTab === "docs" && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Bóveda Documental Segura</h2>
                  <p className="text-xs text-slate-400">Documentos oficiales generados, autorizados por el agente y custodiados</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vaultDocs.map(doc => (
                  <div key={doc.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-200">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {doc.size} · {doc.date} · <span className="text-emerald-400 font-medium">{doc.status}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Canal: {doc.channel}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadDoc(doc.name)}
                      className="p-2 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"
                      title="Descargar documento legal"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2 bg-slate-900/30">
                <FileText className="w-10 h-10 text-slate-500 mx-auto" />
                <div className="text-sm text-slate-300 font-medium">Bóveda con aislamiento estricto RLS ({brandConfig.tenantId})</div>
                <div className="text-xs text-slate-500">Los documentos originales están custodiados con cifrado en reposo</div>
              </div>
            </div>
          )}

          {/* 10. MARCA BLANCA & EQUIPO */}
          {activeTab === "settings" && (
            <div className="max-w-7xl mx-auto">
              <WhiteLabelSettings 
                initialConfig={brandConfig}
                onSaveConfig={(updated) => setBrandConfig(updated)}
              />
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE APROBACIÓN HUMAN-IN-THE-LOOP */}
      {selectedProposal && (
        <DraftApprovalModal
          isOpen={approvalModalOpen}
          proposal={selectedProposal}
          onClose={() => setApprovalModalOpen(false)}
          onConfirmApproval={handleConfirmApproval}
          isLoading={isApproving}
        />
      )}
    </div>
  );
}
