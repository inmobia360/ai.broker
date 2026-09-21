# Validación de Requisitos — Spec 001: AI Broker Spain MVP

Estado del hito: **En desarrollo incremental (Fase 1 iniciada)**.

---

## Matriz de Trazabilidad y Verificación Formal

| Requisito Funcional | Criterio EARS | Test / Método de Verificación | Estado | Evidencia |
| :--- | :--- | :--- | :--- | :--- |
| **RF-1: Aislamiento Multi-tenant** | EL SISTEMA debe asociar `tenant_id` obligatorio y RLS en Postgres | Migración SQL + `test_tenant_guard.ts` | PENDIENTE | Por ejecutar en T2 y T3 |
| **RF-2: Registro por Invitación** | CUANDO accede con invitación válida, EL SISTEMA permite registro | Test de flujo de invitación | PENDIENTE | Por ejecutar en T4 |
| **RF-3: Control de Acceso Indebido** | SI intenta acceder a otro tenant, ENTONCES EL SISTEMA bloquea con 403 | Test de inyección de tenant ajeno | PENDIENTE | Por ejecutar en T3 |
| **RF-4: Interlocutor Único BROKER** | EL SISTEMA canaliza peticiones exclusivamente por el Director | Test de orquestación centralizada | PENDIENTE | Por ejecutar en T6 |
| **RF-5: Modo Borrador Seguro** | CUANDO se genera documento, EL SISTEMA guarda en `draft` | Test de persistencia de borrador | PENDIENTE | Por ejecutar en T7 |
| **RF-6: Bloqueo Envíos Automáticos** | SI intenta envío exterior sin visto bueno, ENTONCES aborta | `test_draft_guard.ts` | PENDIENTE | Por ejecutar en T7 |
| **RF-7: Canales de Salida** | CUANDO aprueba, EL SISTEMA ofrece WhatsApp, correo o PDF | Test de exportación multicanal | PENDIENTE | Por ejecutar en T8 |
| **RF-8: Arras Penitenciales** | CUANDO solicita arras, EL SISTEMA genera borrador Art. 1454 CC | `test_legal_spain.ts` (arras) | PENDIENTE | Por ejecutar en T9 |
| **RF-9: Alquiler LAU** | CUANDO solicita alquiler, EL SISTEMA aplica Ley 29/1994 | `test_legal_spain.ts` (alquiler) | PENDIENTE | Por ejecutar en T10 |
| **RF-10: Parte de Visita** | CUANDO prepara visita, EL SISTEMA incluye pacto de honorarios | `test_legal_spain.ts` (visita) | PENDIENTE | Por ejecutar en T11 |
| **RF-11: Inferencia Local Privada** | EL SISTEMA procesa en Ollama VPS Hostinger (`llama3.1:8b`) | Inferencia local verificada | APROBADO | Contenedor Ollama operativo |
| **RF-12: Fallback Cognitivo** | SI Ollama supera 12s, ENTONCES conmuta a fallback secundario | `test_ollama_fallback.ts` | PENDIENTE | Por ejecutar en T5 |
| **RF-13: Búsqueda Vectorial Aislada** | CUANDO consulta memoria, EL SISTEMA filtra por `tenant_id` | `test_vector_isolation.ts` | PENDIENTE | Por ejecutar en T12 |

---

## Criterios de Finalización de la Spec

- [ ] Todos los RF (RF-1 al RF-13) con tests asociados en verde (`npm test`).
- [ ] Compilación estricta de TypeScript sin errores (`npx tsc --noEmit`).
- [ ] Flujo completo verificado: Invitación ➔ Expediente ➔ Arras ➔ Visto Bueno ➔ PDF/WhatsApp.
- [ ] Veredicto final del QA: **PENDIENTE DE COMPLETAR TAREAS RESTANTES**.
