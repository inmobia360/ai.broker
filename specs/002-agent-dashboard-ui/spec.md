# Spec 002 — Agent Dashboard UI (Interfaz Operativa de Agencia)

## Contexto y objetivo
Con el backend, aislamiento multi-tenant RLS, motor cognitivo con Ollama en VPS Hostinger y generadores legales de España completados en la Spec 001, esta especificación define la **interfaz de usuario web oficial (Dashboard)** para agentes independientes y directores de agencia.
El objetivo es proporcionar un panel de control interactivo con el estilo visual institucional *Dark Slate* de `inmobia360`, que permita dialogar con el Director BROKER, gestionar expedientes, auditar la caja fuerte documental y ejecutar la aprobación humana (*Human-in-the-Loop*) de borradores de contratos en 1 clic hacia WhatsApp, Email o descarga directa de PDF.

## Usuarios / actores
1. **Agente Inmobiliario**: Usuario que consulta al Director BROKER, solicita contratos y valida borradores para enviar a sus clientes.
2. **Director de Agencia**: Usuario que supervisa los expedientes activos, el estado de las propuestas y la salud del motor de inteligencia artificial.
3. **Director BROKER (IA)**: Copiloto central que responde consultas y emite propuestas de acción en modo borrador seguro.

## Historias de usuario
- **H-UI-1**: Como agente inmobiliario, quiero hablar en lenguaje natural con el Director BROKER y recibir propuestas legales estructuradas y fichas claras sin jerga robótica.
- **H-UI-2**: Como agente, quiero poder previsualizar el texto íntegro de un contrato de Arras (Art. 1454 C.C.) o Alquiler (LAU) generado por la IA antes de darle el visto bueno.
- **H-UI-3**: Como agente, quiero aprobar un borrador con 1 solo clic y elegir si enviarlo a mi cliente por WhatsApp con el mensaje ya redactado, enviarlo por correo o descargarlo en PDF.
- **H-UI-4**: Como agente o director, quiero ver en todo momento si el motor cognitivo de la agencia está conectado a Ollama o al fallback de seguridad y su tiempo de respuesta.
- **H-UI-5**: Como agente, quiero explorar los expedientes inmobiliarios en curso y pedirle al broker que redacte los documentos asociados al inmueble seleccionado.

## Requisitos funcionales (Criterios de aceptación EARS)

### Módulo de Chat y Propuestas Interactivas
- **RF-UI-1 (Chat reactivo con Director BROKER)**: EL SISTEMA debe permitir el envío de mensajes a `/api/chat`, mostrando animación de razonamiento y renderizando la respuesta del broker junto con sus tarjetas de propuestas de acción.
- **RF-UI-2 (Tarjetas de Borrador Seguro)**: CUANDO el Director BROKER emita una propuesta de contrato o documento exterior, EL SISTEMA debe renderizarla como una tarjeta con distintivo de estado `draft_pending`, identificador único, tipo de acción y botones de "Aprobar y Enviar" o "Descartar".
- **RF-UI-3 (Modal de Revisión y Canal de Salida)**: CUANDO el usuario presione "Aprobar y Enviar", EL SISTEMA debe abrir un modal de confirmación con previsualización del texto legal y selector de canal:
  1. *WhatsApp*: Genera enlace `https://wa.me/?text=...` con el texto formateado.
  2. *Descarga de PDF*: Llama a `/api/drafts/[id]/pdf` y descarga el binario firmado.
  3. *Email*: Prepara el envío transaccional del expediente.
- **RF-UI-4 (Rechazo seguro)**: CUANDO el usuario presione "Descartar", EL SISTEMA debe actualizar el estado a `rejected` y bloquear cualquier intento de transmisión.

### Módulo de Expedientes y Caja Fuerte
- **RF-UI-5 (Gestor de Expedientes)**: EL SISTEMA debe mostrar la lista de inmuebles en comercialización clasificados por tipo de operación (Venta / Alquiler LAU) con acceso directo a "Generar Arras" o "Preparar Visita".
- **RF-UI-6 (Caja Fuerte Documental)**: EL SISTEMA debe listar los documentos aprobados y auditados de la agencia, permitiendo su descarga inmediata en PDF.

### Módulo de Monitorización de Sistema
- **RF-UI-7 (Monitor de Salud del Motor Cognitivo)**: EL SISTEMA debe consultar periódicamente `/api/health` y reflejar en la cabecera el estado de conexión del motor de IA (`Hostinger Ollama` o `Cognitive Fallback`) y la latencia en milisegundos.

### Módulo de Identidad Visual en Acceso
- **RF-UI-8 (Marca legible en acceso)**: CUANDO el usuario abra la pantalla de acceso sobre un fondo claro, EL SISTEMA debe mostrar el logotipo oficial completo de Inmobia 360 con contraste suficiente y tamaño legible para distinguir el isotipo, el nombre y el descriptor de marca.

## Requisitos no funcionales
- **RNF-UI-1 (Identidad Visual)**: Interfaz desarrollada con Tailwind CSS respetando la paleta *Dark Slate* institucional (`bg-slate-950`, acentos `blue-600` / `indigo-500`, bordes `slate-800`).
- **RNF-UI-2 (Tipografía y Ortografía)**: Textos íntegramente en español peninsular normativo con codificación UTF-8 impecable (sin caracteres corruptos ni signos `?`).
- **RNF-UI-3 (Rendimiento)**: Carga inicial de interfaz inferior a 1,5 segundos y transiciones entre pestañas instantáneas sin recarga completa de página.

