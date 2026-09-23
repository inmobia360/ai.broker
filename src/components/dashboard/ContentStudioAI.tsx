"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  FileText, 
  MessageSquare, 
  Send,
  Building2
} from "lucide-react";
import { DEMO_PROPERTIES } from "./PropertyCatalog";

function formatPortalDescription(prop: typeof DEMO_PROPERTIES[0]): string {
  return `OPORTUNIDAD EXCLUSIVA: ${prop.title.toUpperCase()}

Ubicación inmejorable en ${prop.location}.

Presentamos en comercialización este magnífico activo inmobiliario con una superficie construida de ${prop.m2} m², distribuido en ${prop.rooms} dormitorios dobles y ${prop.baths} cuartos de baño completos.

CARACTERÍSTICAS PRINCIPALES:
• Superficie: ${prop.m2} m² construidos.
• Precio: ${prop.formattedPrice} (${Math.round(prop.price / prop.m2)} €/m²).
• Tipología: ${prop.type}.
• Estado: ${prop.description}

DOTACIONES Y ENTORNO INMEDIATO (A PIE):
- Transporte público (Metro / Cercanías): a menos de 5 minutos a pie.
- Colegios e institutos de referencia en el barrio.
- Centros de salud, farmacias y comercio de proximidad.
- Parques y zonas verdes para el esparcimiento familiar.

Inmueble con documentación auditada y listo para escrituración notarial.
Para más información o coordinar una visita personalizada, contacte con nuestro equipo de asesores.`;
}

interface ContentStudioAIProps {
  onSendToBroker: (prompt: string) => void;
}

export const ContentStudioAI: React.FC<ContentStudioAIProps> = ({ onSendToBroker }) => {
  const [selectedPropId, setSelectedPropId] = useState(DEMO_PROPERTIES[0].id);
  const [channel, setChannel] = useState<"portal" | "social" | "whatsapp">("portal");
  const [copied, setCopied] = useState(false);

  const selectedProperty = DEMO_PROPERTIES.find(p => p.id === selectedPropId) || DEMO_PROPERTIES[0];

  // Generar copys multicanal
  const generatedCopyPortal = formatPortalDescription(selectedProperty);

  const generatedSocialCopy = `✨ EXCLUSIVA INMOBILIARIA EN ${selectedProperty.location.toUpperCase()} ✨

Descubre este espectacular ${selectedProperty.title.toLowerCase()}.
📍 ${selectedProperty.address}
💰 ${selectedProperty.formattedPrice}
📐 ${selectedProperty.m2} m² | 🛏️ ${selectedProperty.rooms} hab | 🛁 ${selectedProperty.baths} baños

${selectedProperty.description}

🌟 Dotaciones clave a pie:
• Transporte público a 4 min
• Zonas verdes y colegios a menos de 6 min

📲 Contáctanos por privado o WhatsApp para concertar tu visita privada antes de su publicación general en portales.

#InmobiliariaEspaña #PropiedadesExclusivas #BienesRaices #InversionInmobiliaria #${selectedProperty.location.split("/")[0].trim().replace(/\s+/g, "")}`;

  const generatedWhatsAppCopy = `Hola, te comparto en primicia la ficha técnica de este nuevo activo en cartera:

*${selectedProperty.title}*
📍 ${selectedProperty.location}
💶 Precio: ${selectedProperty.formattedPrice}
📐 Superficie: ${selectedProperty.m2} m² (${selectedProperty.rooms} hab. / ${selectedProperty.baths} baños)

${selectedProperty.description}

Dossier y fotos en alta resolución disponibles. Si encaja con tus criterios de búsqueda, dime y agendamos una visita privada esta misma semana.`;

  const currentCopy = channel === "portal" 
    ? generatedCopyPortal 
    : channel === "social" 
    ? generatedSocialCopy 
    : generatedWhatsAppCopy;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Estudio de Contenidos IA & Generador de Anuncios
          </h2>
          <p className="text-xs text-slate-400">
            Redacción omnicanal persuasiva y adaptada a la legislación española para portales y redes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selector de Inmueble y Canal (4 columnas) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Inmueble a Promocionar
            </label>
            <div className="mt-2 space-y-2">
              {DEMO_PROPERTIES.map(prop => (
                <button
                  key={prop.id}
                  onClick={() => setSelectedPropId(prop.id)}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-3 ${
                    selectedPropId === prop.id 
                      ? "bg-blue-600/20 border-blue-500/40 text-white" 
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <img src={prop.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="overflow-hidden">
                    <div className="font-semibold truncate">{prop.title}</div>
                    <div className="text-[10px] text-emerald-400">{prop.formattedPrice} · {prop.m2} m²</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Canal de Publicación
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                onClick={() => setChannel("portal")}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  channel === "portal" 
                    ? "bg-purple-600/20 border-purple-500 text-purple-300" 
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Portales</span>
              </button>
              <button
                onClick={() => setChannel("social")}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  channel === "social" 
                    ? "bg-purple-600/20 border-purple-500 text-purple-300" 
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>Redes</span>
              </button>
              <button
                onClick={() => setChannel("whatsapp")}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  channel === "whatsapp" 
                    ? "bg-purple-600/20 border-purple-500 text-purple-300" 
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Visor y Editor del Copy Generado (8 columnas) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                  {channel === "portal" ? "Idealista / Fotocasa / Habitaclia" : channel === "social" ? "Redes Sociales & Copywriting" : "Prospección Directa WhatsApp"}
                </span>
                <span className="text-xs text-slate-400">· {selectedProperty.title}</span>
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "¡Copiado!" : "Copiar Texto"}
              </button>
            </div>

            <textarea
              readOnly
              value={currentCopy}
              rows={14}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-sans text-slate-200 leading-relaxed outline-none resize-none focus:border-purple-500/40"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">
              Generado con el motor cognitivo de IA normativo en español peninsular
            </span>
            <button
              onClick={() => onSendToBroker(`Reescribir el anuncio de ${selectedProperty.title} con un enfoque exclusivo para inversores de alta rentabilidad patrimonial.`)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Pedir Ajuste al Director BROKER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
