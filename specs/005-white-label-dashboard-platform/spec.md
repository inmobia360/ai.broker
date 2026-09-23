# Spec 005 — Plataforma SaaS Unificada: Dashboard Operativo Marca Blanca, Comunidad LPH y Postventa Física

## Contexto y Objetivo
`app.inmobia360.com` es la herramienta SaaS de trabajo diario en producción para agentes inmobiliarios independientes y pequeñas agencias (de 1 a 5 integrantes) en España.
Esta especificación unifica la interfaz comercial y operativa demostrada en `https://inmobia360.com/app/dashboard/` con el motor jurídico y de IA del Director BROKER, adaptándola a un formato de **marca blanca** (white-label) y completando el ciclo físico del inmueble con:
1. El **Módulo de Comunidad de Propietarios (LPH) y Finca Madre** (con solicitud fehaciente de certificado de saldo cero conforme al Art. 9.1.e LPH).
2. El **Módulo de Postventa Física: Entrega de Llaves, Lectura de Contadores y Suministros** (con inventario de llaves y códigos CUPS de electricidad, agua y gas).
3. La interfaz visual interactiva con el **Tasador ACM**, el **Pipeline Kanban de 7 fases**, el **Centro de Leads Calientes de Acción Inmediata**, la **Cartera de Propiedades Activas**, el **Estudio de Contenidos IA** y el **Copiloto Director BROKER con Human-in-the-Loop**.

---

## Terminología Institucional y Mapeo Conceptual
- **Marca Blanca (White-Label)**: Capacidad de la plataforma para personalizar el nombre de la agencia, logotipo, colores de acento, datos fiscales y datos de contacto de cara a los clientes finales y documentos emitidos.
- **Equipo de Agencia (1 a 5 integrantes)**: Gestión colaborativa de plazas o asientos (Broker Titular, Agente Asociado, Coordinador) bajo estricto aislamiento de datos (`tenant_id`).
- **Certificado de Deuda Cero (Art. 9.1.e LPH)**: Certificación expedida por el Secretario con el visto bueno del Presidente (o por el Administrador de Fincas colegiado) exigida por ley ante notario para transmitir la vivienda libre de cargas comunitarias.
- **Acta de Entrega de Llaves y Toma de Posesión**: Documento contractual vinculante que acredita la transmisión material de la posesión, inventario de juegos de llaves y mandos, y renuncia de posesión del transmitente.
- **Lectura de Contadores y Traspaso de Suministros**: Registro fehaciente en fecha de entrega de las lecturas numéricas de luz (código CUPS), agua y gas para el prorrateo de consumos y solicitud de cambio de titularidad sin baja de servicio.
- **Modo Borrador Seguro (Human-in-the-Loop)**: Principio innegociable de la plataforma por el cual ningún documento, mensaje o solicitud legal sale de la agencia sin autorización explícita de un agente.

---

## Requisitos Funcionales (Notación EARS)

### Módulo Comunidad LPH y Finca Madre
- **RF-WLD1 (Gestión de Finca Madre y Régimen LPH)**: DADA una propiedad gestionada, EL SISTEMA debe permitir registrar y consultar los datos de la comunidad (año de finca, ITE/IEE, coeficiente de participación, cuota ordinaria mensual, fondo de reserva Art. 9.1.f, derramas aprobadas pendientes de cobro y datos del Administrador de Fincas).
- **RF-WLD2 (Generador de Solicitud de Certificado Art. 9.1.e LPH)**: CUANDO el agente prepare la tramitación notarial, EL SISTEMA debe generar en modo borrador seguro (`draft_pending`) el escrito formal de requerimiento al Administrador de Fincas solicitando el certificado de estar al corriente de pago de gastos de comunidad conforme al Art. 9.1.e de la Ley 49/1960.

### Módulo Postventa Física: Llaves y Suministros
- **RF-WLD3 (Acta de Entrega de Llaves y Toma de Posesión)**: CUANDO se produzca la entrega material del inmueble, EL SISTEMA debe generar en borrador seguro el acta de entrega con inventario desglosado de llaves (portal, puerta principal, buzón, trastero, anejos y mandos de garaje) y cláusula de posesión pacífica.
- **RF-WLD4 (Hoja de Lectura de Contadores y Traspaso de Suministros)**: EL SISTEMA debe permitir consignar las lecturas de los contadores en fecha de entrega (electricidad con código CUPS y kWh, agua con número de contador y m³, y gas) y generar la minuta formal para tramitar el cambio de titular ante las empresas comercializadoras.

### Dashboard Operativo Marca Blanca
- **RF-WLD5 (Panel General con KPIs y Leads Calientes)**: EL SISTEMA debe presentar una vista de mando con métricas de cartera, accesos rápidos y un bloque de **Leads Calientes Prioritarios de Acción Inmediata** con enlaces directos a WhatsApp, llamada telefónica y generación de dossier Cap Rate.
- **RF-WLD6 (Catálogo de Propiedades & Mapa)**: EL SISTEMA debe permitir visualizar la cartera inmobiliaria en tres modos conmutables: Cuadrícula de tarjetas, Lista ejecutiva y Mapa territorial interactivo.
- **RF-WLD7 (Pipeline Kanban de 7 Fases)**: EL SISTEMA debe ofrecer un tablero visual interactivo con las 7 fases del ciclo inmobiliario (*Captación, Calificación, Comercialización, Negociación, Arras, Tramitación Notarial, Postventa*), permitiendo clasificar y gestionar el avance de los expedientes.
- **RF-WLD8 (Tasador ACM Interactivo)**: EL SISTEMA debe integrar un calculador visual de Análisis Comparativo de Mercado con formulario de parámetros (m², estado, ascensor, zona), visualización inmediata de las 3 bandas de precio, y accesos directos 3D a Google Earth y Catastro.
- **RF-WLD9 (Estudio de Contenidos IA Multicanal)**: EL SISTEMA debe permitir redactar anuncios comerciales adaptados para Idealista/Fotocasa, redes sociales y WhatsApp mediante el motor cognitivo con un clic.
- **RF-WLD10 (Configuración de Marca Blanca y Equipo de 1-5 Agentes)**: EL SISTEMA debe permitir personalizar el nombre comercial, logotipo, colores, datos fiscales y gestionar hasta 5 integrantes del equipo (roles y correos) bajo el `tenant_id` de la agencia.

### Requisitos No Funcionales (Seguridad y Rendimiento)
- **RNF-WLD1 (Aislamiento Estricto por Tenant)**: Ningún dato de propiedades, leads, miembros del equipo o configuraciones de marca blanca puede ser accesible ni filtrado hacia otras agencias competidoras.
- **RNF-WLD2 (Borrador Seguro / Human-in-the-Loop)**: Todas las actas, cartas LPH y contratos se emiten en estado `draft_pending` con modal de aprobación y canales de descarga PDF y WhatsApp.
