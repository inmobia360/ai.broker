#!/bin/bash
# ==============================================================================
# Inmobia 360 - Automated Daily Backup Script
# Realiza un volcado comprimido de PostgreSQL y rota backups con retención de 7 días.
# ==============================================================================

set -euo pipefail

BACKUP_DIR="/opt/ai-broker/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/ai_broker_db_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$TIMESTAMP] Iniciando copia de seguridad de la base de datos ai_broker_db..."

# Volcado mediante docker exec
if docker exec ai_broker_db pg_dump -U broker_user -d ai_broker_db | gzip > "$BACKUP_FILE"; then
    echo "[$TIMESTAMP] Backup completado exitosamente: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
else
    echo "[$TIMESTAMP] ERROR: Falló la creación del backup de la base de datos." >&2
    exit 1
fi

# Eliminar copias con más de 7 días de antigüedad
echo "[$TIMESTAMP] Purgando copias de seguridad con más de 7 días..."
find "$BACKUP_DIR" -type f -name "ai_broker_db_*.sql.gz" -mtime +7 -exec rm -f {} \;

echo "[$TIMESTAMP] Proceso de backup finalizado con éxito."
