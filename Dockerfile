FROM node:20-alpine AS base

# 1. Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# 3. Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Install runtime dependencies
RUN apk add --no-cache openssl

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# We will run as root for simplicity to resolve the 502
EXPOSE 3000

# Minimal start command that ensures persistence folders exist
CMD mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full && \
    rm -rf public/uploads && \
    ln -s /storage/uploads public/uploads && \
    npx prisma migrate deploy && \
    node server.js
