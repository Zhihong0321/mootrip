#!/bin/sh
set -e

echo "--- MOOTRIP PRODUCTION STARTUP ---"
echo "Current User: $(whoami)"
echo "PATH: $PATH"

# 1. SETUP PERSISTENCE & PERMISSIONS (as root)
if [ -d "/storage" ]; then
  echo "Step 1: Configuring /storage volume..."
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  chown -R nextjs:nodejs /storage
  
  # Create symlink for serving photos
  rm -rf public/uploads
  ln -s /storage/uploads public/uploads
  echo "Storage linked."
else
  echo "Step 1: Using local ephemeral storage."
  mkdir -p public/uploads/thumbnails public/uploads/medium public/uploads/full
  chown -R nextjs:nodejs public/uploads
fi

# 2. RUN MIGRATIONS
echo "Step 2: Running Prisma migrations..."
# Try finding prisma binary
PRISMA_BIN=$(which prisma || echo "/usr/local/bin/prisma")
echo "Using Prisma binary at: $PRISMA_BIN"

if [ -f "$PRISMA_BIN" ]; then
  su-exec nextjs "$PRISMA_BIN" migrate deploy || echo "MIGRATION FAILED - check database logs"
else
  echo "ERROR: Prisma binary not found. Trying npx..."
  su-exec nextjs npx prisma migrate deploy || echo "npx prisma failed"
fi

# 3. START SERVER
echo "Step 3: Starting Next.js standalone server..."
export HOSTNAME="0.0.0.0"
# Ensure we are in the correct directory
exec su-exec nextjs node server.js
