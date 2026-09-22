# Spec 003 — Motor de Expedientes y Emparejamiento Inverso de Demanda

## Contexto y objetivo
Los agentes inmobiliarios independientes y pequeñas agencias en España invierten una cantidad desproporcionada de tiempo en tareas documentales manuales tras avanzar una operación inmobiliaria.
Esta especificación implementa el **Motor Proactivo de Expedientes** de **AI BROKER**, que estructura la operación a lo largo de su ciclo de vida natural, anticipando y redactando automáticamente los borradores contractuales en cada etapa y ejecutando el **Emparejamiento Inverso de Demanda** mediante vectores semánticos en `pgvector`. 
Asimismo, se incorpora el **Módulo de Negociación** para calcular rangos viables de contraoferta entre las pretensiones económicas del vendedor y la solvencia del comprador, asegurando que el agente solo deba **editar, validar y enviar** con un clic.

---

## Terminología Institucional y Mapeo Conceptual
Para garantizar originalidad, elegancia y protección de propiedad intelectual, el sistema adopta la siguiente terminología profesional adaptada al mercado inmobiliario de España:
- **Expediente Inmobiliario (`dossier`)**: Unidad troncal de gestión que agrupa finca, titulares, compradores interesados, ofertas y documentos.
- **Emparejamiento Inverso de Demanda**: Cruce proactivo entre un inmueble captado y la cartera histórica de compradores cualificados de la agencia utilizando embeddings vectoriales (`vectorStore`).
- **Módulo de Negociación (Banda de Acuerdo)**: Algoritmo de encaje financiero que calcula la horquilla de viabilidad económica entre la expectativa mínima del propietario y el techo de compra cualificado.
- **Protocolo de Seguridad Jurídica y Contingencias**: Protocolo asistido para detectar y resolver afecciones registrales, discrepancias catastro-registro o cargas antes de elevar a público.
- **Cierre Comercial**: Aceptación formal de la propuesta económica y encargo de arras.
- **Cierre Documental**: Formalización legal vinculante mediante Arras Penitenciales (Art. 1454 C.C.) con depósito custodiado.

---

## Usuarios / Actores
1. **Agente Asesor**: Usuario operativo que recibe las alertas de emparejamiento, utiliza el módulo de negociación y aprueba los borradores.
2. **Director de Agencia**: Responsable que audita los márgenes comerciales, los expedientes en curso y las autorizaciones legales.
3. **Director BROKER (IA)**: Copiloto central que anticipa la redacción documental en cada cambio de fase y ejecuta las búsquedas vectoriales de demanda.

---

## Requisitos Funcionales (Notación EARS)

### Ciclo de Vida del Expediente Inmobiliario
- **RF-M1 (Máquina de Estados del Expediente)**: EL SISTEMA debe gobernar el estado de cada expediente inmobiliario mediante una máquina de estados finita con las siguientes etapas tipadas:
  1. `captacion`: Encargo formal de comercialización y recopilación inicial de datos.
  2. `comercializacion`: Inmueble activo en cartera, visitas físicas y seguimiento de interesados.
  3. `negociacion`: Oferta recibida, análisis de banda de acuerdo y contrapropuestas.
  4. `cierre_comercial`: Acuerdo de voluntades en precio y condiciones de compra.
  5. `cierre_documental`: Formalización de contrato de arras penitenciales o contrato de arrendamiento.
  6. `tramitacion_notarial`: Preparación del dossier de firma (certificados, deudas, IBI y medios de pago).
  7. `postventa`: Liquidación de honorarios, cambio de suministros y archivo definitivo.

- **RF-M2 (Generación Proactiva al Cambio de Etapa)**: CUANDO un expediente transicione de etapa, EL SISTEMA debe generar de forma proactiva el borrador del documento legal correspondiente en estado `draft_pending` sin requerir redacción manual:
  - Al entrar en `captacion`: Genera borrador de *Nota de Encargo de Venta con Honorarios Protegidos*.
  - Al pasar a `comercializacion`: Prepara la *Hoja de Visita con Reserva de Corretaje*.
  - Al alcanzar `cierre_comercial`: Genera el contrato de *Arras Penitenciales (Art. 1454 C.C.)*.
  - Al avanzar a `tramitacion_notarial`: Genera la *Ficha de Control y Checklist de Notaría*.

