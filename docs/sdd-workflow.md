# Flujo de Trabajo SDD (Spec-Driven Development)

Metodología institucional de ingeniería asistida por Inteligencia Artificial para AI BROKER.

```
Constitución ➔ Spec (EARS) ➔ Clarificación (QA) ➔ Plan (CÓMO) ➔ Tareas (<30m) ➔ Implementación (TDD) ➔ Validación ➔ Cambio
```

---

## Las 8 Fases del Ciclo de Vida

### 1. Constitución (`docs/constitution.md`)
- Principios innegociables (máximo 15 líneas).
- Define stack, reglas de seguridad, aislamiento multi-tenant, tests y política de privacidad.
- Es la ley suprema del proyecto: ningún requisito ni agente puede contradecirla.

### 2. Especificación (`specs/<id>-<slug>/spec.md`)
- Se redacta tras una entrevista previa (máximo 6 preguntas) enfocada en casos límite y alcance.
- Define el **QUÉ** y el **POR QUÉ** (nunca el CÓMO técnico ni nombres de archivos).
- Todos los requisitos funcionales se numeran (`RF-1`, `RF-2`...) y se redactan en **notación EARS**:
  - `CUANDO <evento>, EL SISTEMA <respuesta obligatoria>`.
  - `SI <condición anómala>, ENTONCES EL SISTEMA <respuesta de error/seguridad>`.
  - `MIENTRAS <estado>, EL SISTEMA <comportamiento continuo>`.
  - `EL SISTEMA <comportamiento permanente>`.
- Incluye casos límite, fuera de alcance explícito y criterios de finalización medibles.

### 3. Clarificación (Revisión QA)
- Revisión de la especificación como tester profesional: detección de ambigüedades, contradicciones, casos límite faltantes o choques con la constitución.
- El agente **solo detecta y pregunta**, no inventa soluciones ni toca código.

### 4. Plan Técnico (`specs/<id>-<slug>/plan.md`)
- El **CÓMO** técnico: arquitectura de carpetas, esquemas de base de datos (Postgres + pgvector), contratos de API, algoritmos y estrategia de pruebas.
- **Decisiones justificadas con alternativas descartadas**: Cada elección técnica relevante debe documentar por qué se eligió y qué alternativa se descartó explícitamente.
- Mapeo de trazabilidad: indica qué módulo responde a qué RF.

### 5. Desglose de Tareas (`specs/<id>-<slug>/tasks.md`)
- Tareas atómicas de corta duración (<30 minutos).
- Ordenadas por orden estricto de dependencias.
- Cada tarea indica los RF que cubre y una línea obligatoria: `Hecho cuando: <condición verificable>`.

### 6. Implementación Incremental
- Se ejecuta **una sola tarea a la vez** (`Tn`).
- Enfoque Test-First: escribir primero el test correspondiente.
- Ejecutar la suite de tests (`npm test` y verificación de tipos).
- Al terminar: marcar `[x]` en `tasks.md` y **DETENERSE**. No avanzar a la siguiente tarea sin confirmación del usuario.

### 7. Validación Formal (`specs/<id>-<slug>/validation.md`)
- Recorrido requisito por requisito (`RF-1` al `RF-N`).
- Indicación de qué test cubre cada requisito, evidencia de ejecución y veredicto formal de cumplimiento.

### 8. Gestión de Cambios (Change-Driven)
- Ante cualquier nuevo requerimiento, cambio de alcance o ajuste de diseño: **PROHIBIDO modificar código directamente**.
- Flujo: Actualizar primero `spec.md` -> mostrar el diff al usuario -> esperar aprobación -> actualizar `plan.md` y `tasks.md` -> implementar con tests.
