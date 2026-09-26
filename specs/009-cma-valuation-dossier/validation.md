# Validación — SPEC-009: Tasador ACM Interactivo, Testigos Homologados, Catastro 3D y Dossier de Captación

| Requisito / Tarea | Estado | Evidencia de Validación |
| :--- | :---: | :--- |
| **RF-ACM1:** Cálculo de valoración y testigos homologados | VERDE | `cmaValuator.ts` calcula valor central, metro cuadrado y 3 testigos comparables homologados por micro-zona. Testeado en `tests/test_cma_valuation_flow.test.ts`. |
| **RF-ACM2:** Horquilla de precios y ZOPA de negociación | VERDE | Generación de bandas de Venta Rápida (-5%), Cierre Notarial (mercado) y Salida Portales (+6%) con cálculo de varianza frente a expectativas del propietario. |
| **RF-ACM3:** Dotaciones peatonales y WalkScore | VERDE | Agrupación segura por categorías (`transporte`, `educacion`, `salud`, `zonas_verdes`) con tiempos isócronos a pie y Deep Links a Catastro 3D, Google Earth 3D y Satélite. |
| **RF-ACM4:** Generación de Dossier ACM maquetado | VERDE | Integración en `InteractiveCMA.tsx` con acción `handleGenerateDossierFromCMA` conectada al flujo del Director Broker en `src/app/page.tsx`. |
| **RF-ACM5:** Borrador Seguro Human-in-the-Loop | VERDE | `DraftApprovalModal` intercepta el dossier generado antes de cualquier descarga o envío al exterior, con previsualización completa y aprobación manual. |
| **RNF-1 / RNF-2:** Tipado y Compilación | VERDE | `npx tsc --noEmit` completado con 0 errores y compilación limpia. |
| **RNF-3:** Suite de Tests | VERDE | Suite completa pasando con 142/142 tests en verde (32 suites). |
| **RF-OPS1:** Disponibilidad del Dashboard de Producción | VERDE LOCAL / HOSTINGER PENDIENTE | Reproducido `TypeError` por carga directa de fila `snake_case`; corrección cubierta por normalizador y prueba en `tests/test_white_label.test.ts`. Build local de producción y navegación de Dashboard, Tasador ACM y Pipeline verificados. En esta ejecución, la página pública sigue mostrando una excepción cliente. No se pudo publicar: el remoto `origin` sigue en `a6423ed52ab921d6c81578c4a50b2594e642d71d`, igual que `HEAD`, GitHub CLI no ofrece sesión válida, el cliente Git disponible en el runtime carece de `git-remote-https`, el ejecutable Git instalado en Windows da acceso denegado y no se encontró configuración de despliegue SSH. Además, `scripts/deploy.sh` ejecuta `git reset --hard origin/main` y `docker compose down`, así que no se ejecutó: perdería estos cambios sin publicar y reiniciaría los servicios. |

## Verificación de RF-OPS1

- `npx tsc --noEmit`: OK.
- `npm test`: 142/142 pruebas, 32 suites, 0 fallos.
- `npm run build`: OK (Next.js 15, 17 páginas estáticas generadas).
- Comprobación manual en build local: Dashboard, Tasador ACM y Pipeline renderizan y navegan sin excepción cliente.
- Producción pública: continúa en excepción cliente porque la corrección no llegó a Hostinger. Despliegue bloqueado por falta de canal autenticado Git/SSH; no ejecutar `scripts/deploy.sh` hasta publicar primero los cambios y evitar que su `git reset --hard origin/main` los descarte.


