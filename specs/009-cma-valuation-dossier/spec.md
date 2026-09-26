# Spec 009 — Tasador ACM Interactivo, Testigos Homologados, Catastro 3D y Dossier de Captación

## Contexto y Objetivo
En el mercado inmobiliario español, la visita de captación (*listing appointment*) es el momento decisivo para obtener la nota de encargo en exclusiva. Presentar un Análisis Comparativo de Mercado (ACM) riguroso con testigos homologados de la zona, cálculo de banda de cierre notarial (ZOPA), dotaciones a pie y enlace al visor 3D del Catastro diferencia inmediatamente a un agente profesional de la competencia y evita captar producto fuera de precio.

Este módulo (Módulo 3) completa y conecta el sistema de tasación rápida con:
1. **Testigos Homologados de Mercado:** Muestreo de inmuebles comparables en la misma micro-zona ponderados por superficie, estado y conservación.
2. **Cálculo de Banda de Negociación ZOPA:** Cálculo de precio de salida en portales, precio probable de firma en notaría y banda de negociación admisible.
3. **Dossier de Captación Oficial con Marca Blanca:** Generación del informe completo con los datos de acreditación del agente/agencia (API/RAICV/AICAT) y enlaces profundos 3D de Catastro.
4. **Borrador Seguro Human-in-the-Loop:** Integración directa con `DraftApprovalModal` para autorización, descarga y compartición con el propietario.

---

## Requisitos Funcionales (Notación EARS)

### RF-ACM1: Motor de Tasación y Testigos Homologados
- **DADA** una dirección postal o referencia catastral y las características físicas (m², habitaciones, baños, planta, ascensor, año y estado), **EL SISTEMA** debe calcular de forma asíncrona y reactiva el valor medio ponderado del metro cuadrado y seleccionar al menos 3 testigos comparables de la micro-zona.

### RF-ACM2: Cálculo de Horquilla y Banda de Cierre ZOPA
- **EL SISTEMA** debe computar y desglosar 3 niveles de valor:
  1. *Venta Rápida (<30 días)*: Precio de liquidación con descuento sobre mercado (-5%).
  2. *Valor Objetivo Notaría*: Precio medio probable de escrituración pública.
  3. *Precio Salida Portales*: Precio óptimo con margen de negociación del 6% para amortiguar el regateo sin quemar el anuncio.
- Si el propietario aporta una pretensión inicial, **EL SISTEMA** debe calcular el porcentaje de desviación (*gap*) respecto a mercado.

### RF-ACM3: Dotaciones de Entorno e Isócronas Peatonales
- **EL SISTEMA** debe asociar las dotaciones reales a pie en minutos (Metro/Cercanías, Colegios, Centros de Salud, Supermercados y Zonas Verdes) y calcular el WalkScore (0-100) sin alucinaciones.

### RF-ACM4: Generador de Dossier de Captación Profesional
- **EL SISTEMA** debe generar un informe maquetado y listo para entregar al propietario que incluya:
  - Identidad corporativa de la agencia (Nombre, CIF, número de colegiación API/RAICV/AICAT).
  - Ficha física y catastral de la finca.
  - Tabla de testigos comparables y análisis de micro-zona.
  - Horquilla económica y argumentario para defender la exclusiva.
  - Enlaces de exploración a Sede del Catastro y Google Earth 3D.

### RF-ACM5: Modo Borrador Seguro y Activación en 1 Clic
- **CUANDO** el agente pulse *"Generar Dossier de Captación"* en `InteractiveCMA.tsx`, **EL SISTEMA** debe instanciar una `ActionProposal` y desplegar el `DraftApprovalModal` para autorizar la descarga del informe o su remisión por WhatsApp.

### RF-OPS1: Disponibilidad del Dashboard de Producción
- **CUANDO** un usuario abra la ruta principal de la aplicación en un navegador compatible, **EL SISTEMA** debe renderizar el dashboard operativo sin una excepción cliente que impida su uso.
- **SI** ocurre un error recuperable al inicializar un módulo del dashboard, **EL SISTEMA** debe conservar la navegación principal y mostrar un estado de error comprensible en el módulo afectado.
- **Criterio de aceptación:** la ruta `/` renderiza en el build de producción sin excepción cliente y el usuario puede navegar entre el dashboard y las pestañas principales.

---

## Requisitos No Funcionales (RNF)
- **RNF-ACM1 (Tipado Estricto):** Cobertura exhaustiva en TypeScript sin `any` ni errores en `npx tsc --noEmit`.
- **RNF-ACM2 (Suite de Pruebas):** Tests automatizados en `tests/test_cma_valuation_flow.test.ts` con cobertura del 100% de los cálculos económicos y generación del dossier.
- **RNF-ACM3 (Aislamiento de Tenant):** Persistencia y aislamiento estricto por `tenant_id`.

