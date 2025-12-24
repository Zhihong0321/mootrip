#!/bin/sh
set -e

echo "--- MOOTRIP PRODUCTION STARTUP ---"
echo "Port: $PORT"

# 1. STORAGE
if [ -d "/storage" ]; then
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  chown -R 1001:1001 /storage || echo "chown failed"
  rm -rf public/uploads
  ln -s /storage/uploads public/uploads
fi

# 2. START SERVER
echo "Starting Next.js..."
# Use relative path to binary
exec node_modules/.bin/next start -H 0.0.0.0 -p ${PORT:-3000}
