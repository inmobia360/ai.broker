# Validación y Verificación — Spec 002: Agent Dashboard UI

## Matriz de Cobertura de Requisitos

| Requisito | Descripción | Prueba / Verificación | Estado |
| :--- | :--- | :--- | :---: |
| **RF-UI-1** | Chat reactivo con Director BROKER y propuestas | Envío a `/api/chat` y renderizado de tarjetas | APROBADO |
| **RF-UI-2** | Tarjetas de Borrador Seguro con estado `draft_pending` | Visualización de badges y botones de acción | APROBADO |
| **RF-UI-3** | Modal de aprobación con selección de canal (WhatsApp, PDF) | Apertura de modal y llamada a `/api/drafts/[id]/approve` | APROBADO |
| **RF-UI-4** | Rechazo seguro con estado `rejected` | Bloqueo de transmisión exterior y actualización de UI | APROBADO |
| **RF-UI-5** | Gestor de Expedientes con acciones rápidas | Selección de expediente y solicitud de contrato | APROBADO |
| **RF-UI-6** | Caja Fuerte Documental con descarga directa | Lista de documentos aprobados y descarga de PDF | APROBADO |
| **RF-UI-7** | Monitor de salud del motor de IA en cabecera | Conexión con `/api/health` y visualización de proveedor | APROBADO |
| **RF-UI-8** | Logotipo legible sobre fondo claro de acceso | Build local: revisión visual de isotipo, “INMOBIA 360” y descriptor | APROBADO LOCAL |
| **RNF-UI-2** | Textos en español peninsular normativo sin corrupción UTF-8 | Auditoría visual de caracteres (tildes, eñes, aperturas) | APROBADO |

## Verificación de Compilación y Calidad
```bash
npx tsc --noEmit
npm test
npm run build
```

## Verificación de RF-UI-8

- `npx tsc --noEmit`: OK.
- Suite completa: 142/142 pruebas, 32 suites, 0 fallos.
- `npm run build`: OK.
- `/login` en el build local muestra el logotipo oficial completo con texto y descriptor legibles en fondo claro.

