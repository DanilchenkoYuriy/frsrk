#!/bin/sh
# Обновить сайт ФРСРК до последней версии с GitHub.
set -eu
cd "$(dirname "$0")"
git -C .. pull --ff-only
docker compose up -d --build frsrk
docker image prune -f
