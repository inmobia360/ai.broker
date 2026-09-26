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
