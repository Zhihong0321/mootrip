#!/bin/sh
set -e

echo "--- MOOTRIP PRODUCTION STARTUP ---"

# 1. SETUP PERSISTENCE & PERMISSIONS (as root)
if [ -d "/storage" ]; then
  echo "Configuring /storage volume..."
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  # Ensure nextjs user owns the storage
  chown -R nextjs:nodejs /storage
  
  # Create symlink for serving photos
  rm -rf public/uploads
  ln -s /storage/uploads public/uploads
  echo "Storage linked."
else
  echo "Using local ephemeral storage."
  mkdir -p public/uploads/thumbnails public/uploads/medium public/uploads/full
  chown -R nextjs:nodejs public/uploads
fi

# 2. RUN MIGRATIONS (as nextjs)
echo "Running Prisma migrations..."
# Use global prisma CLI installed in the runner
su-exec nextjs prisma migrate deploy
echo "Migrations applied."

# 3. START SERVER (as nextjs)
echo "Starting Next.js standalone server..."
export HOSTNAME="0.0.0.0"
exec su-exec nextjs node server.js
