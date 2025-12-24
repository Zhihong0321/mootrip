#!/bin/sh
set -e

# Run migrations to ensure the database schema is up to date
npx prisma migrate deploy

# RAILWAY PERSISTENCE SETUP
# If running on Railway with a /storage volume
if [ -d "/storage" ]; then
  echo "Detected /storage volume. Setting up persistence..."
  
  # 1. Create upload directories on the persistent volume
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  
  # 2. Link public/uploads to the persistent storage
  # Remove the existing directory if it exists (it will be empty in a fresh container)
  rm -rf public/uploads
  ln -s /storage/uploads public/uploads
  
  echo "Persistence linked successfully."
else
  # Fallback for local/non-volume environments
  mkdir -p public/uploads/thumbnails public/uploads/medium public/uploads/full
fi

# Start the application
node server.js
