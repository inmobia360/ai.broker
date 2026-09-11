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
  RefreshCw,
  Download,
  Loader2
} from "lucide-react";

interface ActionProposal {
  id: string;
  title: string;
  description: string;
  actionType: string;
  status: "pending" | "approved" | "rejected";
  downloadUrl?: string;
  fileName?: string;
}

interface Message {
  id: string;
  sender: "user" | "broker";
  text: string;
  provider?: string;
  proposals?: ActionProposal[];
  timestamp: string;
}

export default function BrokerDashboard() {
  const [activeTab, setActiveTab] = useState<"chat" | "cases" | "docs" | "memory">("chat");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "broker",
      text: "?Hola! Soy BROKER, tu copiloto de IA inmobiliaria para agencias en Espa?a dentro del ecosistema inmobia360. ?Qu? expediente o consulta jur?dica deseas analizar hoy?",
      timestamp: "17:00"
    }
  ]);

  const [activeCases] = useState([
    { id: "EXP-2026-01", title: "Piso en Calle Alcal?, Madrid", type: "Venta", price: "420.000 ?", status: "Arras Penitenciales", docsCount: 4 },
    { id: "EXP-2026-02", title: "?tico en Eixample, Barcelona", type: "Venta", price: "580.000 ?", status: "Captaci?n / Nota Simple", docsCount: 2 },
    { id: "EXP-2026-03", title: "Apartamento en Ruzafa, Valencia", type: "Alquiler LAU", price: "1.250 ?/mes", status: "Comercializaci?n", docsCount: 3 },
  ]);

  const [vaultDocs, setVaultDocs] = useState([
    { id: "doc-1", name: "Nota_Simple_Registro_Alcala.pdf", size: "2.4 MB", date: "10/09/2026", status: "Auditado" },
    { id: "doc-2", name: "Certificado_Energetico_CEE.pdf", size: "1.1 MB", date: "08/09/2026", status: "V?lido" }
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
    setThinkingStep("Analizando consulta y consultando normativa inmobiliaria espa?ola...");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          tenantId: "inmobia360"
        })
      });

      const data = await res.json();

      const brokerMsg: Message = {
        id: `brk-${Date.now()}`,
        sender: "broker",
        text: data.reply || data.error || "Respuesta procesada",
        provider: data.provider,
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
          text: "Error de comunicaci?n al procesar la respuesta. Verifica la conexi?n.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
      setThinkingStep("");
    }
  };

  const handleAction = (proposalId: string, approved: boolean) => {
    setMessages(prev => prev.map(msg => {
      if (!msg.proposals) return msg;
      return {
        ...msg,
        proposals: msg.proposals.map(p => {
          if (p.id === proposalId) {
            const fileName = "Borrador_Arras_Penitenciales_Art1454.doc";
            if (approved) {
              setVaultDocs(docs => [
                { id: `doc-${Date.now()}`, name: fileName, size: "45 KB", date: "Hoy", status: "Autorizado por BROKER" },
                ...docs
              ]);
            }
            return { 
              ...p, 
              status: approved ? "approved" : "rejected",
              fileName: approved ? fileName : undefined
            };
          }
          return p;
        })
      };
    }));
  };

  const handleDownloadDoc = (fileName: string) => {
    const docContent = `CONTRATO DE COMPRAVENTA CON ARRAS PENITENCIALES (ARTICULO 1454 DEL CODIGO CIVIL)
==================================================================================
Fecha: ${new Date().toLocaleDateString()}
Plataforma: inmobia360 - AI BROKER

REUNIDOS:
De una parte, como PARTE VENDEDORA...
De otra parte, como PARTE COMPRADORA...

EXPONEN:
I. Que la PARTE VENDEDORA es titular en pleno dominio del inmueble.
II. Referencia Catastral asignada.

ESTIPULACIONES:
PRIMERA.- OBJETO Y PRECIO.
SEGUNDA.- ARRAS PENITENCIALES (Art. 1454 C.C.). Las partes pactan expresamente que las cantidades entregadas tienen la condicion de arras penitenciales. Si la compradora desistiere, perdera las arras entregadas. Si la vendedora desistiere, debera devolverlas duplicadas.
TERCERA.- ESCRITURA PUBLICA. Plazo maximo de elevacion a publico.
CUARTA.- GASTOS E IMPUESTOS segun ley.
`;
    const blob = new Blob([docContent], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Marca Blanca inmobia360 */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/70 flex flex-col">
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
            B?veda Documental
            <span className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-300">{vaultDocs.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab("memory")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
              activeTab === "memory" ? "bg-blue-600/20 text-blue-400 font-medium border border-blue-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            Memoria Can?nica
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/40 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aislamiento tenant_id activo</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            asesor.inmobia360.com
          </div>
        </div>
      </aside>

      {/* Area Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Superior */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              Ecosistema inmobia360
            </span>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs text-slate-400">Dominio: asesor.inmobia360.com</span>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href="/api/health" 
              target="_blank" 
              className="text-xs px-3 py-1.5 rounded-md border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Verificar Conexi?n API
            </a>
          </div>
        </header>

        {/* Consola de Chat */}
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {/* Botones de Consulta Rapida */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              <button 
                onClick={() => handleSendMessage("?C?mo redactar un contrato de arras penitenciales seg?n el art?culo 1454 del C?digo Civil?")}
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
                onClick={() => handleSendMessage("?C?mo afecta la Ley por el Derecho a la Vivienda a los honorarios de agencia y fianza en alquileres LAU?")}
                className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Ley Vivienda y Alquiler LAU
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

                  {/* Tarjetas de Propuesta de Accion con Autorizacion Humana */}
                  {m.proposals && m.proposals.length > 0 && (
                    <div className="mt-2 space-y-2 w-full max-w-2xl">
                      {m.proposals.map(prop => (
                        <div key={prop.id} className="p-4 bg-slate-900/95 border border-amber-500/40 rounded-xl flex items-center justify-between gap-4 shadow-lg shadow-black/40">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-semibold text-amber-300">{prop.title}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{prop.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {prop.status === "pending" ? (
                              <>
                                <button 
                                  onClick={() => handleAction(prop.id, true)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Autorizar
                                </button>
                                <button 
                                  onClick={() => handleAction(prop.id, false)}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
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
                                    onClick={() => handleDownloadDoc(prop.fileName!)}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Descargar Borrador .DOC
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

              {/* Indicador de Analisis y Razonamiento */}
              {isLoading && (
                <div className="flex items-center gap-3 text-xs text-blue-300 bg-blue-950/40 p-3.5 rounded-xl max-w-md border border-blue-500/30 animate-pulse shadow-md">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                  <span>{thinkingStep || "BROKER analizando y razonando la respuesta..."}</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="mt-4 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2 focus-within:border-blue-500/50 transition-colors shadow-inner">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Formula tu consulta inmobiliaria a BROKER (contratos, legislaci?n, expedientes)..."
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

        {/* Tab Boveda Documental */}
        {activeTab === "docs" && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">B?veda Documental Segura</h2>
                <p className="text-xs text-slate-400">Documentos generados y auditados de la agencia</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vaultDocs.map(doc => (
                <div key={doc.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-xs font-medium text-slate-200">{doc.name}</div>
                      <div className="text-[10px] text-slate-400">{doc.size} ? {doc.date} ? {doc.status}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownloadDoc(doc.name)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2 bg-slate-900/30 mt-4">
              <FileText className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="text-sm text-slate-300 font-medium">Arrastra aqu? notas simples, contratos o c?dulas</div>
              <div className="text-xs text-slate-500">Los documentos originales se cifran y quedan protegidos por tenant_id</div>
            </div>
          </div>
        )}

        {/* Tab Memoria */}
        {activeTab === "memory" && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <h2 className="text-lg font-semibold text-white">Memoria Can?nica de la Agencia</h2>
            <p className="text-xs text-slate-400">Criterios comerciales, pol?ticas de honorarios y reglas aprobadas</p>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <BrainCircuit className="w-4 h-4" />
                Pol?tica de Honorarios Est?ndar (Espa?a)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Comisi?n fijada en el 3% (+IVA) al comprador y 3% (+IVA) al vendedor en operaciones de compraventa en Madrid y Valencia. En arrendamientos de vivienda habitual, los honorarios de gesti?n inmobiliaria y formalizaci?n corresponden al arrendador (seg?n art. 20.1 LAU modificado).
              </p>
              <div className="text-[10px] text-slate-500">Validado por BROKER ? sharing_policy: private_by_default</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
