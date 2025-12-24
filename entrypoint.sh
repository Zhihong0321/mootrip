#!/bin/sh
set -e

echo "--- MOOTRIP PRODUCTION ENTRYPOINT ---"
echo "Starting as user: $(whoami)"

# 1. PERMISSION RECONCILIATION
if [ -d "/storage" ]; then
  echo "Fixing permissions for /storage..."
  # Ensure /storage is owned by nextjs so SQLite and uploads can work
  chown -R nextjs:nodejs /storage
  
  # Ensure upload subdirectories exist
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  chown -R nextjs:nodejs /storage/uploads
fi

# 2. SYMLINK PREP
echo "Setting up public/uploads symlink..."
# If public/uploads is a real directory (part of the build), delete it to make room for symlink
if [ ! -L "public/uploads" ]; then
  rm -rf public/uploads
  if [ -d "/storage" ]; then
    ln -s /storage/uploads public/uploads
    echo "Symlinked to /storage/uploads"
  else
    mkdir -p public/uploads/thumbnails public/uploads/medium public/uploads/full
    chown -R nextjs:nodejs public/uploads
    echo "Using local ephemeral uploads"
  fi
fi

# 3. DATABASE MIGRATIONS
echo "Running Prisma migrations..."
# We run this as root because we just fixed permissions, but we'll drop privileges for the app
npx prisma migrate deploy

# 4. START SERVER (Drop privileges to nextjs)
echo "Starting Next.js server as nextjs user..."
export HOSTNAME="0.0.0.0"
exec su-exec nextjs node server.js
