#!/bin/sh
set -e

echo "--- MOOTRIP DEBUG (DEBIAN) ---"
echo "Current Dir: $(pwd)"
echo "Listing files:"
ls -la

# 1. STORAGE
if [ -d "/storage" ]; then
  echo "Setting up /storage..."
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  chown -R 1001:1001 /storage
  rm -rf public/uploads
  ln -s /storage/uploads public/uploads
fi

# 2. MIGRATIONS
echo "Starting migrations..."
# Check if prisma folder exists
if [ -d "prisma" ]; then
  echo "Prisma folder found."
  ls -la prisma/
else
  echo "ERROR: Prisma folder NOT FOUND."
fi

# Run migrations, but don't exit on error for now
npx prisma migrate deploy || echo "MIGRATION FAILED - check your DATABASE_URL"

# 3. SERVER
echo "Starting Next.js..."
export HOSTNAME="0.0.0.0"
export PORT="${PORT:-3000}"

# Run node server.js and keep it in the foreground
node server.js
