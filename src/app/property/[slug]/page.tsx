'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Car, 
  Sun, 
  Share2, 
  FileText, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { LeadCaptureForm } from '@/components/lead/LeadCaptureForm';
import { ShareModal } from '@/components/ui/ShareModal';
import { DEMO_PROPERTIES, PropertyItem } from '@/components/dashboard/PropertyCatalog';

export default function PropertyLandingPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug as string) || '';

  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [agencyBranding, setAgencyBranding] = useState({
    agencyName: "Inmobia 360",
    phone: "+34 600 000 000",
    whatsapp: "+34 600 000 000",
    email: "info@inmobia360.com",
    associationNumber: "API-COL-45892",
    tagline: "Agencia Inmobiliaria Colegiada"
  });

  useEffect(() => {
    // Cargar marca blanca de la agencia colegiada
    fetch('/api/settings/brand')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.data) {
          const b = data.data;
          setAgencyBranding({
            agencyName: b.agency_name || b.agencyName || "Inmobia 360",
            phone: b.support_phone || b.contactPhone || "+34 600 000 000",
            whatsapp: b.support_phone || b.contactPhone || "+34 600 000 000",
            email: b.support_email || b.contactEmail || "info@inmobia360.com",
            associationNumber: b.association_number || b.apiNumber || "API-COL-45892",
            tagline: b.tagline || b.brandSlogan || "Agencia Inmobiliaria Colegiada"
          });
        }
      })
      .catch(() => {});

    // 1. Buscar primero en las propiedades demo
    const foundDemo = DEMO_PROPERTIES.find(
      p => p.id === slug || p.id.toLowerCase() === slug.toLowerCase() || p.title.toLowerCase().includes(slug.toLowerCase())
    );

    if (foundDemo) {
      setProperty(foundDemo);
      setLoading(false);
      return;
    }

    // 2. Si no es demo, intentar consultar al backend /api/properties
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        if (data.properties && Array.isArray(data.properties)) {
          const match = data.properties.find((p: any) => p.id === slug || p.title?.toLowerCase().includes(slug.toLowerCase()));
          if (match) {
            setProperty({
              id: match.id,
              title: match.title,
              location: match.location,
              address: match.address || match.location,
              price: match.price,
              formattedPrice: `${match.price.toLocaleString('es-ES')} €`,
              m2: match.built_area_m2 || 90,
              rooms: match.bedrooms || 2,
              baths: match.bathrooms || 1,
              status: 'disponible',
              type: 'Piso Residencial',
              description: match.description || 'Excelente propiedad en cartera gestionada por Inmobia 360.',
              coordinates: { lat: 40.4168, lng: -3.7038 },
              imageUrl: match.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80'
            });
          } else {
            // Fallback por defecto a la primera propiedad de la cartera
            setProperty(DEMO_PROPERTIES[0]);
          }
        } else {
          setProperty(DEMO_PROPERTIES[0]);
        }
      })
      .catch(() => {
        setProperty(DEMO_PROPERTIES[0]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading || !property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600">Cargando ficha de la propiedad...</p>
        </div>
      </div>
    );
  }

  // Lista de imágenes para la galería
  const galleryImages = [
    property.imageUrl,
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Cabecera Pública */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </Link>
            <div className="h-5 w-px bg-slate-200"></div>
            <BrandLogo size="sm" showSubtitle={true} subtitleText="PORTAL INMOBILIARIO" />
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartir / QR</span>
            </button>
            <a
              href="#contact-form"
              className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Contactar Agente</span>
            </a>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Título y Precio */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800 tracking-wide">
                En Comercialización Exclusiva
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                {property.type}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {property.title}
            </h1>
            <p className="text-sm text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
              <span>{property.address}</span>
            </p>
          </div>

          <div className="md:text-right">
            <div className="text-3xl sm:text-4xl font-black text-orange-600 tracking-tight">
              {property.formattedPrice}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">
              {Math.round(property.price / property.m2).toLocaleString('es-ES')} €/m² construidos
            </div>
          </div>
        </div>

        {/* Galería Fotográfica */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 h-80 sm:h-[480px] rounded-2xl overflow-hidden bg-slate-900 relative shadow-sm">
            <img 
              src={galleryImages[activeImageIdx]} 
              alt={property.title} 
              className="w-full h-full object-cover transition-all duration-300"
            />
            {/* Controles de imagen */}
            <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
              <button 
                onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                className="w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md pointer-events-auto transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveImageIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                className="w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md pointer-events-auto transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Miniaturas */}
          <div className="grid grid-cols-4 lg:grid-cols-1 gap-2.5">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`h-20 lg:h-[110px] w-full rounded-xl overflow-hidden border-2 transition ${
                  activeImageIdx === idx 
                    ? 'border-orange-500 scale-[1.02] shadow-md' 
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Características Principales (KPIs) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs text-slate-500 font-medium">Superficie</span>
              <span className="text-base font-extrabold text-slate-900">{property.m2} m²</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs text-slate-500 font-medium">Dormitorios</span>
              <span className="text-base font-extrabold text-slate-900">{property.rooms} Habitaciones</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Bath className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs text-slate-500 font-medium">Baños</span>
              <span className="text-base font-extrabold text-slate-900">{property.baths} Baños</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs text-slate-500 font-medium">Estado</span>
              <span className="text-base font-extrabold text-slate-900">Excelente</span>
            </div>
          </div>
        </div>

        {/* Sección de Dos Columnas: Ficha y Formulario */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Columna Izquierda: Descripción y Detalles */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Descripción del Inmueble</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Equipamiento y Calidades</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Luz natural abundante durante todo el día',
                  'Calefacción individual y climatización eficiente',
                  'Ventanas con aislamiento acústico y térmico Climalit',
                  'Cocina equipada con electrodomésticos de alta gama',
                  'Armarios empotrados vestidos en dormitorios',
                  'Finca señorial con conserje y ascensor cota cero'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {property.cadastralRef && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">Referencia Catastral Verificada:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {property.cadastralRef}
                </span>
              </div>
            )}
          </div>

          {/* Columna Derecha: Formulario de Contacto Flotante */}
          <div id="contact-form" className="lg:col-span-1 space-y-4 sticky top-24">
            <LeadCaptureForm 
              propertyId={property.id} 
              propertyTitle={property.title} 
              propertyPrice={property.price}
            />

            {/* Tarjeta del Asesor y Agencia Colegiada */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                  {agencyBranding.agencyName.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{agencyBranding.agencyName}</h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {agencyBranding.associationNumber ? `Colegiado: ${agencyBranding.associationNumber}` : 'Agencia Inmobiliaria'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Atención inmediata
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Contacto Directo */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <a
                  href={`https://wa.me/${agencyBranding.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
                <a
                  href={`tel:${agencyBranding.phone.replace(/[^0-9+]/g, '')}`}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Llamar
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Compartir */}
      <ShareModal 
        property={property} 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)}
        agencyName={agencyBranding.agencyName}
      />
    </div>
  );
}
