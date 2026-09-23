'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Wand2, ArrowRight } from 'lucide-react';

export interface AIWritingAdvisorProps {
  text: string;
  onApplyCorrection: (correctedText: string) => void;
  language?: 'es' | 'en';
  className?: string;
}

export interface GrammarSuggestion {
  original: string;
  replacement: string;
  reason: string;
}

export const AIWritingAdvisor: React.FC<AIWritingAdvisorProps> = ({
  text,
  onApplyCorrection,
  language = 'es',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Reglas ortográficas y de estilo inmobiliario profesional
  const suggestions: GrammarSuggestion[] = useMemo(() => {
    if (!text || text.length < 4) return [];
    const result: GrammarSuggestion[] = [];

    if (language === 'es') {
      const spanishRules: [RegExp, string, string][] = [
        [/\batico\b/gi, 'ático', 'Falta la tilde ortográfica en la vocal esdrújula.'],
        [/\bduplex\b/gi, 'dúplex', 'Requiere tilde por ser palabra llana terminada en x.'],
        [/\bano\b/gi, 'año', 'Se recomienda corregir por "año" para evitar ambigüedades.'],
        [/\bsalon\b/gi, 'salón', 'Palabra aguda terminada en n requiere tilde.'],
        [/\bjardin\b/gi, 'jardín', 'Palabra aguda terminada en n requiere tilde.'],
        [/\bcalefaccion\b/gi, 'calefacción', 'Palabra aguda terminada en n requiere tilde.'],
        [/\bgarantia\b/gi, 'garantía', 'Contiene hiato acentual (í-a).'],
        [/\bproximo\b/gi, 'próximo', 'Palabra esdrújula requiere tilde.'],
        [/\bubicacion\b/gi, 'ubicación', 'Palabra aguda terminada en n requiere tilde.'],
        [/\bhabitacion\b/gi, 'habitación', 'Palabra aguda terminada en n requiere tilde.'],
        [/\bhabitaciones\b/gi, 'habitaciones', 'Habitaciones se escribe sin tilde.'],
        [/\binversion\b/gi, 'inversión', 'Palabra aguda terminada en n requiere tilde.'],
        [/\bbanos\b/gi, 'baños', 'Corrección de carácter "ñ".'],
        [/\bluminoso y acogedor\b/gi, 'con abundante luz natural y acabados de alta gama', 'Sugerencia de estilo: Evita clichés inmobiliarios para aumentar la conversión.'],
        [/\boportunidad unica\b/gi, 'oportunidad exclusiva', 'Sugerencia B2B: Tono más profesional para inversores.']
      ];

      spanishRules.forEach(([regex, replacement, reason]) => {
        if (regex.test(text)) {
          const match = text.match(regex);
          if (match) {
            result.push({ original: match[0], replacement, reason });
          }
        }
      });
    } else {
      const englishRules: [RegExp, string, string][] = [
        [/\bappartment\b/gi, 'apartment', 'Corrección ortográfica en inglés.'],
        [/\bbalcon\b/gi, 'balcony', 'Término en inglés para balcón.'],
        [/\bterrace\b/gi, 'terrace', 'Ortografía correcta.'],
        [/\bcozy\b/gi, 'well-proportioned with premium finishes', 'Sugerencia de estilo B2B: Reemplaza "cozy" por un enfoque más profesional.']
      ];

      englishRules.forEach(([regex, replacement, reason]) => {
        if (regex.test(text)) {
          const match = text.match(regex);
          if (match) {
            result.push({ original: match[0], replacement, reason });
          }
        }
      });
    }

    return result;
  }, [text, language]);

  const handleApply = (suggestion: GrammarSuggestion) => {
    // Reemplazo exacto respetando mayúsculas iniciales si procede
    const regex = new RegExp(`\\b${suggestion.original}\\b`, 'gi');
    const newText = text.replace(regex, suggestion.replacement);
    onApplyCorrection(newText);
  };

  const handleApplyAll = () => {
    let current = text;
    suggestions.forEach(s => {
      const regex = new RegExp(`\\b${s.original}\\b`, 'gi');
      current = current.replace(regex, s.replacement);
    });
    onApplyCorrection(current);
  };

  if (!text || text.trim().length === 0) return null;

  return (
    <div className={`text-xs ${className}`}>
      <div className="flex items-center justify-between py-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 font-bold transition-colors ${
            suggestions.length > 0 
              ? 'text-orange-600 hover:text-orange-700' 
              : 'text-emerald-600 hover:text-emerald-700'
          }`}
        >
          {suggestions.length > 0 ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-orange-500" />
              <span>{suggestions.length} sugerencias de redacción IA</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ortografía y estilo inmobiliario impecables</span>
            </>
          )}
        </button>

        {suggestions.length > 1 && isOpen && (
          <button
            type="button"
            onClick={handleApplyAll}
            className="flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded-md transition"
          >
            <Wand2 className="w-3 h-3" />
            Corregir todo
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="mt-2 space-y-2 bg-orange-50/70 border border-orange-200/80 rounded-xl p-3 animate-in fade-in-50 duration-200">
          <div className="text-[11px] font-bold text-orange-900 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            Optimizaciones recomendadas para maximizar conversión:
          </div>

          <div className="space-y-1.5">
            {suggestions.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white border border-orange-100 rounded-lg p-2 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <span className="line-through text-rose-500 bg-rose-50 px-1 py-0.2 rounded font-mono">
                      {item.original}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                      {item.replacement}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {item.reason}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApply(item)}
                  className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-[10px] font-bold transition shrink-0 shadow-xs"
                >
                  Aplicar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