### Emparejamiento Inverso de Demanda
- **RF-M3 (Matching Vectorial de Compradores)**: CUANDO se dé de alta o actualice un inmueble en comercialización, EL SISTEMA debe comparar el perfil del inmueble (precio, ubicación, superficie, dormitorios y tipología) contra la memoria vectorial (`pgvector`) de compradores registrados del tenant.
- **RF-M4 (Umbral de Afinidad y Alertas Proactivas)**: EL SISTEMA debe seleccionar los compradores cuya similitud vectorial sea igual o superior a 0.75 (75% de encaje) y redactar una propuesta de mensaje personalizada para cada uno, lista para ser revisada y enviada por WhatsApp o correo.

### Módulo de Negociación y Cierres
- **RF-M5 (Cálculo de Banda de Acuerdo Viable)**: CUANDO se registre una oferta económica inferior al precio de salida, EL SISTEMA debe evaluar el precio mínimo autorizado por el vendedor en la nota de encargo, el valor medio de mercado de la zona y la solvencia del oferente, emitiendo una recomendación analítica con la horquilla de contraoferta sugerida.
- **RF-M6 (Argumentario de Cierre Comercial)**: EL SISTEMA debe generar automáticamente los puntos clave de defensa del precio y condiciones (plazo de escrituración, perfil financiero, entrega de señal) para asistir al agente en la reunión física de negociación.

### Protocolo de Seguridad Jurídica y Contingencias
- **RF-M7 (Detección de Afecciones Registrales)**: CUANDO el agente introduzca los datos de la Nota Simple registral, EL SISTEMA debe identificar menciones a hipotecas previas, embargos, servidumbres, afecciones fiscales o discrepancias de superficie catastro-registro, emitiendo una alerta con los pasos requeridos para su subsanación antes de notaría.

### Memoria Operativa Estructurada y Aprendizaje de Casos
- **RF-M8 (Memoria de Casos Resueltos y Aprendizaje Continuo)**: EL SISTEMA debe estructurar y persistir vectorialmente los antecedentes de operaciones, cláusulas especiales acordadas, resolución de incidencias registrales y objeciones comerciales superadas en 4 categorías:
  1. `negociacion_objeciones`: Argumentos y encajes de precio que desbloquearon acuerdos previos.
  2. `contingencias_resueltas`: Soluciones aplicadas con éxito a cargas registrales, herencias o discrepancias catastrales.
  3. `politicas_comerciales`: Criterios particulares de honorarios, exclusividades y plazos de la agencia.
  4. `patrones_demanda`: Preferencias recurrentes y solvencia de compradores por zona.
  CUANDO el Director BROKER analice una nueva operación o consulta, debe recuperar automáticamente los precedentes más afines de la agencia mediante búsqueda semántica en `pgvector`, utilizándolos como contexto para perfeccionar la respuesta.

---

## Requisitos No Funcionales y Buenas Prácticas
- **RNF-M1 (Aislamiento Multi-tenant Estricto)**: El emparejamiento inverso solo debe contrastar inmuebles y compradores pertenecientes al mismo `tenant_id`. Ningún dato de demanda puede compartirse entre agencias competidoras.
- **RNF-M2 (Latencia de Emparejamiento)**: La consulta vectorial de emparejamiento en `pgvector` debe resolverse en menos de 250 milisegundos para bases de datos de hasta 50.000 registros de demanda.
- **RNF-M3 (Cumplimiento RGPD en España)**: Los borradores de comunicación a compradores emparejados deben respetar la normativa española de protección de datos (LODGDD 3/2018), incluyendo consentimiento explícito de recepción de oportunidades.
