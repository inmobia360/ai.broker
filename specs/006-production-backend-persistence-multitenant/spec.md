# Spec 006 — Producción Backend: Persistencia Multi-Tenant, Control de Plazas (1-5 Agentes) y Adaptador Internacional

## 1. Contexto y Objetivos
Esta especificación define los requisitos funcionales y no funcionales para convertir la interfaz visual de `app.inmobia360.com` en una plataforma de producción completa y robusta:
1. Conectar la base de datos PostgreSQL 16 con políticas de Row Level Security (RLS) a todas las entidades del negocio (Propiedades, Leads, Pipeline de 7 fases y Marca Blanca).
2. Implementar el control de acceso y autenticación con limitación estricta de plazas (1 agente autónomo vs hasta 5 integrantes para agencias boutique).
3. Diseñar una arquitectura desacoplada y replicable ("franquiciable") mediante un Adaptador Internacional (`CountryAdapter`), comenzando con España (`country: 'ES'`) y permitiendo incorporar futuros países sin alterar el núcleo.

---

## 2. Requisitos Funcionales (EARS)

### Persistencia y Modelos de Datos
* **RF-P1**: El sistema DEBERÁ persistir las propiedades (`properties`) en PostgreSQL 16 con campos obligatorios (`id`, `tenant_id`, `title`, `price`, `location`, `bedrooms`, `bathrooms`, `built_area_m2`, `operation_type`, `status`, `walkscore`, `created_at`).
* **RF-P2**: El sistema DEBERÁ persistir los leads comerciales (`leads`) con campos (`id`, `tenant_id`, `full_name`, `phone`, `email`, `budget`, `timeframe`, `demand_quote`, `hot_score`, `recommended_action`, `status`, `assigned_agent_id`).
* **RF-P3**: El sistema DEBERÁ gestionar el ciclo del Pipeline de 7 fases (`pipeline_deals`) vinculando propiedad, lead, fase actual (`captacion`, `valoracion`, `comercializacion`, `visitas`, `negociacion`, `arras`, `postventa_cierre`), valor estimado y comisión prevista.
* **RF-P4**: El sistema DEBERÁ almacenar la configuración de marca blanca (`agency_branding`) por `tenant_id`, incluyendo logotipo, nombre comercial, colores primario y acento, NIF/CIF, colegiación oficial y cupo máximo de agentes autorizados (1 o 5).

### Aislamiento y Control de Capacidad (1 a 5 Plazas)
* **RF-P5**: Todas las tablas de negocio DEBERÁN tener activada la política `FORCE ROW LEVEL SECURITY` y una columna `tenant_id UUID NOT NULL`.
* **RF-P6**: Cuando se intente registrar o invitar a un usuario a un equipo boutique, el sistema DEBERÁ verificar que el número total de usuarios activos para dicho `tenant_id` no supere **5 integrantes**. Si se supera, la operación DEBERÁ ser rechazada con código HTTP 403 `CAPACITY_LIMIT_EXCEEDED`.
* **RF-P7**: Cuando el plan contratado sea "Agente Autónomo", el sistema DEBERÁ limitar la capacidad a **1 único usuario**.

### Autenticación y Sesiones
* **RF-P8**: El sistema DEBERÁ proveer endpoints de autenticación (`/api/auth/login`, `/api/auth/me`, `/api/auth/logout`) utilizando contraseñas cifradas con bcrypt y tokens de sesión firmados criptográficamente.
* **RF-P9**: El sistema DEBERÁ proveer una pantalla de inicio de sesión (`/login`) en tema corporativo claro.

### Capa de Adaptación Internacional (Multi-País)
* **RF-P10**: El sistema DEBERÁ estructurarse mediante una interfaz `CountryAdapter` que abstraiga:
  - Formato y símbolo de moneda (España: EUR `€`).
  - Identificadores fiscales oficiales (España: NIF / CIF / NIE).
  - Fuentes de datos catastrales (España: Sede Electrónica del Catastro).
  - Marco normativo de contratos (España: Código Civil Art. 1454 y 1462, LAU 29/1994, LPH Art. 9.1.e).
* **RF-P11**: El adaptador para España (`SpainCountryAdapter`) DEBERÁ ser la implementación activa por defecto, garantizando que el resto del sistema no dependa de cadenas de texto estáticas para leyes o monedas.

---

## 3. Requisitos No Funcionales (RNF)
* **RNF-P1**: Cero fugas de información entre tenants (RLS estricto verificado en pruebas unitarias).
* **RNF-P2**: Tiempo de respuesta de endpoints CRUD inferior a 250 ms en consultas estándar.
* **RNF-P3**: Código 100% tipado en TypeScript estricto con interfaces completas y sin uso de `any`.
