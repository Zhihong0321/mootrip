#!/bin/sh
set -e

echo "--- Starting Mootrip Entrypoint ---"

# Run migrations to ensure the database schema is up to date
echo "Executing Prisma migrate deploy..."
npx prisma migrate deploy

# RAILWAY PERSISTENCE SETUP
if [ -d "/storage" ]; then
  echo "Detected /storage volume. Configuring persistence..."
  
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  
  # Remove public/uploads if it's a real directory, then symlink
  if [ ! -L "public/uploads" ]; then
    echo "Creating symlink for public/uploads -> /storage/uploads"
    rm -rf public/uploads
    ln -s /storage/uploads public/uploads
  else
    echo "Uploads symlink already exists."
  fi
  
  echo "Persistence setup complete."
else
  echo "WARNING: /storage volume not found. Data will be lost on redeploy."
  mkdir -p public/uploads/thumbnails public/uploads/medium public/uploads/full
fi

# Start the application
echo "Starting Next.js server (standalone) on port ${PORT:-3000}..."
node server.js
