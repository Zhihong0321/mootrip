#!/bin/bash
set -e

echo "--- RAILWAY PRODUCTION STARTUP ---"

# 1. STORAGE VOLUME SYMLINK
# If we are on Railway with a /storage volume
if [ -d "/storage" ]; then
  echo "Setting up /storage uploads..."
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  
  # Robust symlink logic
  if [ -L "public/uploads" ]; then
    echo "Symlink public/uploads already exists. Updating..."
    rm "public/uploads"
  elif [ -d "public/uploads" ]; then
    echo "Directory public/uploads exists. Removing..."
    rm -rf "public/uploads"
  fi
  
  ln -s /storage/uploads public/uploads
  echo "Persistence linked."
else
  echo "No /storage volume. Using local uploads."
  mkdir -p public/uploads/thumbnails public/uploads/medium public/uploads/full
fi

# 2. MIGRATIONS
echo "Running Prisma migrations..."
npx prisma migrate deploy

# 3. START APP
echo "Starting Next.js..."
# Force 0.0.0.0 and use the port provided by Railway
export HOSTNAME="0.0.0.0"
exec npx next start -H 0.0.0.0 -p ${PORT:-3000}
