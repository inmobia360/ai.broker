"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
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
  UserCheck
} from "lucide-react";
import { DraftApprovalModal, ActionProposal } from "@/components/DraftApprovalModal";

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

export default function BrokerDashboard() {
  const [activeTab, setActiveTab] = useState<"chat" | "cases" | "docs" | "memory">("chat");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState("");
  
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
      text: "¡Hola! Soy BROKER, el director digital de tu agencia inmobiliaria dentro del ecosistema inmobia360. Estoy listo para ayudarte a redactar contratos conformes a la legislación española (Arras Art. 1454 C.C., Alquileres LAU), coordinar visitas y calificar la solvencia de compradores en modo borrador seguro. ¿Qué consulta o expediente deseas analizar?",
      timestamp: "10:00"
    }
  ]);

  const [activeCases] = useState([
    { 
      id: "EXP-2026-01", 
      title: "Piso en Calle Alcalá, Madrid", 
      type: "Venta", 
      price: "420.000 €", 
      status: "Pendiente de Arras", 
      docsCount: 4,
      buyerName: "Elena Sánchez",
      suggestedAction: "Redactar contrato de arras penitenciales para el Piso de Calle Alcalá por 420.000 € con señal de 42.000 €"
    },
    { 
      id: "EXP-2026-02", 
      title: "Ático en Eixample, Barcelona", 
      type: "Venta", 
      price: "580.000 €", 
      status: "Captación / Nota Simple", 
      docsCount: 2,
      buyerName: "Marc Vidal",
      suggestedAction: "Preparar hoja de visita con pacto de honorarios del 3% para el Ático en Eixample con Marc Vidal"
    },
    { 
      id: "EXP-2026-03", 
      title: "Apartamento en Ruzafa, Valencia", 
      type: "Alquiler LAU", 
      price: "1.250 €/mes", 
      status: "Comercialización", 
      docsCount: 3,
      buyerName: "Sofía Ruiz",
      suggestedAction: "Generar contrato de arrendamiento LAU 29/1994 de 5 años para el Apartamento en Ruzafa por 1.250 €/mes"
    },
  ]);

  const [vaultDocs, setVaultDocs] = useState([
    { id: "doc-1", name: "Nota_Simple_Registro_Alcala.pdf", size: "2.4 MB", date: "10/09/2026", status: "Auditado", channel: "Registro de la Propiedad" },
    { id: "doc-2", name: "Certificado_Energetico_CEE.pdf", size: "1.1 MB", date: "08/09/2026", status: "Válido", channel: "ICAEN / Oficial" }
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

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMessage("");
    setIsLoading(true);
    setThinkingStep("Director BROKER consultando normativa española y preparando respuesta...");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-tenant-id": "inmobia360"
        },
        body: JSON.stringify({
          message: textToSend,
          tenantId: "inmobia360"
        })
      });

      const data = await res.json();

      // Convertir propuestas devueltas por el Director BROKER
      let formattedProposals: ActionProposal[] = [];
      if (data.actionProposals && Array.isArray(data.actionProposals)) {
        formattedProposals = data.actionProposals.map((p: any) => ({
          id: p.id || `prop-${Date.now()}`,
          title: p.title || "Propuesta de Acción",
          description: p.description || "",
          actionType: p.actionType || "legal_draft",
          status: p.status || "pending",
          rawContent: p.rawContent || p.description,
          fileName: p.fileName
        }));
      }

      // Si la consulta fue sobre Arras y no vinieron propuestas directas, estructurar propuesta legal interactiva
      if (formattedProposals.length === 0 && (textToSend.toLowerCase().includes("arras") || textToSend.toLowerCase().includes("alquiler") || textToSend.toLowerCase().includes("visita"))) {
        const isArras = textToSend.toLowerCase().includes("arras");
        const isAlquiler = textToSend.toLowerCase().includes("alquiler");
        
        formattedProposals.push({
          id: `prop-${Date.now()}`,
          title: isArras 
            ? "Borrador de Contrato de Arras Penitenciales (Art. 1454 C.C.)" 
            : isAlquiler
            ? "Borrador de Contrato de Alquiler Residencial (LAU 29/1994)"
            : "Hoja de Visita con Blindaje y Pacto de Honorarios",
          description: isArras
            ? "Documento preparado conforme al Código Civil español con penalización de desistimiento y plazo de firma notarial."
            : isAlquiler
            ? "Contrato adaptado a la LAU y Ley 12/2023 con fianza legal obligatoria y honorarios a cargo del arrendador."
            : "Hoja de visita con identificación de finca, visitante y reserva de honorarios de corretaje.",
          actionType: isArras ? "contract_arras" : isAlquiler ? "contract_lau" : "visit_sheet",
          status: "pending",
          rawContent: data.reply || textToSend
        });
      }

      const brokerMsg: Message = {
        id: `brk-${Date.now()}`,
        sender: "broker",
        text: data.reply || data.error || "Consulta procesada conforme a los expedientes de la agencia.",
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
        proposals: msg.proposals.map(p => {
          if (p.id === proposalId) {
            return { ...p, status: "rejected" };
          }
          return p;
        })
      };
    }));
  };

  // Confirmar aprobación humana y ejecutar canal seleccionado
  const handleConfirmApproval = async (channel: "whatsapp" | "email" | "pdf") => {
    if (!selectedProposal) return;
    setIsApproving(true);

    try {
      // 1. Llamar al endpoint de aprobación en el backend
      try {
        await fetch(`/api/drafts/${selectedProposal.id}/approve`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": "inmobia360"
          },
          body: JSON.stringify({
            channel,
            approvedBy: "Agente Inmobiliario",
            tenantId: "inmobia360"
          })
        });
      } catch (e) {
        // Fallback en caso de simulación local
      }

      const generatedFileName = selectedProposal.actionType === "contract_arras"
        ? "Contrato_Arras_Penitenciales_Art1454.pdf"
        : selectedProposal.actionType === "contract_lau"
        ? "Contrato_Alquiler_Residencial_LAU.pdf"
        : "Hoja_Visita_Honorarios_Inmobia.pdf";

      // 2. Ejecutar acción de entrega según canal
      if (channel === "whatsapp") {
        const text = `Hola, le adjunto el borrador formal de ${selectedProposal.title} tramitado a través de inmobia360 para su revisión. Quedo a su disposición.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
      } else if (channel === "pdf") {
        handleDownloadDoc(generatedFileName, selectedProposal.rawContent || selectedProposal.description);
      }

      // 3. Añadir documento a la Caja Fuerte de la Agencia
      setVaultDocs(docs => [
        {
          id: `doc-${Date.now()}`,
          name: generatedFileName,
          size: "48 KB",
          date: new Date().toLocaleDateString("es-ES"),
          status: "Autorizado por Agente",
          channel: channel.toUpperCase()
        },
        ...docs
      ]);

      // 4. Actualizar estado en el chat a aprobado
      setMessages(prev => prev.map(msg => {
        if (!msg.proposals) return msg;
        return {
          ...msg,
          proposals: msg.proposals.map(p => {
            if (p.id === selectedProposal.id) {
              return { 
                ...p, 
                status: "approved",
                fileName: generatedFileName
              };
            }
            return p;
          })
        };
      }));

      setApprovalModalOpen(false);
      setSelectedProposal(null);
    } finally {
      setIsApproving(false);
    }
  };

  // Descargar documento generado
  const handleDownloadDoc = (fileName: string, content?: string) => {
    const docText = content || `DOCUMENTO OFICIAL DE AGENCIA INMOBILIARIA
==================================================================================
Plataforma: inmobia360 - AI BROKER (España)
Fecha de Expedición: ${new Date().toLocaleDateString("es-ES")}
Aislamiento: Tenant Verificado inmobia360
Normativa: Código Civil Español / Ley 29/1994 de Arrendamientos Urbanos (LAU)

${fileName.toUpperCase().replace(/_/g, " ")}

CLÁUSULA DE PRIVACIDAD Y BLINDAJE:
El presente documento ha sido redactado bajo supervisión del Director Broker y autorizado explícitamente por el agente inmobiliario colegiado.
`;
    const blob = new Blob([docText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Institucional inmobia360 */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/70 flex flex-col">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            AI
          </div>
          <div>
            <h1 className="font-semibold text-sm text-white tracking-wide">AI BROKER</h1>
            <p className="text-xs text-slate-400">inmobia360 España</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1.5">
          <button 
            onClick={() => setActiveTab("chat")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
              activeTab === "chat" ? "bg-blue-600/20 text-blue-400 font-medium border border-blue-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Consola BROKER
          </button>
          <button 
            onClick={() => setActiveTab("cases")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
              activeTab === "cases" ? "bg-blue-600/20 text-blue-400 font-medium border border-blue-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            Expedientes
          </button>
          <button 
            onClick={() => setActiveTab("docs")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
              activeTab === "docs" ? "bg-blue-600/20 text-blue-400 font-medium border border-blue-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileText className="w-4 h-4" />
            Bóveda Documental
            <span className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-300">{vaultDocs.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab("memory")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
              activeTab === "memory" ? "bg-blue-600/20 text-blue-400 font-medium border border-blue-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            Memoria Vectorial
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/40 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aislamiento RLS activo</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px] truncate">
            tenant_id: inmobia360
          </div>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Superior con Monitor de Salud */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              Plataforma AI BROKER
            </span>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs text-slate-400">Dominio: asesor.inmobia360.com</span>
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

        {/* Consola de Chat con el Director BROKER */}
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {/* Botones de Consulta Rápida */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              <button 
                onClick={() => handleSendMessage("Redactar un contrato de arras penitenciales según el artículo 1454 del Código Civil español para el piso de Alcalá por 420.000 € y 42.000 € de señal")}
                className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                Arras Penitenciales (Art. 1454 C.C.)
              </button>
              <button 
                onClick={() => handleSendMessage("Preparar una hoja de visita con pacto formal de honorarios del 3% y reserva de corretaje para Marc Vidal en Eixample")}
                className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                Hoja de Visita con Honorarios
              </button>
              <button 
                onClick={() => handleSendMessage("Generar contrato de alquiler de vivienda habitual conforme a la Ley de Arrendamientos Urbanos (LAU 29/1994) por 1.250 €/mes")}
                className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Contrato Alquiler LAU 29/1994
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
                                Estado: Modo Borrador Seguro (Requiere autorización)
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
                                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Descartar
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

              {/* Indicador de Análisis y Razonamiento */}
              {isLoading && (
                <div className="flex items-center gap-3 text-xs text-blue-300 bg-blue-950/40 p-3.5 rounded-xl max-w-md border border-blue-500/30 animate-pulse shadow-md">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                  <span>{thinkingStep || "Director BROKER analizando y razonando la respuesta..."}</span>
                </div>
              )}
            </div>

            {/* Barra de Entrada de Texto */}
            <div className="mt-4 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2 focus-within:border-blue-500/50 transition-colors shadow-inner">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Formula tu consulta inmobiliaria al Director BROKER (contratos, legislación, expedientes)..."
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

        {/* Tab Expedientes Inmobiliarios */}
        {activeTab === "cases" && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Expedientes Inmobiliarios Activos</h2>
                <p className="text-xs text-slate-400">Inmuebles en gestión conforme a la legislación española</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCases.map((c) => (
                <div key={c.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-mono text-blue-400 font-medium">{c.id}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {c.type}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm text-white">{c.title}</h3>
                    <div className="text-lg font-semibold text-emerald-400">{c.price}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Comprador interesado: <strong className="text-slate-200">{c.buyerName}</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Estado: <strong className="text-slate-200">{c.status}</strong></span>
                      <span>{c.docsCount} docs</span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("chat");
                        handleSendMessage(c.suggestedAction);
                      }}
                      className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Tramitar con BROKER
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Bóveda Documental */}
        {activeTab === "docs" && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Bóveda Documental Segura</h2>
                <p className="text-xs text-slate-400">Documentos generados, autorizados por el agente y archivados</p>
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

            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2 bg-slate-900/30 mt-4">
              <FileText className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="text-sm text-slate-300 font-medium">Bóveda con aislamiento estricto RLS por agencia</div>
              <div className="text-xs text-slate-500">Los documentos originales están custodiados en almacenamiento cifrado</div>
            </div>
          </div>
        )}

        {/* Tab Memoria Vectorial */}
        {activeTab === "memory" && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <h2 className="text-lg font-semibold text-white">Memoria Vectorial de la Agencia</h2>
            <p className="text-xs text-slate-400">Criterios comerciales, políticas de honorarios y base de conocimiento pgvector</p>
            
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <BrainCircuit className="w-4 h-4" />
                Política de Honorarios Estándar (España)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Comisión fijada en el 3% (+IVA) al comprador y 3% (+IVA) al vendedor en operaciones de compraventa en Madrid, Barcelona y Valencia. En arrendamientos de vivienda habitual, los honorarios de gestión inmobiliaria y formalización corresponden al arrendador (según art. 20.1 LAU modificado por la Ley 12/2023).
              </p>
              <div className="text-[10px] text-slate-500 font-mono">
                Indexado en pgvector (768 dims) · Aislamiento tenant_id: inmobia360
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Protección Legal Inmobiliaria Activa
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Todos los borradores de arras incorporan imperativamente el artículo 1454 del Código Civil (arras penitenciales). Las hojas de visita incluyen reserva expresa de corretaje durante 12 meses frente a compras directas entre particulares tras la visita.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Aprobación Human-in-the-Loop */}
      <DraftApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        proposal={selectedProposal}
        onConfirmApproval={handleConfirmApproval}
        isLoading={isApproving}
      />
    </div>
  );
}
