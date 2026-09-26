# Tareas de Implementación — Spec 002: Agent Dashboard UI

## Fase 1: Componentes de Aprobación y Modal Human-in-the-Loop
- [x] T1: Crear componente `DraftApprovalModal.tsx` con visor de texto legal, selector de canales (WhatsApp, Email, PDF) y confirmación explícita (RF-UI-3).
- [x] T2: Conectar acción de aprobación con endpoint `/api/drafts/[id]/approve` y descarga de PDF `/api/drafts/[id]/pdf` (RF-UI-2, RF-UI-3).

## Fase 2: Consola de Chat y Tarjetas de Propuestas
- [x] T3: Actualizar `src/app/page.tsx` con soporte de mensajes estructurados, historial interactivo y corrección ortográfica UTF-8 (RF-UI-1, RNF-UI-2).
- [x] T4: Conectar envío de mensajes a `/api/chat` con el `tenant_id` verificado y animación de razonamiento cognitivo (RF-UI-1).

## Fase 3: Expedientes, Caja Fuerte y Monitor de Salud
- [x] T5: Conectar acciones rápidas en la pestaña de Expedientes para generar Arras o Alquiler LAU directamente en el chat (RF-UI-5).
- [x] T6: Implementar monitor de salud en la barra superior conectado en tiempo real con `/api/health` (RF-UI-7).
- [x] T7: Ejecutar suite de pruebas de compilación (`npx tsc --noEmit`, `npm test`, `npm run build`) y validar funcionamiento integral.
- [x] T8: Mantener legibles el isotipo, el nombre y el descriptor del logotipo oficial sobre el fondo claro de acceso, también cuando el sistema operativo prefiera tema oscuro (RF-UI-8). Hecho cuando: `/login` muestra “INMOBIA 360” en texto oscuro legible y el descriptor conserva contraste.

