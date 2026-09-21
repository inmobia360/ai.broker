# Spec 001 — AI Broker Spain MVP

## Contexto y objetivo
Los agentes inmobiliarios independientes y pequeñas agencias (<5 agentes) en España pierden más del 40% de su jornada laboral sentados redactando fichas de portales, preparando contratos legales y respondiendo a consultas de curiosos sin solvencia.
El objetivo de este MVP es proporcionar una plataforma SaaS multi-tenant donde un **Director de Agencia digital (BROKER)** orquesta a asistentes especializados para gestionar expedientes inmobiliarios, redactar contratos adaptados al marco legal español (Arras penitenciales y LAU), clasificar compradores y generar propuestas de marketing, manteniendo siempre el **Modo Borrador Seguro (Human-in-the-Loop)**: la IA nunca envía nada sin autorización humana explícita.

## Usuarios / actores
1. **Agente Independiente / Asesor Inmobiliario**: Usuario que gestiona captaciones, visitas y contratos en solitario.
2. **Director / Broker de Pequeña Agencia**: Usuario responsable de la oficina (2 a 5 agentes) que supervisa expedientes y reparto de tareas.
3. **Agente de Equipo**: Miembro comercial de la agencia con permisos asignados por el Director.
4. **Agente Inteligente BROKER (Sistema)**: Orquestador cognitivo que coordina a los subagentes especializados y consolida la memoria de la agencia.

## Historias de usuario
- **H1**: Como agente inmobiliario, quiero registrarme mediante enlace de invitación para acceder al espacio seguro y aislado de mi agencia.
- **H2**: Como agente, quiero que el asistente me genere un borrador de contrato de arras penitenciales conforme al Código Civil español para no perder horas redactando cláusulas legales.
- **H3**: Como agente o director de agencia, quiero tener la garantía absoluta de que ningún asistente enviará mensajes ni documentos a mis clientes sin mi revisión y validación previa en 1 toque.
- **H4**: Como agente en la calle, quiero recibir avisos cuando entre un comprador cualificado con alta capacidad financiera para llamarle por teléfono o WhatsApp en menos de 15 minutos.
- **H5**: Como director de agencia, quiero que todos los datos, expedientes y documentos de mi agencia estén estrictamente aislados de los de cualquier otra agencia competidora.

## Requisitos funcionales (Criterios de aceptación en notación EARS)

### Módulo de Aislamiento y Autenticación
- **RF-1 (Aislamiento de datos)**: EL SISTEMA debe asociar de forma obligatoria un `tenant_id` válido a toda entidad persistida (usuarios, expedientes, inmuebles, documentos, vectores y logs) y aplicar filtrado por Row Level Security (RLS) en PostgreSQL.
- **RF-2 (Registro por invitación)**: CUANDO un usuario accede con un enlace de invitación válido y no revocado, EL SISTEMA debe permitirle crear su cuenta con correo/contraseña o OAuth y vincularlo al `tenant_id` correspondiente a la invitación.
- **RF-3 (Control de acceso indebido)**: SI un usuario intenta consultar, crear, modificar o borrar registros pertenecientes a un `tenant_id` distinto al de su sesión autenticada, ENTONCES EL SISTEMA debe bloquear la operación inmediatamente, emitir un código de error HTTP 403 Forbidden y registrar una alerta de auditoría de seguridad.

### Módulo de Orquestación y Modo Borrador Seguro
- **RF-4 (Interlocutor único)**: EL SISTEMA debe canalizar todas las peticiones del usuario exclusivamente a través del agente Director BROKER. Los subagentes especializados (Legal, Comercial, Marketing) no deben responder de forma directa ni desintermediada al usuario.
- **RF-5 (Modo Borrador Seguro Innegociable)**: CUANDO cualquier asistente genere un documento legal, ficha de portal o propuesta de respuesta para un cliente, EL SISTEMA debe guardarlo en estado `draft` (borrador pendiente) y notificar al usuario para su revisión.
- **RF-6 (Bloqueo de envíos automáticos)**: SI un asistente intenta ejecutar una acción de envío exterior (vía correo, mensajería o API externa) sin una firma de confirmación humana explícita previa, ENTONCES EL SISTEMA debe abortar la acción y requerir la autorización del agente en la interfaz.
- **RF-7 (Canales de validación)**: CUANDO el usuario pulse el botón de aprobación de un borrador, EL SISTEMA debe ofrecerle la selección del canal de salida: remitir por WhatsApp mediante deep-link web, enviar por correo electrónico o descargar en formato PDF.

