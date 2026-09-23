"use client";

import React, { useState } from "react";
import { 
  Building2, 
  LayoutGrid, 
  List, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  ExternalLink, 
  Sparkles, 
  FileText,
  Search,
  Filter,
  ArrowUpRight,
  Share2
} from "lucide-react";
import { DeepLinkGenerator } from "@/lib/geo/deepLinkGenerator";

export interface PropertyItem {
  id: string;
  title: string;
  location: string;
  address: string;
  price: number;
  formattedPrice: string;
  m2: number;
  rooms: number;
  baths: number;
  status: "disponible" | "en_negociacion" | "arras_firmadas" | "reservado";
  type: string;
  description: string;
  cadastralRef?: string;
  coordinates: { lat: number; lng: number };
  imageUrl: string;
}

export const DEMO_PROPERTIES: PropertyItem[] = [
  {
    id: "prop-mad-01",
    title: "Ático Dúplex Exclusivo en Barrio de Salamanca",
    location: "Barrio de Salamanca / Recoletos, Madrid (España)",
    address: "Calle Serrano 45, 28001 Madrid",
    price: 890000,
    formattedPrice: "890.000 €",
    m2: 165,
    rooms: 3,
    baths: 2,
    status: "disponible",
    type: "Ático Dúplex",
    description: "Vivienda señorial en finca clásica con terraza privada de 35 m², techos altos y plaza de garaje en finca.",
    cadastralRef: "5432101VK4753B0001TR",
    coordinates: { lat: 40.4285, lng: -3.6875 },
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prop-tfe-02",
    title: "Villa de Lujo con Piscina Infinity en Costa Adeje",
    location: "Costa Adeje / Golf del Sur, Santa Cruz de Tenerife (Canarias) (España)",
    address: "Avenida de Bruselas 12, 38660 Adeje, Tenerife",
    price: 1450000,
    formattedPrice: "1.450.000 €",
    m2: 320,
    rooms: 4,
    baths: 4,
    status: "disponible",
    type: "Villa Exclusiva",
    description: "Impresionante villa contemporánea con vistas panorámicas al Atlántico, piscina desbordante y licencia vacacional en regla.",
    cadastralRef: "38001A005001230000TG",
    coordinates: { lat: 28.0912, lng: -16.7328 },
    imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prop-bcn-03",
    title: "Piso Modernista con Balcones en Eixample Dret",
    location: "Eixample Dret / Rambla de Catalunya, Barcelona (España)",
    address: "Carrer de Mallorca 240, 08008 Barcelona",
    price: 620000,
    formattedPrice: "620.000 €",
    m2: 135,
    rooms: 3,
    baths: 2,
    status: "en_negociacion",
    type: "Piso Regio",
    description: "Propiedad con encanto modernista, techos con volta catalana, suelos hidráulicos originales y orientación sur.",
    cadastralRef: "08019A012000540001XF",
    coordinates: { lat: 41.3934, lng: 2.1611 },
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prop-sev-04",
    title: "Casa Señorial con Patio Andaluz en Santa Cruz",
    location: "Barrio de Santa Cruz / Centro Histórico, Sevilla (España)",
    address: "Calle Mateos Gago 18, 41004 Sevilla",
    price: 540000,
    formattedPrice: "540.000 €",
    m2: 210,
    rooms: 4,
    baths: 3,
    status: "disponible",
    type: "Casa Señorial",
    description: "Palacete rehabilitado con patio de columnas de mármol, fuente, azotea transitable con vistas directas a la Giralda.",
    cadastralRef: "41091A002000880001AZ",
    coordinates: { lat: 37.3862, lng: -5.9926 },
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prop-val-05",
    title: "Ático Frente al Mar con Solárium en Valencia",
    location: "Playa de la Malvarrosa / Marina de Valencia, Valencia (España)",
    address: "Paseo de Neptuno 8, 46011 Valencia",
    price: 475000,
    formattedPrice: "475.000 €",
    m2: 110,
    rooms: 2,
    baths: 2,
    status: "arras_firmadas",
    type: "Ático",
    description: "Primera línea de playa con solárium privado de 40 m², vistas despejadas al Mediterráneo y plaza de garaje incluida.",
    cadastralRef: "46900A015000760001BH",
    coordinates: { lat: 39.4678, lng: -0.3255 },
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80"
  }
];

interface PropertyCatalogProps {
  properties?: PropertyItem[];
  onSelectPropertyAction: (actionType: "chat" | "cma" | "content" | "share", property: PropertyItem) => void;
  onOpenNewPropertyModal?: () => void;
  onOpenShareModal?: (property: PropertyItem) => void;
}

