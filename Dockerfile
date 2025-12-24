FROM node:20-slim AS base

# 1. Install dependencies
FROM base AS deps
RUN apt-get update && apt-get install -y python3 make g++ openssl libssl-dev
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y openssl su-exec libc6-compat

# Install Prisma CLI globally
RUN npm install -g prisma@7.2.0

RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid 1001 --create-home nextjs

# Set up the app directory
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
COPY --from=builder /app/package.json ./package.json

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Correct permissions for the internal directories
RUN chown -R nextjs:nodejs /app

RUN chmod +x entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./entrypoint.sh"]