### Módulo Legal Inmobiliario de España
- **RF-8 (Arras Penitenciales)**: CUANDO el usuario solicite la formalización de una reserva con señal para un inmueble en España, EL SISTEMA debe generar un borrador de contrato de arras penitenciales referenciando expresamente el artículo 1454 del Código Civil español, especificando las partes, el importe de la señal, el precio final acordado y el plazo máximo de elevación a escritura pública notarial.
- **RF-9 (Arrendamiento Urbano LAU)**: CUANDO el usuario solicite un contrato de alquiler residencial en España, EL SISTEMA debe redactar el borrador conforme a la Ley de Arrendamientos Urbanos (LAU 29/1994) vigente, incorporando la duración mínima legal, las prórrogas obligatorias y el depósito de la fianza legal.
- **RF-10 (Parte de Visita con Blindaje de Honorarios)**: CUANDO el usuario prepare una visita a un inmueble, EL SISTEMA debe generar una hoja de visita con campos para el DNI/NIE del visitante, fecha y hora, dirección de la finca y la cláusula formal de reconocimiento de honorarios de corretaje inmobiliario pactados.

### Módulo Cognitivo y Memoria Vectorial
- **RF-11 (Inferencia privada de coste cero)**: EL SISTEMA debe ejecutar las peticiones de razonamiento y redacción en el modelo Ollama auto-alojado en el VPS de Hostinger (`llama3.1:8b`), sin transmitir información sensible de clientes a nubes públicas de terceros.
- **RF-12 (Fallback cognitivo agnóstico)**: SI el servicio local de Ollama se encuentra saturado, no responde o supera un tiempo límite de 12 segundos, ENTONCES EL SISTEMA debe conmutar automáticamente al proveedor cognitivo de respaldo secundario asegurando que la consulta no falle.
- **RF-13 (Búsqueda semántica aislada)**: CUANDO el BROKER consulte antecedentes o características de expedientes, EL SISTEMA debe ejecutar la búsqueda vectorial (pgvector) condicionada rígidamente al `tenant_id` de la agencia activa.

## Requisitos no funcionales
- **RNF-1 (Seguridad)**: Contraseñas tratadas con hashing Argon2/Bcrypt y tokens de sesión JWT cifrados con expiración configurable.
- **RNF-2 (Privacidad RGPD)**: Ningún documento original con datos de carácter personal (DNI, escrituras, nóminas de clientes) se almacena en repositorios Git ni se comparte entre agencias.
- **RNF-3 (Tiempo de respuesta)**: Tiempo de generación de respuestas locales en Ollama inferior a 3 segundos para peticiones estándar y fallback en menos de 100 ms.
- **RNF-4 (Idioma y redacción)**: Salidas generadas en español peninsular normativo de España, con ortografía impecable, eliminando anglicismos innecesarios y clichés comerciales vacíos.

## Casos límite
- **Documento con datos incompletos**: Si falta el precio de venta o el DNI del vendedor al redactar las arras, el sistema debe señalar explícitamente los campos faltantes con `[PENDIENTE: DNI]` en el borrador sin inventar números.
- **Inyección de tenant malicioso**: Si una petición entrante incluye un `tenant_id` manipulado en cabeceras o cuerpo, el servidor debe descartarlo y forzar únicamente el `tenant_id` derivado del token de sesión verificado.
- **Caída de red o desconexión**: El estado del borrador se preserva en base de datos local y permite reanudar la revisión sin pérdida de información.

## Fuera de alcance (MVP inicial)
- Cobro activo recurrente mediante pasarela Stripe (el código estará preparado con feature-flag, pero inactivo durante la fase beta cerrada).
- Publicación automática directa sin mediación en las APIs de Idealista y Fotocasa.
- Chatbot público autónomo de atención en WhatsApp sin supervisión.
- Adaptadores legales para países fuera de España (se crearán en futuras especificaciones bajo `countries/`).

## Criterios de finalización
1. Todos los requisitos funcionales (RF-1 al RF-13) implementados y cubiertos por tests unitarios o de integración en verde (`npm test`).
2. Compilación de producción (`npm run build`) limpia y sin errores de TypeScript (`npx tsc --noEmit`).
3. Prueba e2e del flujo principal: Invitación -> Creación de expediente -> Generación de Arras en borrador -> Validación manual -> Generación de PDF/WhatsApp.
4. Documento `validation.md` actualizado con evidencia verificada de cada RF.

## Dudas abiertas
- Ninguna pendiente de resolución para el MVP 001.
