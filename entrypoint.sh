#!/bin/sh
set -e

echo "--- MOOTRIP PRODUCTION STARTUP (DEBIAN) ---"
echo "Starting as user: $(whoami)"
echo "Current directory: $(pwd)"

# 1. SETUP PERSISTENCE & PERMISSIONS (as root)
if [ -d "/storage" ]; then
  echo "Step 1: Configuring /storage volume..."
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  
  # Ensure the app user (1001) owns the storage
  chown -R 1001:1001 /storage
  
  # Link public/uploads to the persistent storage
  echo "Linking public/uploads to /storage/uploads..."
  rm -rf public/uploads
  ln -s /storage/uploads public/uploads
  echo "Storage linked successfully."
else
  echo "Step 1: No /storage volume detected. Using local ephemeral storage."
  mkdir -p public/uploads/thumbnails public/uploads/medium public/uploads/full
  chown -R 1001:1001 public/uploads
fi

# 2. RUN MIGRATIONS
echo "Step 2: Running Prisma migrations..."
# Using global prisma CLI installed in runner
prisma migrate deploy || echo "MIGRATION WARNING: Could not run migrations. Check DATABASE_URL."

# 3. START SERVER (Drop privileges to nextjs)
echo "Step 3: Starting Next.js standalone server on port ${PORT:-3000}..."
export HOSTNAME="0.0.0.0"

# Using su-exec to run the application as the non-privileged user
exec su-exec nextjs node server.js
