# Tareas — 001 AI Broker Spain MVP

Tareas atómicas (<30 minutos cada una), ordenadas por dependencias estrictas de desarrollo.
Cada tarea indica los Requisitos Funcionales (RF) que cubre y su condición verificable.

---

### Fase 1: Andamiaje, Esquema y Aislamiento Multi-tenant

- [x] **T1: Confirmación de arquitectura, contenedor y Docker Compose**
  - **Cubre**: Base de infraestructura para RF-1 y RF-11.
  - **Hecho cuando**: El archivo `docker-compose.yml` levanta PostgreSQL 16 con extensión pgvector y el contenedor Ollama en el puerto 11434 sin errores.

- [x] **T2: Esquema de base de datos relacional y políticas RLS**
  - **Cubre**: RF-1, RF-3.
  - **Hecho cuando**: El script SQL de migraciones crea las tablas `tenants`, `users`, `invitations`, `dossiers`, `drafts`, `agency_memory_vectors` con `tenant_id` obligatorio y políticas `ENABLE ROW LEVEL SECURITY` activadas.

- [x] **T3: Contexto de seguridad y extracción de Tenant en Middleware**
  - **Cubre**: RF-1, RF-3.
  - **Hecho cuando**: El test unitario `test_tenant_guard.ts` comprueba que una petición sin cabecera o token de tenant válido devuelva 401/403 y no permita consultar datos.

- [x] **T4: Sistema de invitaciones y registro con vinculación de Tenant**
  - **Cubre**: RF-2.
  - **Hecho cuando**: Un usuario puede consumir un token de invitación válido, registrarse y quedar asignado al `tenant_id` del enlace, invalidando el token usado.

---

### Fase 2: Motor Cognitivo BROKER y Modo Borrador Seguro

- [x] **T5: Cliente Ollama local con fallback de seguridad**
  - **Cubre**: RF-11, RF-12.
  - **Hecho cuando**: `ollamaClient.ts` envía peticiones a `llama3.1:8b` local y el test de timeout (>12s) demuestra la conmutación al fallback en menos de 100 ms sin abortar la ejecución.

- [x] **T6: Orquestador central Director BROKER (Interlocutor único)**
  - **Cubre**: RF-4.
  - **Hecho cuando**: Todas las consultas de chat inmobiliario entran por `brokerDirector.ts` y ningún subagente expone endpoints directos al usuario final.

- [x] **T7: Guardián de Borrador Seguro (Draft Guard)**
  - **Cubre**: RF-5, RF-6.
  - **Hecho cuando**: Toda generación de texto o contrato se persiste en `drafts` con estado `draft_pending` y cualquier intento de emisión exterior sin firma de aprobación lanza una excepción controlada.

- [x] **T8: Módulo de aprobación humana y selección de canal de salida**
  - **Cubre**: RF-7.
  - **Hecho cuando**: El endpoint de aprobación actualiza el estado a `approved` con `approved_by` y genera los enlaces de descarga PDF, enlace de WhatsApp web o correo listos para el agente.

---

### Fase 3: Módulo Legal Inmobiliario de España

- [x] **T9: Generador de Contrato de Arras Penitenciales (Art. 1454 C.C.)**
  - **Cubre**: RF-8.
  - **Hecho cuando**: El test `test_legal_spain.ts` verifica que el borrador incluya las cláusulas del Art. 1454 del Código Civil, el importe de la señal y detecte campos ausentes con etiquetas `[PENDIENTE]` sin inventar datos.

- [x] **T10: Generador de Contrato de Alquiler Residencial (LAU)**
  - **Cubre**: RF-9.
  - **Hecho cuando**: El módulo genera el contrato de arrendamiento incorporando la duración legal mínima, prórrogas y cláusula de fianza legal obligatoria según la Ley 29/1994.

- [ ] **T11: Generador de Hoja de Visita con pacto de honorarios**
  - **Cubre**: RF-10.
  - **Hecho cuando**: La hoja de visita se genera con los datos del visitante, finca y porcentaje de honorarios pactado, lista para visualización y firma en pantalla.

---

### Fase 4: Memoria Vectorial y Verificación de Calidad

- [ ] **T12: Almacén vectorial aislado por agencia (pgvector)**
  - **Cubre**: RF-13.
  - **Hecho cuando**: El test de inserción y consulta comprueba que los vectores de un tenant nunca son recuperados en las búsquedas semánticas de otro tenant.

- [ ] **T13: Validación final de la especificación y verificación e2e**
  - **Cubre**: Todos los RF (RF-1 a RF-13).
  - **Hecho cuando**: Todos los tests de la suite pasan en verde, `npm run build` compila con 0 errores y el documento `validation.md` queda completado con veredicto APROBADO.
