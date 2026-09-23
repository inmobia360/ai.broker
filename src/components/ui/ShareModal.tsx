'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Mail, 
  Download, 
  QrCode, 
  Printer, 
  ExternalLink,
  Building2,
  Sparkles
} from 'lucide-react';
import { generateQRCodeDataUrl } from '@/lib/qr/qrGenerator';

export interface SharePropertyItem {
  id: string;
  title: string;
  location: string;
  price: number;
  formattedPrice: string;
  imageUrl?: string;
  slug?: string;
}

interface ShareModalProps {
  property: SharePropertyItem | null;
  isOpen: boolean;
  onClose: () => void;
  agencyName?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ 
  property, 
  isOpen, 
  onClose,
  agencyName = 'Inmobia 360'
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQR, setShowQR] = useState(true);

  const slug = property?.slug || property?.id || 'propiedad';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.inmobia360.com';
  const publicUrl = `${baseUrl}/property/${slug}`;

  useEffect(() => {
    if (isOpen && property) {
      generateQRCodeDataUrl(publicUrl).then(url => setQrCodeUrl(url));
    }
  }, [isOpen, property, publicUrl]);

  if (!isOpen || !property) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `¡Hola! Te comparto este inmueble en cartera de ${agencyName}:\n\n` +
      `🏡 *${property.title}*\n` +
      `📍 ${property.location}\n` +
      `💰 *${property.formattedPrice}*\n\n` +
      `Puedes consultar la ficha completa y solicitar visita aquí:\n${publicUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`${property.title} - ${agencyName}`);
    const body = encodeURIComponent(
      `Estimado/a,\n\nLe remito la ficha comercial del siguiente inmueble:\n\n` +
      `Propiedad: ${property.title}\n` +
      `Ubicación: ${property.location}\n` +
      `Precio: ${property.formattedPrice}\n\n` +
      `Puede acceder a la galería y características detalladas en el siguiente enlace:\n` +
      `${publicUrl}\n\n` +
      `Atentamente,\nEquipo de ${agencyName}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR-${slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Compartir Ficha del Inmueble</h3>
              <p className="text-xs text-slate-400">Difusión multicanal y cartelería con QR</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-5">
          {/* Ficha Resumen */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-200 shrink-0 overflow-hidden relative">
              {property.imageUrl ? (
                <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-6 h-6 text-slate-400 m-auto" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-slate-900 text-xs truncate">{property.title}</h4>
              <p className="text-[11px] text-slate-500 truncate">{property.location}</p>
              <p className="text-xs font-extrabold text-orange-600 mt-0.5">{property.formattedPrice}</p>
            </div>
          </div>

          {/* Enlace Público y Copiado */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Enlace Web Público (Landing de Captación):
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={publicUrl}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono truncate focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  copied 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Botones de acción directa multicanal */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp Directo
            </button>

            <button
              onClick={handleEmailShare}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
            >
              <Mail className="w-4 h-4" />
              Enviar por Email
            </button>
          </div>

          {/* Sección de Código QR Dinámico */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <QrCode className="w-4 h-4 text-orange-500" />
                <span>Código QR para Escaparate y Cartelería</span>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="text-[11px] text-blue-600 font-semibold hover:underline"
              >
                {showQR ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {showQR && (
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
                <div className="w-28 h-28 bg-white p-1 rounded-lg border border-slate-100 flex items-center justify-center shrink-0">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Código QR del Inmueble" className="w-full h-full" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Imprime o exhibe este código QR en el cartel exterior o en el escaparate de la agencia. Cualquier interesado podrá escanearlo para ver la ficha y contactar.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      onClick={handleDownloadQR}
                      disabled={!qrCodeUrl}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar PNG
                    </button>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Abrir Ficha
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
