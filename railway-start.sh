#!/bin/bash
echo "--- RAILWAY STARTUP (PORT 8080) ---"

# 1. SETUP PERSISTENCE
if [ -d "/storage" ]; then
  echo "Ensuring storage directories..."
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  # We use an API route proxy for /uploads, so no symlink needed in production
  # This avoids issues with Next.js not following symlinks for static files
fi

# 2. RUN MIGRATIONS
echo "Updating database schema..."
./node_modules/.bin/prisma migrate deploy || echo "Prisma migrate failed"

# 3. START SERVER
# Railway is configured to listen on 8080
export PORT=8080
export HOSTNAME="0.0.0.0"
echo "Starting Next.js on 0.0.0.0:8080"

exec ./node_modules/.bin/next start -H 0.0.0.0 -p 8080
