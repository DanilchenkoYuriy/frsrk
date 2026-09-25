# Сборка и запуск сайта ФРСРК для Timeweb Cloud (App Platform).
# Сборка идёт в три этапа, чтобы итоговый образ был небольшим.

FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Значения только для сборки: сайту на этом этапе база не нужна.
# Настоящие значения задаются в настройках приложения и подставляются при запуске.
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build \
    PAYLOAD_SECRET=build-only-secret-not-used-at-runtime-0123456789 \
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
RUN npm run build

FROM node:24-slim AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Хостинг проверяет сайт командой curl изнутри контейнера. В образе node:slim её нет,
# без неё проверка не проходит и сайт бесконечно перезапускается.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
