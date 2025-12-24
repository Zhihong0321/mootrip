FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

RUN apt-get update && apt-get install -y openssl su-exec libc6-compat

COPY --from=builder /app ./

# Ensure the entrypoint is executable
RUN chmod +x entrypoint.sh

EXPOSE 3000

# Use shell form to ensure environment variables are expanded
ENTRYPOINT ["./entrypoint.sh"]