export const PropertyCatalog: React.FC<PropertyCatalogProps> = ({ 
  properties = DEMO_PROPERTIES, 
  onSelectPropertyAction,
  onOpenNewPropertyModal,
  onOpenShareModal
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPropertyForMap, setSelectedPropertyForMap] = useState<PropertyItem>(properties[0] || DEMO_PROPERTIES[0]);

  const activeProperties = properties.length > 0 ? properties : DEMO_PROPERTIES;

  const filteredProperties = activeProperties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cabecera y Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Gestión de Propiedades
          </h2>
          <p className="text-xs text-slate-500">
            Visualiza tu cartera en cuadrícula, lista o mapa territorial interactivo ({DEMO_PROPERTIES.length} activas)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Barra de Búsqueda */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por zona o título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 text-xs text-slate-800 rounded-xl pl-8 pr-3 py-2 outline-none focus:border-blue-500 shadow-xs transition-colors w-48 sm:w-60"
            />
          </div>

          {/* Selector de Vista (Cuadrícula, Lista, Mapa) */}
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "grid" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Vista en Cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "list" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Vista en Lista"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "map" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Vista en Mapa Territorial"
            >
              <MapPin className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* VISTA 1: CUADRÍCULA (GRID) */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map(property => {
            const deepLinks = DeepLinkGenerator.generateLinks({
              lat: property.coordinates.lat,
              lon: property.coordinates.lng,
              cadastralReference: property.cadastralRef
            });
            return (
              <div 
                key={property.id}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={property.imageUrl} 
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        property.status === "disponible" 
                          ? "bg-emerald-600/90 text-white" 
                          : property.status === "en_negociacion"
                          ? "bg-amber-600/90 text-white"
                          : "bg-purple-600/90 text-white"
                      }`}>
                        {property.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="text-base font-extrabold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg">
                        {property.formattedPrice}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{property.location}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {property.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {property.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-medium">
                        <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                        {property.m2} m² ({Math.round(property.price / property.m2)} €/m²)
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                        {property.rooms} hab.
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Bath className="w-3.5 h-3.5 text-slate-400" />
                        {property.baths} baños
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <a
                      href={deepLinks.googleEarth3D}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                      title="Explorar entorno en Google Earth 3D"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Vista 3D Earth
                    </a>
                    {deepLinks.catastroVisor && (
                      <a
                        href={deepLinks.catastroVisor}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 transition-colors"
                        title="Ver referencia en Sede Electrónica del Catastro"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Catastro
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onSelectPropertyAction("cma", property)}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Tasar ACM
                    </button>
                    <button
                      onClick={() => onSelectPropertyAction("content", property)}
                      className="py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs"
                    >
                      <FileText className="w-3 h-3" />
                      Redactor IA
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onOpenShareModal ? onOpenShareModal(property) : onSelectPropertyAction("share", property)}
                      className="py-1.5 px-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Share2 className="w-3 h-3 text-orange-500" />
                      Compartir / QR
                    </button>
                    <a
                      href={`/property/${property.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 px-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-orange-600" />
                      Ficha Pública
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VISTA 2: LISTA EJECUTIVA */}
      {viewMode === "list" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-xs">
          {filteredProperties.map(property => (
            <div key={property.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <img 
                  src={property.imageUrl} 
                  alt={property.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{property.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                      {property.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span>{property.location}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-3 font-medium">
                    <span>{property.m2} m²</span>
                    <span>·</span>
                    <span>{property.rooms} hab.</span>
                    <span>·</span>
                    <span>{property.baths} baños</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                <div className="text-right">
                  <div className="text-base font-extrabold text-emerald-600">{property.formattedPrice}</div>
                  <div className="text-[10px] text-slate-400">{Math.round(property.price / property.m2)} €/m²</div>
                </div>
                <button
                  onClick={() => onOpenShareModal ? onOpenShareModal(property) : onSelectPropertyAction("share", property)}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Compartir y Código QR"
                >
                  <Share2 className="w-3.5 h-3.5 text-orange-500" />
                  Compartir
                </button>
                <button
                  onClick={() => onSelectPropertyAction("chat", property)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Operar con IA
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VISTA 3: MAPA TERRITORIAL */}
      {viewMode === "map" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[420px] relative overflow-hidden shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Mapa Territorial de Cartera Activa (España)
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Selecciona una ubicación geográfica para inspeccionar la micro-zona y sus dotaciones
              </p>
            </div>

            {/* Representación Cartográfica Vectorial Interactiva */}
            <div className="relative w-full h-64 bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-around">
              {DEMO_PROPERTIES.map(prop => {
                const isSelected = selectedPropertyForMap.id === prop.id;
                return (
                  <button
                    key={prop.id}
                    onClick={() => setSelectedPropertyForMap(prop)}
                    className={`flex flex-col items-center gap-1 transition-all ${
                      isSelected ? "scale-110 -translate-y-1" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className={`p-2.5 rounded-full shadow-md ${
                      isSelected ? "bg-blue-600 text-white ring-4 ring-blue-100 animate-bounce" : "bg-white text-blue-600 border border-slate-200 hover:bg-blue-50"
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 max-w-[85px] text-center truncate">
                      {prop.location.split("/")[0]}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600">
                      {prop.formattedPrice}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>Coordenadas sincronizadas con visualización satélite</span>
              <span className="text-blue-600 font-semibold">5 ubicaciones activas</span>
            </div>
          </div>

          {/* Ficha Lateral de Inmueble Seleccionado en el Mapa */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <img 
                src={selectedPropertyForMap.imageUrl} 
                alt={selectedPropertyForMap.title} 
                className="w-full h-36 rounded-xl object-cover"
              />
              <div>
                <span className="text-[10px] text-blue-600 font-bold uppercase">Inmueble Seleccionado</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{selectedPropertyForMap.title}</h3>
                <div className="text-xs text-slate-500 mt-1">{selectedPropertyForMap.address}</div>
                <div className="text-lg font-extrabold text-emerald-600 mt-2">{selectedPropertyForMap.formattedPrice}</div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {selectedPropertyForMap.description}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100">
              <a
                href={DeepLinkGenerator.generateLinks({
                  lat: selectedPropertyForMap.coordinates.lat,
                  lon: selectedPropertyForMap.coordinates.lng,
                  cadastralReference: selectedPropertyForMap.cadastralRef
                }).googleEarth3D}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                Explorar en Google Earth 3D
              </a>
              <button
                onClick={() => onSelectPropertyAction("chat", selectedPropertyForMap)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Tramitar con Director BROKER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
