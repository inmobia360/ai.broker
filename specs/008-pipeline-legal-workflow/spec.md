# SPEC-008: Conexión End-to-End: Lead Captado ➔ Pipeline Kanban ➔ Hoja de Visita ➔ Arras

## 1. Resumen Ejecutivo
Implementación del ciclo comercial completo para el agente suscrito:
Desde que entra un contacto potencial (vía landing pública, QR de escaparate o alta directa) hasta el cierre legal de la operación.
El agente puede gestionar el embudo en el Pipeline interactivo y, con un solo clic, generar los documentos legales oficiales vinculantes bajo la legislación española:
1. **Hoja de Encargo de Visita Inmobiliaria** (con reserva y blindaje de honorarios de corretaje frente a elusión, RGPD y firma digital).
2. **Contrato de Arras Penitenciales** (conforme al Art. 1454 del Código Civil español, con retención del 10% de señal, plazos notariales y cláusulas resolutorias).
3. **Certificado de Deuda Cero LPH (Art. 9.1.e)** y **Acta de Entrega de Llaves con lectura de contadores y CUPS**.

Todo documento se emite en **Modo Borrador Seguro (Human-in-the-Loop)** antes de cualquier envío o firma exterior.

## 2. Requisitos Funcionales (RF)
- **RF-PIPE1 (Interacción de Fases en Pipeline):** El agente puede mover expedientes entre las 7 fases del ciclo inmobiliario y filtrar por estado.
- **RF-VISITA (Generación de Hoja de Visita en 1 Clic):** Genera la Hoja de Visita personalizada con los datos del visitante, del inmueble y los honorarios de la agencia.
- **RF-ARRAS (Redacción de Contrato de Arras Art. 1454 C.C.):** Genera el contrato completo de arras penitenciales con los datos de comprador, vendedor, finca registral, precio pactado y arras del 10%.
- **RF-MODAL (Previsualización y Aprobación Segura):** El agente previsualiza el documento generado, puede editarlo, aprobarlo o descargarlo en PDF.
- **RF-SYNC (Sincronización de Leads con Pipeline):** Los leads calientes captados se pueden convertir en expedientes activos del Pipeline.

## 3. Requisitos No Funcionales (RNF)
- **RNF-1:** Cumplimiento del Art. 1454 C.C., LAU y LPH española.
- **RNF-2:** Tipado estricto TypeScript (`npx tsc --noEmit` = 0 errores).
- **RNF-3:** Suite de tests automatizados al 100% en verde.
