# Validación de Requisitos — Spec 001: AI Broker Spain MVP

Estado del hito: **En desarrollo incremental (Fase 1 iniciada)**.

---

## Matriz de Trazabilidad y Verificación Formal

| Requisito Funcional | Criterio EARS | Test / Método de Verificación | Estado | Evidencia |
| :--- | :--- | :--- | :--- | :--- |
| **RF-1: Aislamiento Multi-tenant** | EL SISTEMA debe asociar `tenant_id` obligatorio y RLS en Postgres | Migración SQL + Middleware perimetral + Tests | APROBADO | RLS en base de datos + `src/middleware.ts` perimetral (11/11 tests en verde) |
| **RF-2: Registro por Invitación** | CUANDO accede con invitación válida, EL SISTEMA permite registro | `tests/test_invitations.test.ts` + API | APROBADO | Generación de token criptográfico, vinculación estricta de tenant_id e invalidación de token verificadas |
| **RF-3: Control de Acceso Indebido** | SI intenta acceder a otro tenant, ENTONCES EL SISTEMA bloquea con 403 | `tests/test_tenant_guard.test.ts` | APROBADO | Bloqueo perimetral HTTP 403 + Alerta de auditoría crítica verificada |
| **RF-4: Interlocutor Único BROKER** | EL SISTEMA canaliza peticiones exclusivamente por el Director | `tests/test_broker_orchestrator.test.ts` | APROBADO | Orquestador central en `src/lib/ai/brokerDirector.ts`, bloqueo directo de subagentes (HTTP 403) y restricción de memoria canónica (Principio 2) verificados |
| **RF-5: Modo Borrador Seguro** | CUANDO se genera documento, EL SISTEMA guarda en `draft` | `tests/test_draft_guard.test.ts` | APROBADO | Persistencia forzada en estado `draft_pending` implementada en `DraftGuard.createDraft` y vinculada al Director BROKER |
| **RF-6: Bloqueo Envíos Automáticos** | SI intenta envío exterior sin visto bueno, ENTONCES aborta | `tests/test_draft_guard.test.ts` | APROBADO | Interceptor de transmisión exterior lanza `DraftNotApprovedError` (HTTP 403) y registra alerta crítica si no está aprobado |
| **RF-7: Canales de Salida** | CUANDO aprueba, EL SISTEMA ofrece WhatsApp, correo o PDF | `tests/test_draft_approval.test.ts` + `/api/drafts/[id]/approve` | APROBADO | Endpoint `/api/drafts/[id]/approve` genera WhatsApp deep-link, email mailto y PDF descargable con validación humana en 1 toque |
| **RF-8: Arras Penitenciales** | CUANDO solicita arras, EL SISTEMA genera borrador Art. 1454 CC | `tests/test_legal_spain.test.ts` | APROBADO | Módulo `src/lib/legal/spain/arras.ts` incluye Art. 1454 C.C., rescisión bilateral, señal y detección de campos `[PENDIENTE]` sin alucinaciones |
| **RF-9: Alquiler LAU** | CUANDO solicita alquiler, EL SISTEMA aplica Ley 29/1994 | `test_legal_spain.ts` (alquiler) | PENDIENTE | Por ejecutar en T10 |
| **RF-10: Parte de Visita** | CUANDO prepara visita, EL SISTEMA incluye pacto de honorarios | `test_legal_spain.ts` (visita) | PENDIENTE | Por ejecutar en T11 |
| **RF-11: Inferencia Local Privada** | EL SISTEMA procesa en Ollama VPS Hostinger (`llama3.1:8b`) | Inferencia local verificada | APROBADO | Contenedor Ollama operativo (`llama3.1:8b`) |
| **RF-12: Fallback Cognitivo** | SI Ollama supera 12s, ENTONCES conmuta a fallback secundario | `tests/test_ollama_fallback.test.ts` | APROBADO | Timeout 12s + Conmutación automática a motor cognitivo en <1ms verificada |
| **RF-13: Búsqueda Vectorial Aislada** | CUANDO consulta memoria, EL SISTEMA filtra por `tenant_id` | `test_vector_isolation.ts` | PENDIENTE | Por ejecutar en T12 |

---

## Criterios de Finalización de la Spec

- [ ] Todos los RF (RF-1 al RF-13) con tests asociados en verde (`npm test`).
- [ ] Compilación estricta de TypeScript sin errores (`npx tsc --noEmit`).
- [ ] Flujo completo verificado: Invitación ➔ Expediente ➔ Arras ➔ Visto Bueno ➔ PDF/WhatsApp.
- [ ] Veredicto final del QA: **PENDIENTE DE COMPLETAR TAREAS RESTANTES**.
