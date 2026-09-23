# SPEC-007: Integración Frontend & Marketing Hub de RealEstate Freelancer en Inmobia 360

## 1. Resumen Ejecutivo
Integración completa de los módulos comerciales, herramientas de difusión y componentes visuales del repositorio `realestate_freelancer` dentro de la plataforma SaaS `Inmobia 360` (`AI_BROKER`).
Se consolidan:
- Landing pública de inmuebles (`/property/[slug]`) con captación directa de contactos.
- Formulario de captación de leads con consentimiento RGPD (`LeadCaptureForm.tsx`).
- Motor de marketing IA multicanal de 10 formatos contextuales sin alucinaciones (`realEstateAIEngine.ts`) con soporte de inferencia en VPS Hostinger (Ollama `llama3.1:8b`) y fallback determinista.
- Asesor de redacción inmobiliaria en tiempo real (`AIWritingAdvisor.tsx`) con corrección ortográfica y enriquecimiento de copys.
- Modal de difusión con código QR dinámico descargable y botones para WhatsApp y correo (`ShareModal.tsx`).
- Logotipo e isotipo oficial vectorizado de Inmobia 360 (`BrandLogo.tsx`).

## 2. Requisitos Funcionales (RF)
- **RF-MKT10 (Estudio de Marketing 10 Canales):** Generación determinista y contextual para portales (Idealista/Fotocasa), ficha corta, memoria larga, Instagram, Facebook/LinkedIn B2B, WhatsApp VIP, guiones de vídeo (Reels/TikTok), análisis de rentabilidad/Cap Rate, enfoque comprador internacional (Golden Visa) y traducción bilingüe (ES/EN).
- **RF-OLLAMA (Inferencia LLM en VPS Hostinger):** Endpoint `/api/ai/marketing` que invoca el modelo `llama3.1:8b` alojado en el VPS (`https://72.62.27.4`) o activa el fallback cognitivo si supera el umbral de latencia.
- **RF-LAND (Landing Pública de Inmuebles):** Ruta dinámica `/property/[slug]` con visualización de ficha técnica, galería fotográfica, datos de la agencia colegiada y formulario de contacto.
- **RF-LEAD (Captación de Contactos RGPD):** Formulario `LeadCaptureForm` con validación de consentimiento, tipo de operación, plazo y presupuesto, conectado a `/api/leads`.
- **RF-ADVISOR (Asesor Ortográfico Inmobiliario):** Detección en vivo de tildes omitidas en palabras clave del sector (ático, dúplex, jardín, calefacción, ubicación, inversión) y detección de clichés comerciales.
- **RF-QR (Generador de Códigos QR para Cartelería):** Generación en cliente de código QR en alta resolución descargable en formato PNG.

## 3. Requisitos No Funcionales (RNF)
- **RNF-1:** Compatibilidad total con Next.js 15 App Router y React 19.
- **RNF-2:** Verificación estricta de tipos TypeScript (`npx tsc --noEmit` = 0 errores).
- **RNF-3:** Cobertura de pruebas automatizadas del 100% en verde con `node --test`.
