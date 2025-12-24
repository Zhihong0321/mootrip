#!/bin/sh
set -e

echo "--- MOOTRIP STARTUP ---"
echo "Current directory: $(pwd)"
echo "Listing top level:"
ls -F

# 1. VOLUME SETUP
if [ -d "/storage" ]; then
  echo "Setting up persistent storage..."
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  chown -R 1001:1001 /storage
  
  # Remove build-time directory and link to volume
  rm -rf public/uploads
  ln -s /storage/uploads public/uploads
  echo "Storage linked."
fi

# 2. DATABASE SETUP
echo "Checking database..."
# Run migrations as root to ensure we can write to the volume if needed
# then we'll drop privileges for the server
prisma migrate deploy || echo "Prisma migrate failed."

# 3. RUNTIME
echo "Starting Next.js server on port ${PORT:-3000}..."
export HOSTNAME="0.0.0.0"

# Use su-exec to run as nextjs
exec su-exec nextjs node server.js
