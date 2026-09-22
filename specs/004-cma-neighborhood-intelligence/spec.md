# Spec 004 — Motor de Prevaloración Rápida (ACM), Análisis de Micro-Zona y Enlaces de Entorno 3D

## Contexto y Objetivo
En el mercado inmobiliario de España peninsular, la captación de un inmueble a precio de mercado es el factor determinante del éxito de una agencia o agente independiente. Discutir el precio de salida "a ojo" con el propietario genera desconfianza o la aceptación de precios fuera de mercado que quedan estancados meses.
Asimismo, redactar anuncios para portales (Idealista, Fotocasa) consultando manualmente distancias en Google Maps consume tiempo valioso.

Esta especificación dota a **AI BROKER** de:
1. Un **Motor de Análisis de Micro-Zona y Dotaciones** que calcula distancias a pie (isócronas) a transporte público, colegios, centros de salud y zonas verdes.
2. Un **Motor de Prevaloración Rápida (ACM - Análisis Comparativo de Mercado)** que calcula horquillas de salida y precio probable de cierre en notaría ajustadas por factores de la finca y del barrio.
3. Un **Generador de Copys Comerciales Enriquecidos** con datos de dotaciones reales.
4. Un **Generador de Enlaces Profundos 3D / Satelitales** para que el cliente final explore el entorno del inmueble desde WhatsApp antes de la visita física.

---

## Terminología Institucional y Mapeo Conceptual
- **Prevaloración Rápida (ACM)**: Análisis Comparativo de Mercado que estima el valor venal orientativo de una finca cruzando testigos de la zona, superficie construida, antigüedad y dotaciones.
- **Micro-Zona e Isócrona**: Radiografía del entorno inmediato en radios caminables de 5 y 10 minutos (300m - 800m).
- **Dotaciones Esenciales**: Servicios de primera necesidad (Metro, Cercanías, Autobús, Colegios, Centros de Atención Primaria, Supermercados, Parques).
- **Enlace de Entorno 3D (Deep Link)**: URL parametrizada y ligera con coordenadas, inclinación y radio visual que abre una vista cenital/aérea interactiva de la finca.

---

## Requisitos Funcionales (Notación EARS)

### Análisis Geoespacial y Dotaciones de Barrio
- **RF-CMA1 (Extracción de Dotaciones de Barrio)**: DADA una dirección postal o referencia catastral, EL SISTEMA debe identificar las dotaciones esenciales situadas en un radio caminable (transporte, educación, salud, comercio y zonas verdes), calculando la distancia lineal y el tiempo estimado a pie en minutos.

### Motor de Prevaloración Rápida (ACM)
- **RF-CMA2 (Cálculo de Horquilla de Mercado)**: DADOS los datos del inmueble (superficie construida m², año de construcción, estado de conservación y tipología) y su micro-zona, EL SISTEMA debe calcular:
  1. Valor medio estimado por m² en la zona.
  2. Precio de salida recomendado en portales.
  3. Precio objetivo de cierre en notaría (con descuento medio de negociación).
  4. Banda de negociación sugerida para la nota de encargo.

- **RF-CMA3 (Dossier de Prevaloración en Borrador Seguro)**: EL SISTEMA debe generar de forma proactiva el informe maquetado de Prevaloración para la visita de captación en estado `draft_pending`, asegurando que el agente pueda editarlo y validarlo antes de entregarlo al propietario (*Human-in-the-Loop*).

### Copys Comerciales y Enlaces de Entorno
- **RF-CMA4 (Generador de Anuncios Inmobiliarios Enriquecidos)**: CUANDO el agente solicite la redacción de un anuncio para portales, EL SISTEMA debe generar una descripción publicitaria atractiva en español peninsular normativo, integrando automáticamente las dotaciones reales del barrio calculadas por el motor geoespacial sin inventar servicios inexistentes.

- **RF-CMA5 (Generador de Deep Links de Exploración 3D / Satelital)**: EL SISTEMA debe generar enlaces profundos interactivos con coordenadas precisas (Google Earth 3D, Catastro e imágenes satelitales) para incrustarlos en el mensaje de prospección o ficha técnica de WhatsApp destinada al comprador.

### Seguridad y Aislamiento
- **RNF-CMA1 (Aislamiento Multi-tenant)**: Todas las consultas de micro-zona, informes de prevaloración y borradores de anuncios deben asociarse estrictamente al `tenant_id` de la agencia, impidiendo el acceso a agencias competidoras.
