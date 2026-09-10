"use client";

import React, { useState } from "react";
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
  RefreshCw
} from "lucide-react";

interface ActionProposal {
  id: string;
  title: string;
  description: string;
  actionType: string;
  status: "pending" | "approved" | "rejected";
}

interface Message {
  id: string;
  sender: "user" | "broker";
  text: string;
  proposals?: ActionProposal[];
  timestamp: string;
}

export default function BrokerDashboard() {
  const [activeTab, setActiveTab] = useState<"chat" | "cases" | "docs" | "memory">("chat");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "broker",
      text: "?Hola! Soy BROKER, tu copiloto de IA inmobiliaria para Espa?a. Estoy conectado con tu modelo llama3.1:8b en Hostinger. ?Qu? expediente o contrato deseas revisar hoy?",
      timestamp: "17:00"
    }
  ]);

  const [activeCases] = useState([
    { id: "EXP-2026-01", title: "Piso en Calle Alcala, Madrid", type: "Venta", price: "420.000 ?", status: "Arras Penitenciales", docsCount: 4 },
    { id: "EXP-2026-02", title: "Atico en Eixample, Barcelona", type: "Venta", price: "580.000 ?", status: "Captacion / Nota Simple", docsCount: 2 },
    { id: "EXP-2026-03", title: "Apartamento en Ruzafa, Valencia", type: "Alquiler LAU", price: "1.250 ?/mes", status: "Comercializacion", docsCount: 3 },
  ]);

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

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          tenantId: "inmobia360-spain"
        })
      });

      const data = await res.json();

      const brokerMsg: Message = {
        id: `brk-${Date.now()}`,
        sender: "broker",
        text: data.reply || data.error || "Respuesta recibida",
        proposals: data.actionProposals || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, brokerMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "broker",
          text: "Error temporal de comunicacion con el motor Ollama en Hostinger. Verifica el estado en /api/health.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (proposalId: string, approved: boolean) => {
    setMessages(prev => prev.map(msg => {
      if (!msg.proposals) return msg;
      return {
        ...msg,
        proposals: msg.proposals.map(p => {
          if (p.id === proposalId) {
            return { ...p, status: approved ? "approved" : "rejected" };
          }
          return p;
        })
      };
    }));
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar Marca Blanca */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            AI
          </div>
          <div>
            <h1 className="font-semibold text-sm text-white tracking-wide">AI BROKER</h1>
            <p className="text-xs text-slate-400">inmobia360 Espa?a</p>
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
            Boveda Documental
          </button>
          <button 
            onClick={() => setActiveTab("memory")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
              activeTab === "memory" ? "bg-blue-600/20 text-blue-400 font-medium border border-blue-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            Memoria Canonica
          </button>
        </nav>

        {/* Info Hostinger & Dominio */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aislamiento tenant_id activo</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            broker.inmobia360.com
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Ollama Hostinger (llama3.1:8b)
            </span>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs text-slate-400">Tenant: inmobia360-spain</span>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href="/api/health" 
              target="_blank" 
              className="text-xs px-3 py-1.5 rounded-md border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Verificar Conexion API
            </a>
          </div>
        </header>

        {/* Tab Content */}
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {/* Quick Prompt Suggestions */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              <button 
                onClick={() => handleSendMessage("?Qu? cl?usulas esenciales debe contener un contrato de arras penitenciales seg?n el art?culo 1454 del C?digo Civil?")}
                className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                Arras Penitenciales (C?digo Civil)
              </button>
              <button 
                onClick={() => handleSendMessage("?Cu?l es la documentaci?n legal obligatoria para comercializar una vivienda en la Comunidad de Madrid?")}
                className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                Documentaci?n obligatoria Madrid
              </button>
              <button 
                onClick={() => handleSendMessage("?C?mo afecta la Ley por el Derecho a la Vivienda a la fijaci?n de precios en zonas tensionadas de alquiler?")}
                className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Ley Vivienda y Alquiler LAU
              </button>
            </div>

            {/* Chat History */}
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
                    <span className="text-[10px] text-slate-400 block mt-1 text-right">
                      {m.timestamp}
                    </span>
                  </div>

                  {/* Tarjetas de Propuesta con Autorizacion Humana (Constitucion Principio 6) */}
                  {m.proposals && m.proposals.length > 0 && (
                    <div className="mt-2 space-y-2 w-full max-w-2xl">
                      {m.proposals.map(prop => (
                        <div key={prop.id} className="p-3.5 bg-slate-900/90 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-semibold text-amber-300">{prop.title}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{prop.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {prop.status === "pending" ? (
                              <>
                                <button 
                                  onClick={() => handleAction(prop.id, true)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Autorizar
                                </button>
                                <button 
                                  onClick={() => handleAction(prop.id, false)}
                                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Descartar
                                </button>
                              </>
                            ) : (
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                prop.status === "approved" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                              }`}>
                                {prop.status === "approved" ? "Autorizado por usuario" : "Descartado"}
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
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl max-w-xs border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                  BROKER consultando llama3.1 en Hostinger...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="mt-4 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2 focus-within:border-blue-500/50 transition-colors">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Pregunta a BROKER sobre normativa, expedientes o redaccion de contratos..."
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

        {/* Tab Expedientes */}
        {activeTab === "cases" && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Expedientes Inmobiliarios Activos</h2>
                <p className="text-xs text-slate-400">M?dulo adaptado a la operativa del mercado espa?ol</p>
              </div>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors">
                + Nuevo Expediente
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCases.map((c) => (
                <div key={c.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-mono text-blue-400 font-medium">{c.id}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {c.type}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm text-white">{c.title}</h3>
                  <div className="text-base font-semibold text-emerald-400">{c.price}</div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Estado: <strong className="text-slate-200">{c.status}</strong></span>
                    <span>{c.docsCount} docs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Documentos */}
        {activeTab === "docs" && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <h2 className="text-lg font-semibold text-white">Boveda Documental Segura</h2>
            <p className="text-xs text-slate-400">Almacenamiento privado con anonimizacion de PII</p>
            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2 bg-slate-900/30">
              <FileText className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="text-sm text-slate-300 font-medium">Arrastra aqui notas simples, contratos o cedulas</div>
              <div className="text-xs text-slate-500">Los documentos originales nunca se publican ni se guardan en Git</div>
            </div>
          </div>
        )}

        {/* Tab Memoria */}
        {activeTab === "memory" && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <h2 className="text-lg font-semibold text-white">Memoria Canonica de la Agencia</h2>
            <p className="text-xs text-slate-400">Criterios comerciales, politicas de honorarios y reglas aprobadas</p>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <BrainCircuit className="w-4 h-4" />
                Politica de Honorarios Estandar (Espana)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Comision fijada en el 3% (+IVA) al comprador y 3% (+IVA) al vendedor en operaciones de compraventa en Madrid y Valencia. En arrendamientos de vivienda habitual, los honorarios de gestion inmobiliaria y formalizacion corresponden al arrendador (segun art. 20.1 LAU modificado).
              </p>
              <div className="text-[10px] text-slate-500">Validado por BROKER ? sharing_policy: private_by_default</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
