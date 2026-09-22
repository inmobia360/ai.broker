#!/bin/bash
# ==============================================================================
# Script de Despliegue Automatizado — AI BROKER (inmobia360)
# VPS Hostinger (PostgreSQL 16 + pgvector + Docker Compose)
# ==============================================================================

set -e

echo "========================================================"
echo "🚀 Iniciando despliegue de AI BROKER..."
echo "========================================================"

APP_DIR="/opt/ai-broker"

# 1. Crear directorio o actualizar repositorio
if [ -d "$APP_DIR" ]; then
    echo "📦 Actualizando repositorio existente en $APP_DIR..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/main
else
    echo "📦 Clonando repositorio en $APP_DIR..."
    git clone https://github.com/inmobia360/ai.broker.git "$APP_DIR"
    cd "$APP_DIR"
fi

# 2. Configurar .env si no existe
if [ ! -f "$APP_DIR/.env" ]; then
    echo "⚙️ Configurando archivo .env a partir de .env.example..."
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    
    # Generar secreto seguro para NextAuth
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || date +%s | sha256sum | base64 | head -c 32)
    sed -i "s/genera_un_secreto_seguro_con_openssl/$JWT_SECRET/g" "$APP_DIR/.env"
    
    echo "✅ Archivo .env configurado."
fi

# 3. Levantar contenedores Docker
echo "🐳 Levantando servicios con Docker Compose..."
docker compose down || true
docker compose up -d --build

echo "⏳ Esperando a que los servicios estén activos (10s)..."
sleep 10

# 4. Comprobación de salud
echo "🩺 Comprobando endpoint /api/health..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "========================================================"
    echo "🎉 ¡DESPLIEGUE EXITOSO! AI BROKER está funcionando."
    echo "URL local: http://localhost:3000"
    echo "Salud: $(curl -s http://localhost:3000/api/health)"
    echo "========================================================"
else
    echo "⚠️ El servicio respondió con código $HTTP_STATUS."
    echo "Revisa los registros ejecutando: docker compose logs -f"
fi
