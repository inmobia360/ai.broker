# AI BROKER - instrucciones de desarrollo

Lee `docs/constitution.md`, `docs/sdd-workflow.md` y la especificación activa antes de programar.

- No implementes funciones fuera de la spec aprobada.
- Mantén aislamiento por `tenant_id` en API, base de datos, almacenamiento y logs.
- Nunca guardes secretos, PII ni documentos originales en Git.
- Los subagentes no hablan con el usuario ni escriben memoria canónica.
- Toda acción externa requiere autorización explícita.
- Cada tarea debe incluir tests y actualizar `validation.md`.
