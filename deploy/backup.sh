#!/bin/sh
# Ночная копия всех баз. Хранится 14 дней в /opt/backups.
# Запускается из cron: 30 3 * * * /opt/sites/frsrk/deploy/backup.sh
set -eu
cd "$(dirname "$0")"
mkdir -p /opt/backups
file="/opt/backups/db-$(date +%Y-%m-%d).sql.gz"
docker compose exec -T postgres pg_dumpall -U postgres | gzip > "$file"
find /opt/backups -name 'db-*.sql.gz' -mtime +14 -delete
