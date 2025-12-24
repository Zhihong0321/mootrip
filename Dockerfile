FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install su-exec and openssl
RUN apt-get update && apt-get install -y openssl su-exec

# Copy everything from builder (including full node_modules)
COPY --from=builder /app ./

RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid 1001 --create-home nextjs
RUN chown -R nextjs:nodejs /app

RUN chmod +x entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Standard start command without entrypoint shell script
CMD ["npx", "next", "start", "-H", "0.0.0.0"]
