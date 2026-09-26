"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  LayoutGrid,
  MessageSquare, 
  FolderKanban, 
  FileText, 
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
  Settings,
  Plus,
  Moon,
  Bell,
  Globe,
  ArrowUpRight,
  FileCheck
} from "lucide-react";
import { DraftApprovalModal, ActionProposal } from "@/components/DraftApprovalModal";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { PriorityLeadsWidget, PriorityLead, PRIORITY_LEADS } from "@/components/dashboard/PriorityLeadsWidget";
import { PropertyCatalog, DEMO_PROPERTIES, PropertyItem } from "@/components/dashboard/PropertyCatalog";
import { InteractivePipeline, PipelineCase, INITIAL_PIPELINE_CASES } from "@/components/dashboard/InteractivePipeline";
import { InteractiveCMA } from "@/components/dashboard/InteractiveCMA";
import type { CmaValuationOutput } from "@/lib/valuation/cmaValuator";
import { ContentStudioAI } from "@/components/dashboard/ContentStudioAI";
import { LegalPostventaModule } from "@/components/dashboard/LegalPostventaModule";
import { WhiteLabelSettings } from "@/components/dashboard/WhiteLabelSettings";
import { AgentOnboardingModal } from "@/components/dashboard/AgentOnboardingModal";
import { DocumentPreviewModal } from "@/components/legal/DocumentPreviewModal";
import { TeamSeatsManager } from "@/components/settings/TeamSeatsManager";
import { NotificationSettingsPanel } from "@/components/settings/NotificationSettingsPanel";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ShareModal } from "@/components/ui/ShareModal";
import { generateVisitSheet } from "@/lib/legal/spain/visita";
import { generateArrasContract } from "@/lib/legal/spain/arras";
import { generateLPHDebtCertificateRequest } from "@/lib/legal/spain/communityLPH";
import { generateKeyHandoverAct } from "@/lib/legal/spain/handoverPostventa";
import { 
  WhiteLabelConfig, 
  getDefaultWhiteLabelConfig,
  mergeWhiteLabelConfig
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
  
  // Marca Blanca, Leads y Propiedades Dinámicas
  const [brandConfig, setBrandConfig] = useState<WhiteLabelConfig>(getDefaultWhiteLabelConfig("inmobia360"));
  const [properties, setProperties] = useState<PropertyItem[]>(DEMO_PROPERTIES);
  const [leads, setLeads] = useState<PriorityLead[]>(PRIORITY_LEADS);
  const [pipelineCases, setPipelineCases] = useState<PipelineCase[]>(INITIAL_PIPELINE_CASES);
  const [selectedPropertyForCMA, setSelectedPropertyForCMA] = useState<PropertyItem | null>(null);
  const [newPropertyModalOpen, setNewPropertyModalOpen] = useState(false);
  const [isSavingProperty, setIsSavingProperty] = useState(false);
  const [newPropForm, setNewPropForm] = useState({
    title: "",
    price: "",
    location: "Madrid",
    bedrooms: 2,
    bathrooms: 1,
    built_area_m2: 85,
    operation_type: "sale" as "sale" | "rent"
  });

  // Modal de aprobación Human-in-the-Loop
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ActionProposal | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Modal de Difusión y Compartir con QR Dinámico
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPropertyToShare, setSelectedPropertyToShare] = useState<PropertyItem | null>(null);

  // Modal de Onboarding y Configuración de Agencia
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);

  // Modal de Visor e Impresión de Documentos Oficiales con Firma
  const [previewDocModalOpen, setPreviewDocModalOpen] = useState(false);
  const [previewDocData, setPreviewDocData] = useState<{
    title: string;
    documentType: 'visita' | 'arras' | 'lph' | 'llaves';
    content: string;
    clientName?: string;
    clientDni?: string;
  } | null>(null);

  // Sincronización automática de pestaña activa según URL y parámetros
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as ActiveTabType;
      const path = window.location.pathname.toLowerCase();

      if (tabParam && ["dashboard", "properties", "pipeline", "leads", "cma", "legal", "content", "chat", "docs", "settings"].includes(tabParam)) {
        setActiveTab(tabParam);
      } else if (path.includes("lead")) {
        setActiveTab("leads");
      } else if (path.includes("propert")) {
        setActiveTab("properties");
      } else if (path.includes("pipeline")) {
        setActiveTab("pipeline");
      } else if (path.includes("cma") || path.includes("valuat")) {
        setActiveTab("cma");
      } else if (path.includes("content") || path.includes("market") || path.includes("generator")) {
        setActiveTab("content");
      } else if (path.includes("legal") || path.includes("doc")) {
        setActiveTab("legal");
      } else if (path.includes("setting")) {
        setActiveTab("settings");
      }
    }
  }, []);

  // Carga dinámica de la marca configurada en PostgreSQL con fallback en localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedBrand = localStorage.getItem("inmobia360_brand_config");
        if (savedBrand) {
          const parsed = JSON.parse(savedBrand);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            setBrandConfig(prev => mergeWhiteLabelConfig(prev, parsed));
          }
        }
      } catch {}
    }

    fetch("/api/settings/brand")
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.data) {
          setBrandConfig(prev => mergeWhiteLabelConfig(prev, data.data));
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveBrandConfig = async (updated: WhiteLabelConfig) => {
    setBrandConfig(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("inmobia360_brand_config", JSON.stringify(updated));
      } catch {}
    }
    try {
      await fetch("/api/settings/brand", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agency_name: updated.agencyName,
          tagline: updated.brandSlogan,
          primary_color: updated.primaryColor,
          accent_color: updated.accentColor,
          tax_id: updated.fiscalId,
          association_number: updated.apiNumber,
          support_phone: updated.contactPhone,
          support_email: updated.contactEmail,
          logo_url: updated.logoUrl,
          max_team_seats: updated.team ? updated.team.filter(t => t.active).length : 5,
          plan_type: "boutique"
        })
      });
    } catch (err) {
      console.error("Error al persistir marca blanca:", err);
    }
  };

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

  const fetchInitialData = async () => {
    const tenantHeaders = { 
      "Content-Type": "application/json",
      "x-tenant-id": brandConfig.tenantId || "inmobia360" 
    };

    try {
      const resProps = await fetch("/api/properties", { headers: tenantHeaders });
      const dataProps = await resProps.json();
      if (dataProps.ok && Array.isArray(dataProps.data) && dataProps.data.length > 0) {
        setProperties(dataProps.data);
      } else {
        setProperties(DEMO_PROPERTIES);
      }
    } catch {
      setProperties(DEMO_PROPERTIES);
    }

    try {
      const resLeads = await fetch("/api/leads", { headers: tenantHeaders });
      const dataLeads = await resLeads.json();
      if (dataLeads.ok && Array.isArray(dataLeads.data) && dataLeads.data.length > 0) {
        const formattedLeads: PriorityLead[] = dataLeads.data.map((l: any, idx: number) => ({
          id: l.id || `lead-${idx}`,
          name: l.full_name || l.name || "Contacto",
          initials: (l.full_name || l.name || "CO").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
          avatarBg: idx % 2 === 0 ? "bg-blue-600" : "bg-indigo-600",
          category: l.intent_type === "rent" ? "Alquiler" : l.intent_type === "invest" ? "Inversión" : "Compra",
          location: l.location_preference || "Madrid",
          budget: typeof l.budget === "number" && l.budget > 0 ? `${l.budget.toLocaleString("es-ES")} €` : (l.budget || "A consultar"),
          timeframe: l.timeframe || "Ahora",
          score: l.hot_score || l.score || 85,
          timeAgo: l.created_at ? new Date(l.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Reciente",
          inquiry: l.demand_quote || l.message || "Interesado en inmuebles de la cartera.",
          recommendedAction: l.recommended_action || "Llamar y calificar solvencia comercial.",
          phone: l.phone || "+34 600 000 000",
          suggestedPrompt: `Contactar a ${l.full_name || l.name} para coordinar visita y analizar capacidad financiera.`
        }));
        setLeads(formattedLeads);
      } else {
        setLeads(PRIORITY_LEADS);
      }
    } catch {
      setLeads(PRIORITY_LEADS);
    }

    try {
      const resPipe = await fetch("/api/pipeline", { headers: tenantHeaders });
      const dataPipe = await resPipe.json();
      if (dataPipe.ok && Array.isArray(dataPipe.data) && dataPipe.data.length > 0) {
        setPipelineCases(dataPipe.data);
      }
    } catch {}

    try {
      const resBrand = await fetch("/api/settings/brand", { headers: tenantHeaders });
      const dataBrand = await resBrand.json();
      if (dataBrand.ok && dataBrand.data) {
        setBrandConfig(prev => mergeWhiteLabelConfig(prev, dataBrand.data));
      }
    } catch {}
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.cookie = `inmobia_tenant=${brandConfig.tenantId || "inmobia360"}; path=/; max-age=31536000; SameSite=Lax`;
    }
    fetchHealth();
    fetchInitialData();
  }, [brandConfig.tenantId]);

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
        headers: { 
          "Content-Type": "application/json",
          "x-tenant-id": brandConfig.tenantId || "inmobia360"
        },
        body: JSON.stringify({
          message: textToSend,
          tenantId: brandConfig.tenantId || "inmobia360",
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

  const handleOpenApprovalModal = (proposal: ActionProposal) => {
    setSelectedProposal(proposal);
    setApprovalModalOpen(true);
  };

  const handleRejectProposal = (proposalId: string) => {
    setMessages(prev => prev.map(msg => {
      if (!msg.proposals) return msg;
      return {
        ...msg,
        proposals: msg.proposals.map(p => p.id === proposalId ? { ...p, status: "rejected" } : p)
      };
    }));
  };

  const handleConfirmApproval = async (channel: "whatsapp" | "email" | "pdf") => {
    if (!selectedProposal) return;
    setIsApproving(true);

    try {
      const fileName = selectedProposal.fileName || `${selectedProposal.title.replace(/\s+/g, "_")}.pdf`;

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

  const handleGenerateVisitSheetFromLead = (lead: PriorityLead) => {
    const rawPrice = parseFloat(lead.budget.replace(/[^0-9]/g, "")) || 350000;
    const isMuller = lead.name.includes("Müller");
    const doc = generateVisitSheet({
      agencia: {
        nombreAgencia: brandConfig.agencyName,
        cif: brandConfig.fiscalId,
        registroProfesional: brandConfig.apiNumber,
        nombreAgente: "Carlos Martínez (Comercial)"
      },
      visitante: {
        nombreCompleto: lead.name.replace(/\s*\([^)]*\)/, "").trim(),
        dniNie: isMuller ? "Y-8492014-K" : "53891402X",
        telefono: lead.phone,
        email: isMuller ? "sophie.muller@invest-europa.com" : "carlos.romero@familyoffice-madrid.es"
      },
      inmueble: {
        direccion: `Inmueble de interés en ${lead.location}`,
        municipio: lead.location.split("(")[0].trim() || "Madrid",
        referenciaCatastral: lead.location.includes("Tenerife") ? "38001A005001230000TG" : "5432101VK4753B0001TR",
        precioOrientativo: rawPrice,
        tipoOperacion: lead.category.toLowerCase().includes("alquiler") ? "alquiler" : "venta"
      },
      honorarios: {
        porcentajeHonorariosVenta: 3,
        ivaAplicable: 21,
        periodoValidezMeses: 12
      },
      fechaVisita: new Date().toLocaleDateString("es-ES"),
      horaVisita: "12:00"
    });

    const proposal: ActionProposal = {
      id: `prop-visita-${Date.now()}`,
      title: `${doc.title} — ${lead.name}`,
      description: `Hoja de Encargo de Visita generada para ${lead.name} (DNI/NIE: ${isMuller ? "Y-8492014-K" : "53891402X"}). Agente: Carlos Martínez · Fecha: Hoy a las 12:00h · Honorarios: 3% (12 meses de validez).`,
      actionType: "visita",
      status: "pending",
      fileName: `Hoja_Visita_${lead.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      rawContent: doc.sheetText,
      recipientPhone: lead.phone,
      recipientEmail: isMuller ? "sophie.muller@invest-europa.com" : "carlos.romero@familyoffice-madrid.es"
    };

    setPreviewDocData({
      title: doc.title,
      documentType: "visita",
      content: doc.sheetText,
      clientName: lead.name
    });
    setSelectedProposal(proposal);
    setApprovalModalOpen(true);
  };

  const handleGenerateArrasFromLead = (lead: PriorityLead) => {
    const rawPrice = parseFloat(lead.budget.replace(/[^0-9]/g, "")) || 450000;
    const senal = Math.round(rawPrice * 0.10);
    const isMuller = lead.name.includes("Müller");
    const doc = generateArrasContract({
      municipio: lead.location.split("(")[0].trim() || "Madrid",
      fecha: new Date().toLocaleDateString("es-ES"),
      vendedor: {
        nombreCompleto: `Parte Vendedora (en intermediación de ${brandConfig.agencyName})`,
        dniNie: brandConfig.fiscalId,
        domicilio: "Domicilio Social de la Agencia"
      },
      comprador: {
        nombreCompleto: lead.name.replace(/\s*\([^)]*\)/, "").trim(),
        dniNie: isMuller ? "Y-8492014-K" : "53891402X",
        domicilio: lead.location
      },
      inmueble: {
        direccion: `Inmueble en ${lead.location}`,
        referenciaCatastral: lead.location.includes("Tenerife") ? "38001A005001230000TG" : "5432101VK4753B0001TR",
        datosRegistrales: "Finca Registral nº 48.912 del Registro de la Propiedad"
      },
      condiciones: {
        precioTotal: rawPrice,
        importeSenalArras: senal,
        formaPagoSenal: "Transferencia bancaria a cuenta de depósito en garantía",
        plazoMaximoNotaria: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString("es-ES")
      }
    });

    const proposal: ActionProposal = {
      id: `prop-arras-${Date.now()}`,
      title: `${doc.title} (Art. 1454 C.C.) — ${lead.name}`,
      description: `Contrato de Arras Penitenciales conforme al Art. 1454 del Código Civil con señal del 10% (${senal.toLocaleString("es-ES")} €) y plazo notarial de 60 días. Comprador: ${lead.name} · DNI: ${isMuller ? "Y-8492014-K" : "53891402X"}.`,
      actionType: "arras",
      status: "pending",
      fileName: `Contrato_Arras_${lead.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      rawContent: doc.contractText,
      recipientPhone: lead.phone,
      recipientEmail: isMuller ? "sophie.muller@invest-europa.com" : "carlos.romero@familyoffice-madrid.es"
    };

    setPreviewDocData({
      title: doc.title,
      documentType: "arras",
      content: doc.contractText,
      clientName: lead.name
    });
    setSelectedProposal(proposal);
    setApprovalModalOpen(true);
  };

  const handleConvertToPipeline = async (lead: PriorityLead) => {
    const rawPriceNum = parseFloat(lead.budget.replace(/[^0-9]/g, "")) || 450000;
    const isMuller = lead.name.includes("Müller");
    const newCase: PipelineCase = {
      id: `EXP-2026-${String(pipelineCases.length + 1).padStart(3, "0")}`,
      title: `Operación ${lead.name.split(" ")[0]} — ${lead.location}`,
      clientName: lead.name,
      clientDni: isMuller ? "Y-8492014-K" : "53891402X",
      clientPhone: lead.phone,
      clientEmail: isMuller ? "sophie.muller@invest-europa.com" : "carlos.romero@familyoffice-madrid.es",
      price: lead.budget,
      stage: "comercializacion",
      pendingDoc: "Hoja de Visita con Reserva de Honorarios",
      suggestedAction: lead.suggestedPrompt,
      cadastralRef: lead.location.includes("Tenerife") ? "38001A005001230000TG" : "5432101VK4753B0001TR",
      assignedAgent: "Carlos Martínez (Comercial)",
      visitDate: new Date().toLocaleDateString("es-ES"),
      visitTime: "12:00",
      feePercentage: 3,
      validityMonths: 12
    };

    setPipelineCases(prev => [newCase, ...prev]);

    // Actualizar acción sugerida del lead
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, recommendedAction: `Expediente ${newCase.id} en fase de comercialización.` } : l));

    try {
      const tenantHeaders = { 
        "Content-Type": "application/json", 
        "x-tenant-id": brandConfig.tenantId || "inmobia360" 
      };
      await fetch("/api/pipeline", {
        method: "POST",
        headers: tenantHeaders,
        body: JSON.stringify({
          title: newCase.title,
          lead_id: lead.id,
          stage: "comercializacion",
          deal_value: rawPriceNum,
          metadata: { clientName: lead.name, location: lead.location }
        })
      });
      await fetch("/api/leads", {
        method: "PATCH",
        headers: tenantHeaders,
        body: JSON.stringify({ id: lead.id, status: "scheduled" })
      });
    } catch {}

    setActiveTab("pipeline");
  };

  const handleGenerateLegalDocFromPipeline = (
    docType: "visita" | "arras" | "lph" | "acta_llaves",
    pipelineCase: PipelineCase
  ) => {
    const rawPrice = parseFloat(pipelineCase.price.replace(/[^0-9]/g, "")) || 500000;
    let title = "";
    let description = "";
    let content = "";
    let fileName = "";

    if (docType === "visita") {
      const doc = generateVisitSheet({
        agencia: {
          nombreAgencia: brandConfig.agencyName,
          cif: brandConfig.fiscalId,
          registroProfesional: brandConfig.apiNumber,
          nombreAgente: pipelineCase.assignedAgent || "Carlos Martínez (Comercial)"
        },
        visitante: {
          nombreCompleto: pipelineCase.clientName.replace(/\s*\([^)]*\)/, "").trim(),
          dniNie: pipelineCase.clientDni || "Y-8492014-K",
          telefono: pipelineCase.clientPhone || "+34 600 987 654",
          email: pipelineCase.clientEmail || "sophie.muller@invest-europa.com"
        },
        inmueble: {
          direccion: pipelineCase.title,
          municipio: pipelineCase.title.includes("Tenerife") || pipelineCase.title.includes("Adeje") ? "Adeje (Santa Cruz de Tenerife)" : pipelineCase.title.includes("Barcelona") ? "Barcelona" : pipelineCase.title.includes("Valencia") ? "Valencia" : pipelineCase.title.includes("Sevilla") ? "Sevilla" : "Madrid",
          referenciaCatastral: pipelineCase.cadastralRef || "38001A005001230000TG",
          precioOrientativo: rawPrice,
          tipoOperacion: "venta"
        },
        honorarios: {
          porcentajeHonorariosVenta: pipelineCase.feePercentage || 3,
          ivaAplicable: 21,
          periodoValidezMeses: pipelineCase.validityMonths || 12
        },
        fechaVisita: pipelineCase.visitDate || new Date().toLocaleDateString("es-ES"),
        horaVisita: pipelineCase.visitTime || "17:30"
      });
      title = `${doc.title} — ${pipelineCase.id}`;
      description = `Hoja de visita con blindaje de honorarios para el expediente ${pipelineCase.id}. Agente: ${pipelineCase.assignedAgent || "Carlos Martínez"} · Visitante: ${pipelineCase.clientName} (DNI/NIE: ${pipelineCase.clientDni || "Y-8492014-K"}) · Visita: ${pipelineCase.visitDate || "Hoy"} a las ${pipelineCase.visitTime || "17:30"}. Honorarios: ${pipelineCase.feePercentage || 3}% (${pipelineCase.validityMonths || 12} meses validez).`;
      content = doc.sheetText;
      fileName = `Hoja_Visita_${pipelineCase.id}.pdf`;
    } else if (docType === "arras") {
      const senal = Math.round(rawPrice * 0.10);
      const doc = generateArrasContract({
        municipio: pipelineCase.title.includes("Tenerife") || pipelineCase.title.includes("Adeje") ? "Adeje (Santa Cruz de Tenerife)" : pipelineCase.title.includes("Barcelona") ? "Barcelona" : pipelineCase.title.includes("Valencia") ? "Valencia" : pipelineCase.title.includes("Sevilla") ? "Sevilla" : "Madrid",
        fecha: new Date().toLocaleDateString("es-ES"),
        condiciones: {
          precioTotal: rawPrice,
          importeSenalArras: senal,
          formaPagoSenal: "Transferencia bancaria inmediata a cuenta notarial en garantía",
          plazoMaximoNotaria: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString("es-ES")
        },
        comprador: {
          nombreCompleto: pipelineCase.clientName.replace(/\s*\([^)]*\)/, "").trim(),
          dniNie: pipelineCase.clientDni || "24567891B",
          domicilio: "Calle Mayor 12, España"
        },
        vendedor: {
          nombreCompleto: `Parte Vendedora (en intermediación de ${brandConfig.agencyName})`,
          dniNie: brandConfig.fiscalId,
          domicilio: "Domicilio Social de la Agencia"
        },
        inmueble: {
          direccion: pipelineCase.title,
          referenciaCatastral: pipelineCase.cadastralRef || "46900A015000760001BH",
          datosRegistrales: "Finca Registral nº 48.912 del Registro de la Propiedad"
        }
      });
      title = `${doc.title} (Art. 1454 C.C.) — ${pipelineCase.id}`;
      description = `Contrato de Arras Penitenciales con señal del 10% (${senal.toLocaleString("es-ES")} €) para el expediente ${pipelineCase.id}. Comprador: ${pipelineCase.clientName} (DNI/NIE: ${pipelineCase.clientDni || "24567891B"}) · Ref. Catastral: ${pipelineCase.cadastralRef || "46900A015000760001BH"}.`;
      content = doc.contractText;
      fileName = `Contrato_Arras_${pipelineCase.id}.pdf`;
    } else if (docType === "lph") {
      const doc = generateLPHDebtCertificateRequest({
        details: {
          propertyAddress: pipelineCase.title,
          ownerName: pipelineCase.clientName,
          ownerDni: "B-XXXXXXXX",
          monthlyOrdinaryFee: 150,
          administrator: {
            name: "Administración de Fincas Colegiada",
            collegeNumber: "CAF-4402",
            email: "fincas@administracioncolegiada.es",
            phone: "+34 912 345 678"
          }
        },
        requestDate: new Date().toLocaleDateString("es-ES"),
        notaryScheduledDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString("es-ES")
      });
      title = `${doc.title} — ${pipelineCase.id}`;
      description = `Requerimiento formal de Certificado de Corriente de Pago LPH (Art. 9.1.e) para notaría.`;
      content = doc.documentText;
      fileName = `Certificado_LPH_DeudaCero_${pipelineCase.id}.pdf`;
    } else if (docType === "acta_llaves") {
      const doc = generateKeyHandoverAct({
        propertyAddress: pipelineCase.title,
        transferDate: new Date().toLocaleDateString("es-ES"),
        transferType: "compraventa",
        transferor: {
          fullName: "Parte Vendedora",
          dniNie: "12345678Z"
        },
        acquirer: {
          fullName: pipelineCase.clientName,
          dniNie: "87654321A"
        },
        agentName: brandConfig.agencyName,
        agencyName: brandConfig.agencyName,
        keys: {
          mainDoorSets: 3,
          portalSets: 2,
          mailboxKeys: 1,
          storageRoomKeys: 1,
          garageRemotes: 1
        },
        utilities: {
          electricity: {
            serviceType: "electricidad",
            companyName: "Iberdrola Clientes",
            meterNumber: "CONT-EL-9021",
            cups: "ES002100000123456789AB1F",
            readingValue: 14820,
            unit: "kWh"
          },
          water: {
            serviceType: "agua",
            companyName: "Canal de Isabel II",
            meterNumber: "AGUA-8831",
            cups: "ES002200000987654321XY2C",
            readingValue: 342,
            unit: "m³"
          }
        }
      });
      title = `${doc.title} — ${pipelineCase.id}`;
      description = `Acta de Entrega de Llaves, posesión y lectura de contadores con códigos CUPS.`;
      content = `${doc.actText}\n\n=========================================\n${doc.utilityTransferAuthorizationText}`;
      fileName = `Acta_Entrega_Llaves_CUPS_${pipelineCase.id}.pdf`;
    }

    const proposal: ActionProposal = {
      id: `prop-pipe-${docType}-${Date.now()}`,
      title,
      description,
      actionType: docType,
      status: "pending",
      fileName,
      rawContent: content,
      recipientEmail: "operaciones@inmobia360.com"
    };

    setPreviewDocData({
      title,
      documentType: docType === "acta_llaves" ? "llaves" : docType,
      content,
      clientName: pipelineCase.clientName
    });

    setSelectedProposal(proposal);
    setApprovalModalOpen(true);
  };

  const handleGenerateDossierFromCMA = (valuation: CmaValuationOutput) => {
    const proposal: ActionProposal = {
      id: `prop-cma-${Date.now()}`,
      title: `Dossier de Prevaloración ACM — ${valuation.propertyAddress}`,
      description: `Informe profesional de valoración ACM (${valuation.recommendedListingPrice.toLocaleString("es-ES")} € en portales, ${valuation.estimatedClosingPrice.toLocaleString("es-ES")} € en notaría) con análisis de micro-zona y testigos homologados.`,
      actionType: "cma_dossier",
      status: "pending",
      fileName: `Dossier_ACM_${valuation.propertyAddress.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30)}.pdf`,
      rawContent: valuation.dossierReportDraft.content,
      recipientEmail: "propietario@inmueble.com"
    };

    setSelectedProposal(proposal);
    setApprovalModalOpen(true);
  };

  const handleSaveNewProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropForm.title.trim() || !newPropForm.price) return;
    setIsSavingProperty(true);
    try {
      const rawPrice = newPropForm.price.replace(/[. €\s]/g, "");
      const numericPrice = parseFloat(rawPrice) || 250000;
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPropForm.title,
          price: numericPrice,
          location: newPropForm.location,
          bedrooms: Number(newPropForm.bedrooms),
          bathrooms: Number(newPropForm.bathrooms),
          built_area_m2: Number(newPropForm.built_area_m2),
          operation_type: newPropForm.operation_type,
          status: "active",
          walkscore: 88,
          highlights: ["Nueva Captación", "Exclusiva"]
        })
      });
      const data = await res.json();
      if (data.ok && data.data) {
        const newItem: PropertyItem = {
          id: data.data.id || `prop-${Date.now()}`,
          title: data.data.title,
          location: data.data.location,
          address: data.data.location,
          price: data.data.price,
          formattedPrice: `${data.data.price.toLocaleString("es-ES")} €`,
          m2: data.data.built_area_m2 || data.data.m2 || 85,
          rooms: data.data.bedrooms || data.data.rooms || 2,
          baths: data.data.bathrooms || data.data.baths || 1,
          status: "disponible",
          type: data.data.operation_type === "rent" ? "Alquiler" : "Venta",
          description: `Inmueble captado recientemente en ${data.data.location}. Exclusiva verificada.`,
          coordinates: { lat: 40.4168, lng: -3.7038 },
          imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
        };
        setProperties(prev => [newItem, ...prev]);
        setNewPropertyModalOpen(false);
        setNewPropForm({
          title: "",
          price: "",
          location: "Madrid",
          bedrooms: 2,
          bathrooms: 1,
          built_area_m2: 85,
          operation_type: "sale"
        });
        setActiveTab("properties");
      }
    } catch {
      alert("Error al guardar la propiedad en la base de datos.");
    } finally {
      setIsSavingProperty(false);
    }
  };

  const handleDashboardQuickAction = (target: "properties" | "cma" | "content" | "leads") => {
    if (target === "properties") {
      setNewPropertyModalOpen(true);
    } else {
      setActiveTab(target);
    }
  };

  const handleTriggerBroker = (promptText: string) => {
    setActiveTab("chat");
    handleSendMessage(promptText);
  };

  const handleOpenShare = (prop: PropertyItem) => {
    setSelectedPropertyToShare(prop);
    setShareModalOpen(true);
  };

  const handlePropertyAction = (actionType: "chat" | "cma" | "content" | "share", property: PropertyItem) => {
    if (actionType === "share") {
      handleOpenShare(property);
    } else if (actionType === "cma") {
      setSelectedPropertyForCMA(property);
      setActiveTab("cma");
    } else if (actionType === "content") {
      setActiveTab("content");
    } else {
      setActiveTab("chat");
      handleSendMessage(`Analizar el expediente del inmueble ${property.title} ubicado en ${property.location} por ${property.formattedPrice}.`);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {/* SIDEBAR BLANCA IDÉNTICA A LA DEMO inmobia360.com */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 shadow-xs">
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Cabecera con Logotipo Oficial Inmobia 360 */}
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <BrandLogo size="md" showSubtitle={true} subtitleText="AI BROKER OS" />
          </div>

          {/* Botón "+ Nueva Propiedad" Naranja */}
          <div className="p-4">
            <button
              onClick={() => setNewPropertyModalOpen(true)}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nueva Propiedad
            </button>
          </div>

          {/* Menú de Navegación Estructurado */}
          <nav className="px-3 space-y-5 text-xs flex-1">
            {/* GRUPO 1: GESTIÓN COMERCIAL */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                GESTIÓN COMERCIAL
              </div>
              <div className="space-y-0.5">
                <button 
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                    activeTab === "dashboard" 
                      ? "bg-slate-100 text-slate-900 font-bold" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-slate-600" />
                  Panel General
                </button>

                <button 
                  onClick={() => setActiveTab("properties")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium ${
                    activeTab === "properties" 
                      ? "bg-slate-100 text-slate-900 font-bold" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-slate-600" />
                    Propiedades & Mapa
                  </div>
                  <span className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                    {properties.length} {properties.length === 1 ? "activa" : "activas"}
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab("leads")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium ${
                    activeTab === "leads" 
                      ? "bg-slate-100 text-slate-900 font-bold" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-slate-600" />
                    Contactos & Visitas
                  </div>
                  <span className="text-[11px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    {leads.length} {leads.length === 1 ? "contacto" : "contactos"}
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab("pipeline")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium ${
                    activeTab === "pipeline" 
                      ? "bg-slate-100 text-slate-900 font-bold" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FolderKanban className="w-4 h-4 text-slate-600" />
                    Pipeline (7 Fases)
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                    Kanban
                  </span>
                </button>
              </div>
            </div>

            {/* GRUPO 2: INTELIGENCIA ARTIFICIAL & SERVICIOS */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                INTELIGENCIA ARTIFICIAL
              </div>
              <div className="space-y-0.5">
                <button 
                  onClick={() => setActiveTab("content")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium ${
                    activeTab === "content" 
                      ? "bg-slate-100 text-slate-900 font-bold" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Redactor de Anuncios
                  </div>
                  <span className="text-[10px] bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                    Idealista & Redes
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab("cma")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium ${
                    activeTab === "cma" 
                      ? "bg-slate-100 text-slate-900 font-bold" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    Tasador ACM
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                    3D & Catastro
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab("legal")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium ${
                    activeTab === "legal" 
                      ? "bg-slate-100 text-slate-900 font-bold" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    LPH & Postventa
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                    Llaves / CUPS
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab("chat")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium ${
                    activeTab === "chat" 
                      ? "bg-slate-100 text-slate-900 font-bold" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    Director BROKER
                  </div>
                  <span className="text-[10px] bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                    Asistente
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab("docs")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium ${
                    activeTab === "docs" 
                      ? "bg-slate-100 text-slate-900 font-bold" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-600" />
                    Bóveda Documental
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                    {vaultDocs.length}
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                    activeTab === "settings" 
                      ? "bg-slate-100 text-slate-900 font-bold" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-600" />
                  Configuración & Marca
                </button>
              </div>
            </div>
          </nav>

          {/* Footer Sidebar idéntico a demo */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[11px] font-bold">
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md">ES</span>
                <span className="px-2 py-0.5 text-slate-500">EN</span>
              </div>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors">
                <Moon className="w-4 h-4" />
              </button>
            </div>

            <a 
              href="https://inmobia360.com/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center justify-between"
            >
              <span>Ver Landing Pública</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {brandConfig.agencyName.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {brandConfig.agencyName}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {brandConfig.apiNumber || 'Agencia Colegiada'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
        {/* Cabecera Superior Blanca con Título y Estado */}
        <header className="h-18 border-b border-slate-200/80 bg-white flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              Bienvenido, Equipo de {brandConfig.agencyName}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Panel de control de {brandConfig.agencyName} {brandConfig.apiNumber ? `· Colegiado: ${brandConfig.apiNumber}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOnboardingModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/80 rounded-xl text-xs font-bold transition shadow-xs"
              title="Configurar perfil de agencia, marca blanca y colegiación"
            >
              <Settings className="w-3.5 h-3.5 text-orange-600" />
              <span>Mi Agencia</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Plataforma Activa</span>
            </div>
            <button
              onClick={() => {
                if (properties.length > 0 || leads.length > 0) {
                  setProperties([]);
                  setLeads([]);
                  if (typeof window !== "undefined") localStorage.setItem("inmobia360_clean_portfolio", "true");
                } else {
                  setProperties(DEMO_PROPERTIES);
                  setLeads(PRIORITY_LEADS);
                  if (typeof window !== "undefined") localStorage.removeItem("inmobia360_clean_portfolio");
                }
              }}
              className="px-2.5 py-1 text-[11px] rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold transition"
              title="Alternar entre Cartera Limpia y Datos de Plantilla"
            >
              {properties.length > 0 ? "Limpiar Plantilla" : "Cargar Plantilla"}
            </button>
            <button className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <Moon className="w-4 h-4" />
            </button>
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-bold text-slate-600">
              <span className="px-2 py-0.5 bg-white text-slate-900 rounded-md shadow-xs">ES</span>
              <span className="px-2 py-0.5 text-slate-400">EN</span>
            </div>
            <button className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5"></span>
            </button>

            {/* Monitor de Salud Cognitivo */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs">
              <span className={`w-2 h-2 rounded-full ${health?.ok ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
              <span className="text-slate-700 font-medium">
                {health?.provider ? health.provider.replace("Hostinger Ollama", "Ollama Hostinger") : "Conectando..."}
              </span>
              {health?.latencyMs ? (
                <span className="text-[10px] text-slate-400 font-mono">({health.latencyMs} ms)</span>
              ) : null}
              <button
                onClick={fetchHealth}
                disabled={isCheckingHealth}
                className="text-slate-400 hover:text-slate-700 transition-colors"
                title="Actualizar estado del motor"
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingHealth ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </header>

        {/* CONTENIDO SEGÚN PESTAÑA ACTIVA */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* 1. PANEL GENERAL (DASHBOARD) - IDÉNTICO A inmobia360.com/app/dashboard/ */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Banner de Bienvenida y Activación de Marca de la Agencia */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200/90 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Personaliza {brandConfig.agencyName} con tu Identidad y Colegiación
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                      Configura tu nombre comercial, logotipo, teléfono y número colegiado API para que todas tus hojas de visita, contratos de arras y landings públicas salgan con tu propia marca.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setOnboardingModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Configurar mi Agencia</span>
                  </button>
                </div>
              </div>

              <MetricCards 
                onQuickAction={handleDashboardQuickAction}
                propertiesCount={properties.length}
                leadsCount={leads.length}
                hotLeadsCount={leads.filter(l => l.score >= 80).length}
                newLeadsCount={leads.filter(l => l.timeframe === "Ahora" || l.timeframe === "immediate").length}
                viewsCount={properties.length > 0 ? (properties.length * 680 + leads.length * 15) : 0}
              />
              
              <PriorityLeadsWidget 
                leads={leads}
                onTriggerBrokerAction={handleTriggerBroker}
                onOpenAllLeads={() => setActiveTab("leads")}
                onGenerateVisitSheet={handleGenerateVisitSheetFromLead}
                onGenerateArrasContract={handleGenerateArrasFromLead}
                onConvertToPipeline={handleConvertToPipeline}
              />

              {/* Bloque: Propiedades Recientes en Cartera */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">
                    Propiedades Recientes en Cartera
                  </h2>
                  <button 
                    onClick={() => setActiveTab("properties")}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    Ver todas las propiedades ({properties.length})
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {properties.slice(0, 3).map(property => (
                    <div 
                      key={property.id}
                      onClick={() => setActiveTab("properties")}
                      className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer group shadow-xs"
                    >
                      <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                        <img 
                          src={property.imageUrl} 
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-3 left-3 text-base font-extrabold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg">
                          {property.formattedPrice}
                        </span>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <div className="text-[11px] text-blue-600 font-semibold truncate">
                          {property.location}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {property.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {property.description}
                        </p>
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
              <PropertyCatalog 
                properties={properties}
                onSelectPropertyAction={handlePropertyAction} 
                onOpenNewPropertyModal={() => setNewPropertyModalOpen(true)}
                onOpenShareModal={handleOpenShare}
              />
            </div>
          )}

          {/* 3. CONTACTOS & LEADS */}
          {activeTab === "leads" && (
            <div className="max-w-7xl mx-auto space-y-6">
              <PriorityLeadsWidget 
                leads={leads}
                onTriggerBrokerAction={handleTriggerBroker}
                onGenerateVisitSheet={handleGenerateVisitSheetFromLead}
                onGenerateArrasContract={handleGenerateArrasFromLead}
                onConvertToPipeline={handleConvertToPipeline}
              />
            </div>
          )}

          {/* 4. PIPELINE KANBAN (7 FASES) */}
          {activeTab === "pipeline" && (
            <div className="max-w-7xl mx-auto">
              <InteractivePipeline 
                cases={pipelineCases}
                onCasesChange={setPipelineCases}
                onExecuteBrokerCase={handleTriggerBroker}
                onGenerateLegalDoc={handleGenerateLegalDocFromPipeline}
              />
            </div>
          )}

          {/* 5. TASADOR ACM INTERACTIVO */}
          {activeTab === "cma" && (
            <div className="max-w-7xl mx-auto">
              <InteractiveCMA 
                key={selectedPropertyForCMA?.id || "default-cma"}
                initialAddress={selectedPropertyForCMA ? `${selectedPropertyForCMA.address || selectedPropertyForCMA.title}, ${selectedPropertyForCMA.location}` : "Calle Serrano 45, Barrio de Salamanca, Madrid"}
                initialM2={selectedPropertyForCMA ? selectedPropertyForCMA.m2 : 120}
                initialPrice={selectedPropertyForCMA ? selectedPropertyForCMA.price : undefined}
                onGenerateDossier={handleTriggerBroker}
                onOpenOfficialDossier={handleGenerateDossierFromCMA}
                agencyName={brandConfig.agencyName}
                apiNumber={brandConfig.apiNumber}
                fiscalId={brandConfig.fiscalId}
              />
            </div>
          )}

          {/* 6. REDACTOR DE CONTENIDOS IA */}
          {activeTab === "content" && (
            <div className="max-w-7xl mx-auto">
              <ContentStudioAI 
                onSendToBroker={handleTriggerBroker} 
                propertiesList={properties}
              />
            </div>
          )}

          {/* 7. LPH Y POSTVENTA FÍSICA */}
          {activeTab === "legal" && (
            <div className="max-w-7xl mx-auto">
              <LegalPostventaModule onRequestApproval={handleOpenApprovalModal} />
            </div>
          )}

          {/* 8. CONSOLA DIRECTOR BROKER */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto">
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 shrink-0">
                <button 
                  onClick={() => handleSendMessage("Redactar un contrato de arras penitenciales según el artículo 1454 del Código Civil español para el piso de Alcalá por 420.000 € y 42.000 € de señal")}
                  className="text-xs bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Arras Penitenciales (Art. 1454 C.C.)
                </button>
                <button 
                  onClick={() => handleSendMessage("Preparar requerimiento formal de certificado de deuda cero al Administrador de Fincas según el Art. 9.1.e LPH")}
                  className="text-xs bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs font-medium"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Certificado LPH Art. 9.1.e
                </button>
                <button 
                  onClick={() => handleSendMessage("Generar acta de entrega de llaves y lectura de contadores con código CUPS para posesión notarial")}
                  className="text-xs bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs font-medium"
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  Acta de Llaves y CUPS
                </button>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((m) => (
                  <div 
                    key={m.id} 
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div 
                      className={`max-w-2xl px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                        m.sender === "user" 
                          ? "bg-blue-600 text-white rounded-br-none shadow-xs" 
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                        <span>{m.provider ? `Motor: ${m.provider}` : ""}</span>
                        <span>{m.timestamp}</span>
                      </div>
                    </div>

                    {/* Tarjetas de Propuesta de Acción Human-in-the-Loop */}
                    {m.proposals && m.proposals.length > 0 && (
                      <div className="mt-2 space-y-2 w-full max-w-2xl">
                        {m.proposals.map(prop => (
                          <div key={prop.id} className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <div className="text-xs font-bold text-amber-900">{prop.title}</div>
                                <div className="text-xs text-amber-800/80 mt-0.5">{prop.description}</div>
                                <div className="mt-1 text-[10px] text-amber-700 font-medium">
                                  Modo Borrador Seguro: Requiere autorización humana
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {prop.status === "pending" ? (
                                <>
                                  <button 
                                    onClick={() => handleOpenApprovalModal(prop)}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Aprobar y Enviar
                                  </button>
                                  <button 
                                    onClick={() => handleRejectProposal(prop.id)}
                                    className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs transition-colors"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : prop.status === "approved" ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Autorizado
                                  </span>
                                  {prop.fileName && (
                                    <button 
                                      onClick={() => handleDownloadDoc(prop.fileName!, prop.rawContent)}
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      Descargar PDF
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-rose-100 text-rose-700">
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
                  <div className="flex items-center gap-3 text-xs text-blue-700 bg-blue-50 p-3.5 rounded-2xl max-w-md border border-blue-200 animate-pulse shadow-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                    <span>{thinkingStep || "Director BROKER analizando..."}</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="mt-4 flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm shrink-0">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Formula una consulta legal, pide redactar contratos o auditar contingencias al Director BROKER..."
                  className="flex-1 bg-transparent px-3 text-sm text-slate-800 placeholder-slate-400 outline-none"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 9. BÓVEDA DOCUMENTAL */}
          {activeTab === "docs" && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Bóveda Documental Segura</h2>
                <p className="text-xs text-slate-500">Documentos oficiales generados, autorizados por el agente y custodiados con cifrado</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vaultDocs.map(doc => (
                  <div key={doc.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:shadow-md transition-all shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{doc.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {doc.size} · {doc.date} · <span className="text-emerald-600 font-semibold">{doc.status}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Canal: {doc.channel}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadDoc(doc.name)}
                      className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-colors"
                      title="Descargar documento legal"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2 bg-white/60">
                <FileCheck className="w-10 h-10 text-slate-400 mx-auto" />
                <div className="text-sm text-slate-700 font-bold">Bóveda con aislamiento estricto RLS ({brandConfig.tenantId})</div>
                <div className="text-xs text-slate-400">Los documentos originales están custodiados con cifrado en reposo</div>
              </div>
            </div>
          )}

          {/* 10. CONFIGURACIÓN & MARCA BLANCA Y PLAZAS */}
          {activeTab === "settings" && (
            <div className="max-w-7xl mx-auto space-y-8">
              <WhiteLabelSettings 
                initialConfig={brandConfig}
                onSaveConfig={handleSaveBrandConfig}
              />
              <div className="pt-4 border-t border-slate-200">
                <TeamSeatsManager 
                  agencyName={brandConfig.agencyName}
                  planType="boutique"
                  maxSeats={5}
                />
              </div>
              <div className="pt-4 border-t border-slate-200">
                <NotificationSettingsPanel 
                  agencyName={brandConfig.agencyName}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL HUMAN-IN-THE-LOOP */}
      {selectedProposal && (
        <DraftApprovalModal
          isOpen={approvalModalOpen}
          proposal={selectedProposal}
          onClose={() => setApprovalModalOpen(false)}
          onConfirmApproval={handleConfirmApproval}
          onPreviewOfficialDocument={() => setPreviewDocModalOpen(true)}
          isLoading={isApproving}
        />
      )}

      {/* VISOR E IMPRESIÓN DE DOCUMENTO LEGAL OFICIAL CON FIRMA */}
      {previewDocData && (
        <DocumentPreviewModal
          isOpen={previewDocModalOpen}
          onClose={() => setPreviewDocModalOpen(false)}
          title={previewDocData.title}
          documentType={previewDocData.documentType}
          content={previewDocData.content}
          agencyName={brandConfig.agencyName}
          associationNumber={brandConfig.apiNumber}
          taxId={brandConfig.fiscalId}
          clientName={previewDocData.clientName}
          clientDni={previewDocData.clientDni}
        />
      )}

      {/* MODAL NUEVA PROPIEDAD */}
      {newPropertyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-orange-50 text-orange-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Nueva Propiedad en Cartera</h3>
                  <p className="text-xs text-slate-400">Persistencia real en base de datos PostgreSQL</p>
                </div>
              </div>
              <button 
                onClick={() => setNewPropertyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewProperty} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título de la Propiedad</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ático Reformado con Terraza en Chamberí"
                  value={newPropForm.title}
                  onChange={e => setNewPropForm({...newPropForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Precio (€)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 450.000"
                    value={newPropForm.price}
                    onChange={e => setNewPropForm({...newPropForm, price: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ubicación / Ciudad</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Chamberí, Madrid"
                    value={newPropForm.location}
                    onChange={e => setNewPropForm({...newPropForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Superficie (m²)</label>
                  <input
                    type="number"
                    value={newPropForm.built_area_m2}
                    onChange={e => setNewPropForm({...newPropForm, built_area_m2: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dormitorios</label>
                  <input
                    type="number"
                    value={newPropForm.bedrooms}
                    onChange={e => setNewPropForm({...newPropForm, bedrooms: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Baños</label>
                  <input
                    type="number"
                    value={newPropForm.bathrooms}
                    onChange={e => setNewPropForm({...newPropForm, bathrooms: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Operación</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPropForm({...newPropForm, operation_type: "sale"})}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                      newPropForm.operation_type === "sale"
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Venta
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPropForm({...newPropForm, operation_type: "rent"})}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                      newPropForm.operation_type === "rent"
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Alquiler
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewPropertyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProperty}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  {isSavingProperty ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Guardar Inmueble
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Difusión y Compartir con QR Dinámico */}
      <ShareModal
        property={selectedPropertyToShare}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        agencyName={brandConfig.agencyName}
      />

      {/* Modal de Onboarding y Configuración de Agencia */}
      <AgentOnboardingModal
        isOpen={onboardingModalOpen}
        onClose={() => setOnboardingModalOpen(false)}
        currentConfig={brandConfig}
        onSave={handleSaveBrandConfig}
      />
    </div>
  );
}

