"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  FileText, 
  MessageSquare, 
  Send,
  Video,
  TrendingUp,
  Globe,
  Camera,
  Users,
  RefreshCw,
  Loader2,
  Building2
} from "lucide-react";
import { DEMO_PROPERTIES, PropertyItem } from "./PropertyCatalog";
import { RealEstateAIEngine, MarketingContentPack } from "@/lib/ai/realEstateAIEngine";
import { AIWritingAdvisor } from "@/components/ui/AIWritingAdvisor";

export type ChannelKey = 
  | "portal"
  | "short"
  | "long"
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "video"
  | "investor"
  | "international"
  | "english";

interface ContentStudioAIProps {
  onSendToBroker: (prompt: string) => void;
  propertiesList?: PropertyItem[];
}

export const ContentStudioAI: React.FC<ContentStudioAIProps> = ({ 
  onSendToBroker,
  propertiesList = DEMO_PROPERTIES
}) => {
  const [selectedPropId, setSelectedPropId] = useState(propertiesList[0]?.id || DEMO_PROPERTIES[0].id);
  const [activeChannel, setActiveChannel] = useState<ChannelKey>("portal");
  const [copied, setCopied] = useState(false);
  const [isGeneratingOllama, setIsGeneratingOllama] = useState(false);
  const [generatedPack, setGeneratedPack] = useState<MarketingContentPack | null>(null);
  const [currentText, setCurrentText] = useState("");

  const selectedProperty = propertiesList.find(p => p.id === selectedPropId) || propertiesList[0] || DEMO_PROPERTIES[0];

  // Generación inicial determinista
  useEffect(() => {
    if (selectedProperty) {
      RealEstateAIEngine.generateMarketingPack({
        title: selectedProperty.title,
        price: selectedProperty.price,
        location: selectedProperty.location,
        builtM2: selectedProperty.m2,
        bedrooms: selectedProperty.rooms,
        bathrooms: selectedProperty.baths,
        propertyType: selectedProperty.type,
        cadastralRef: selectedProperty.cadastralRef,
        description: selectedProperty.description
      }).then(pack => {
        setGeneratedPack(pack);
      });
    }
  }, [selectedProperty]);

  // Actualizar el texto editable cuando cambia el canal activo o el pack
  useEffect(() => {
    if (!generatedPack) return;

    let text = "";
    switch (activeChannel) {
      case "portal":
        text = `${generatedPack.commercialTitle}\n\n${generatedPack.longDescription}`;
        break;
      case "short":
        text = generatedPack.shortDescription;
        break;
      case "long":
        text = generatedPack.longDescription;
        break;
      case "instagram":
        text = generatedPack.instagramCopy;
        break;
      case "facebook":
        text = generatedPack.facebookCopy;
        break;
      case "whatsapp":
        text = generatedPack.whatsappMessage;
        break;
      case "video":
        text = generatedPack.videoScript;
        break;
      case "investor":
        text = generatedPack.investorAngle;
        break;
      case "international":
        text = generatedPack.foreignBuyerAngle;
        break;
      case "english":
        text = generatedPack.translatedEn;
        break;
    }
    setCurrentText(text);
  }, [activeChannel, generatedPack]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateOllama = async () => {
    if (!selectedProperty) return;
    setIsGeneratingOllama(true);

    try {
      const res = await fetch('/api/ai/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property: {
            title: selectedProperty.title,
            price: selectedProperty.price,
            location: selectedProperty.location,
            builtM2: selectedProperty.m2,
            bedrooms: selectedProperty.rooms,
            bathrooms: selectedProperty.baths,
            propertyType: selectedProperty.type,
            cadastralRef: selectedProperty.cadastralRef,
            description: selectedProperty.description
          },
          useOllama: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.pack) {
          setGeneratedPack(data.pack);
        }
      }
    } catch (err) {
      console.error('Error generando con Ollama:', err);
    } finally {
      setIsGeneratingOllama(false);
    }
  };

  const channels: { key: ChannelKey; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: "portal", label: "Ficha Portales", icon: <FileText className="w-3.5 h-3.5" />, badge: "Idealista" },
    { key: "short", label: "Ficha Corta", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: "long", label: "Memoria Larga", icon: <FileText className="w-3.5 h-3.5" /> },
    { key: "instagram", label: "Instagram", icon: <Camera className="w-3.5 h-3.5" />, badge: "Viral" },
    { key: "facebook", label: "LinkedIn / B2B", icon: <Users className="w-3.5 h-3.5" /> },
    { key: "whatsapp", label: "WhatsApp VIP", icon: <MessageSquare className="w-3.5 h-3.5" />, badge: "Directo" },
    { key: "video", label: "Guión Reels / TikTok", icon: <Video className="w-3.5 h-3.5" /> },
    { key: "investor", label: "Ángulo Inversor", icon: <TrendingUp className="w-3.5 h-3.5" />, badge: "Cap Rate" },
    { key: "international", label: "Internacional (Golden Visa)", icon: <Globe className="w-3.5 h-3.5" /> },
    { key: "english", label: "Inglés Bilingüe", icon: <Globe className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Cabecera del Estudio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Estudio de Contenidos IA & Redactor Multicanal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generación contextualizada sin alucinaciones para 10 canales comerciales con motor Ollama VPS y asesor de estilo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPropId}
            onChange={(e) => setSelectedPropId(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500"
          >
            {propertiesList.map(prop => (
              <option key={prop.id} value={prop.id}>
                {prop.title.substring(0, 36)}... ({prop.formattedPrice})
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerateOllama}
            disabled={isGeneratingOllama}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 shadow-xs"
          >
            {isGeneratingOllama ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
                Inferencia Ollama...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
                Re-generar con Ollama
              </>
            )}
          </button>
        </div>
      </div>

      {/* Selector de Canales (10 formatos) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {channels.map((chan) => (
          <button
            key={chan.key}
            onClick={() => setActiveChannel(chan.key)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 border shrink-0 ${
              activeChannel === chan.key
                ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {chan.icon}
            <span>{chan.label}</span>
            {chan.badge && (
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                activeChannel === chan.key ? "bg-white/20 text-white" : "bg-orange-100 text-orange-700"
              }`}>
                {chan.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Editor de Contenido con Asesor Ortográfico */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              {channels.find(c => c.key === activeChannel)?.label}
            </span>
            {generatedPack?.generatedBy === 'ollama' && (
              <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Potenciado por Ollama VPS
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "¡Copiado!" : "Copiar Texto"}
            </button>
            <button
              onClick={() => onSendToBroker(`Revisa y optimiza este copy para ${activeChannel}:\n\n${currentText}`)}
              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              Consultar con Director BROKER
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <textarea
            rows={12}
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            className="w-full text-xs text-slate-800 leading-relaxed font-sans border border-slate-200 rounded-xl p-4 bg-slate-50/30 focus:bg-white focus:border-orange-500 focus:outline-none transition resize-y"
          />

          {/* Asesor de Redacción en Tiempo Real */}
          <AIWritingAdvisor
            text={currentText}
            onApplyCorrection={(newText) => setCurrentText(newText)}
            language={activeChannel === "english" || activeChannel === "international" ? "en" : "es"}
          />
        </div>
      </div>
    </div>
  );
};
