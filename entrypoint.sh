#!/bin/sh
set -e

echo "--- MOOTRIP PRODUCTION STARTUP (DEBIAN) ---"

# 1. SETUP PERSISTENCE & PERMISSIONS
if [ -d "/storage" ]; then
  echo "Setting up storage..."
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  chown -R 1001:1001 /storage
  rm -rf public/uploads
  ln -s /storage/uploads public/uploads
else
  mkdir -p public/uploads/thumbnails public/uploads/medium public/uploads/full
fi

# 2. RUN MIGRATIONS
echo "Running migrations..."
npx prisma migrate deploy

# 3. START SERVER
echo "Starting Next.js..."
export HOSTNAME="0.0.0.0"
# Use root for this first Debian attempt to confirm it works
exec node server.js
