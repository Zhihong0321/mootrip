#!/bin/sh
set -e

echo "--- MOOTRIP PRODUCTION ENTRYPOINT ---"
echo "Current User: $(whoami)"
echo "Working Directory: $(pwd)"
echo "Directory Contents: $(ls -F)"

# 1. PERMISSION RECONCILIATION
if [ -d "/storage" ]; then
  echo "Step 1: Fixing permissions for /storage..."
  # Ensure /storage is owned by nextjs so SQLite and uploads can work
  chown -R nextjs:nodejs /storage
  
  # Ensure upload subdirectories exist
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  chown -R nextjs:nodejs /storage/uploads
  echo "Storage permissions synchronized."
else
  echo "Step 1: No /storage volume detected. Using ephemeral storage."
fi

# 2. SYMLINK PREP
echo "Step 2: Preparing public/uploads..."
if [ ! -L "public/uploads" ]; then
  echo "Cleaning up local public/uploads directory..."
  rm -rf public/uploads
  
  if [ -d "/storage" ]; then
    ln -s /storage/uploads public/uploads
    echo "Symlink created: public/uploads -> /storage/uploads"
  else
    mkdir -p public/uploads/thumbnails public/uploads/medium public/uploads/full
    chown -R nextjs:nodejs public/uploads
    echo "Local storage directories created."
  fi
else
  echo "Symlink already exists."
fi

# 3. DATABASE MIGRATIONS
echo "Step 3: Running Prisma migrations..."
# Set DATABASE_URL if it's not set (though Railway should set it)
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL is not set. Defaulting to local dev.db"
  export DATABASE_URL="file:./dev.db"
fi

# Ensure migrations run against the correct path
npx prisma migrate deploy
echo "Migrations applied."

# 4. START SERVER
if [ -f "server.js" ]; then
  echo "Step 4: Starting Next.js server (0.0.0.0:${PORT:-3000})..."
  export HOSTNAME="0.0.0.0"
  exec su-exec nextjs node server.js
else
  echo "CRITICAL ERROR: server.js NOT FOUND in $(pwd)!"
  ls -la
  exit 1
fi
