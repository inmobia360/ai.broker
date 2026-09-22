# Guía de Despliegue en VPS Hostinger — AI BROKER

Esta guía describe el procedimiento paso a paso para desplegar **AI BROKER** en un VPS de Hostinger utilizando Docker Compose, PostgreSQL 16 con `pgvector` y el motor cognitivo Ollama.

---

## 1. Sincronización Local con GitHub

Desde tu terminal de PowerShell o bash en tu ordenador local:

```bash
cd C:\Users\Usuario\Documents\AI_BROKER
git push -u origin main
```

*(Si es la primera vez que sincronizas, Git Credential Manager abrirá una ventana de tu navegador para autorizar la conexión con GitHub).*

---

## 2. Conexión al VPS Hostinger

Conéctate por SSH a tu servidor Hostinger:

```bash
ssh root@<IP_DE_TU_VPS>
```

Asegúrate de que Docker y Docker Compose estén instalados en el VPS:

```bash
docker --version
docker compose version
```

*(Si no están instalados en Ubuntu/Debian: `apt update && apt install -y docker.io docker-compose-plugin`)*.

---

## 3. Clonar o Actualizar el Repositorio

Si es la primera instalación:
```bash
cd /opt
git clone https://github.com/inmobia360/ai.broker.git ai-broker
cd ai-broker
```

Si el repositorio ya estaba clonado previamente:
```bash
cd /opt/ai-broker
git pull origin main
```

---

## 4. Configurar Variables de Entorno

Copia el archivo de ejemplo a `.env`:

```bash
cp .env.example .env
nano .env
```

Configura las variables críticas:
- `DATABASE_URL`: `postgresql://broker_user:TU_CONTRASEÑA_SEGURA@postgres:5432/ai_broker_db`
- `NEXTAUTH_SECRET`: Genera una clave aleatoria segura ejecutando `openssl rand -base64 32`.
- `OLLAMA_URL`: `https://ollama-pisf.srv1823868.hstgr.cloud/api/chat` (o la URL de tu endpoint Ollama).
- `OLLAMA_MODEL`: `llama3.1:8b`
- `STORAGE_LOCAL_PATH`: `./storage/private`

---

## 5. Despliegue de Contenedores

Ejecuta Docker Compose para construir la imagen de Next.js y levantar los servicios:

```bash
docker compose up -d --build
```

El servicio inicializará automáticamente:
1. **`ai_broker_db` (PostgreSQL 16 + pgvector)**:
   - Monta `src/lib/db/schema.sql` en `/docker-entrypoint-initdb.d/init.sql`.
   - Activa las extensiones `vector`, `uuid-ossp`, `pgcrypto`.
   - Crea las tablas con aislamiento multi-tenant RLS forzado (`tenants`, `users`, `dossiers`, `drafts`, `embeddings`, etc.).
2. **`ai_broker_web` (Next.js 15)**:
   - Expuesto en el puerto interno `3000`.

Para comprobar que los contenedores están funcionando correctamente:

```bash
docker compose ps
docker compose logs -f web
```

---

## 6. Verificación de Salud del Sistema

Desde el propio servidor:

```bash
curl -i http://localhost:3000/api/health
```

Respuesta esperada (`200 OK`):
```json
{
  "status": "healthy",
  "service": "ai-broker-spain",
  "version": "0.1.0",
  "timestamp": "..."
}
```

---

## 7. Configuración de Dominio y SSL (Nginx Reverse Proxy)

Crea un archivo de configuración para Nginx en `/etc/nginx/sites-available/asesor.inmobia360.com`:

```nginx
server {
    server_name asesor.inmobia360.com *.inmobia360.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Habilita el sitio y genera el certificado SSL con Certbot:

```bash
ln -s /etc/nginx/sites-available/asesor.inmobia360.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
certbot --nginx -d asesor.inmobia360.com
```
