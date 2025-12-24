#!/bin/sh
set -e

echo "--- MOOTRIP BOOT ---"
echo "PORT: $PORT"
echo "HOSTNAME: $HOSTNAME"

# 1. STORAGE
if [ -d "/storage" ]; then
  echo "Linking storage..."
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  chown -R 1001:1001 /storage
  rm -rf public/uploads
  ln -s /storage/uploads public/uploads
fi

# 2. MIGRATIONS
echo "Applying database schema..."
su-exec nextjs prisma migrate deploy || echo "Migration failed"

# 3. START
echo "Launching Next.js server..."
export HOSTNAME="0.0.0.0"
exec su-exec nextjs node server.js
