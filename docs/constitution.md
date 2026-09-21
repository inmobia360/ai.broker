# Constitución — AI BROKER

Principios innegociables del proyecto. Toda spec, plan y tarea debe cumplirlos estrictamente:

1. **Aislamiento Multi-tenant Estricto**: Cada consulta, tabla, vector y archivo debe estar filtrado y blindado por `tenant_id` mediante Row Level Security (RLS).
2. **Orquestación Jerárquica**: El agente BROKER es el único interlocutor con el usuario y el único autorizado a escribir en la memoria canónica. Los subagentes son herramientas de cálculo y redacción.
3. **Modo Borrador Seguro (Human-in-the-Loop)**: Prohibido el envío automático de mensajes, contratos o comunicaciones externas sin la autorización explícita y previa del usuario.
4. **Privacidad y Cero Fugas**: Documentos originales con PII (datos personales) nunca se suben a Git ni se envían a APIs públicas. El conocimiento indexado debe estar anonimizado.
5. **La Spec Manda**: Ningún código se escribe sin un Requisito Funcional (RF) numerado y aprobado en la spec activa. Ante dudas, detenerse y clarificar.
6. **Tests como Puerta de Calidad**: Cada tarea termina con sus tests unitarios/de integración en verde. Prohibido avanzar con tests en rojo o con fallos de tipado.
7. **Núcleo Agnóstico e Internacionalizable**: El core de la plataforma es extensible; las regulaciones legales y particularidades fiscales españolas residen en el módulo `countries/spain/`.
