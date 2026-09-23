export interface PriorityLead {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  category: string;
  location: string;
  budget: string;
  timeframe: string;
  score: number;
  timeAgo: string;
  inquiry: string;
  recommendedAction: string;
  phone: string;
  suggestedPrompt: string;
}

export const PRIORITY_LEADS: PriorityLead[] = [
  {
    id: "lead-1",
    name: "Carlos Romero (Family Office)",
    initials: "CR",
    avatarBg: "bg-blue-600",
    category: "Compra",
    location: "Madrid",
    budget: "850.000 €",
    timeframe: "Ahora",
    score: 96,
    timeAgo: "18:51",
    inquiry: "Hola, buscamos un ático de 3 habitaciones en Barrio de Salamanca con terraza y garaje para inversión patrimonial. Contamos con 850.000€ al contado sin necesidad de hipoteca.",
    recommendedAction: "Llamar en menos de 15 minutos y enviar dossier financiero de Cap Rate.",
    phone: "+34 600 123 456",
    suggestedPrompt: "Generar dossier financiero de rentabilidad neta y Cap Rate para Carlos Romero del Family Office sobre el ático de Salamanca."
  },
  {
    id: "lead-2",
    name: "Sophie Müller",
    initials: "SM",
    avatarBg: "bg-indigo-600",
    category: "Compra",
    location: "Santa Cruz de Tenerife (Canarias)",
    budget: "1.300.000 €",
    timeframe: "Ahora",
    score: 95,
    timeAgo: "15:15",
    inquiry: "Hello, we are looking for a luxury villa in Tenerife South with sea views and holiday license. We are currently in Costa Adeje and would like to arrange a private viewing this Saturday.",
    recommendedAction: "Contactar por WhatsApp en inglés para coordinar visita privada y transferir ficha técnica.",
    phone: "+34 600 987 654",
    suggestedPrompt: "Redactar mensaje de WhatsApp en inglés para Sophie Müller coordinando visita privada el sábado a la Villa de Costa Adeje con ficha técnica."
  }
];
