#!/bin/sh
set -e

echo "--- MOOTRIP PRODUCTION ENTRYPOINT ---"
echo "Current User: $(whoami)"
echo "Working Directory: $(pwd)"

# 1. PERMISSION RECONCILIATION (Root only)
if [ -d "/storage" ]; then
  echo "Step 1: Fixing permissions for /storage..."
  chown -R nextjs:nodejs /storage
  
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  chown -R nextjs:nodejs /storage/uploads
  echo "Storage permissions synchronized."
else
  echo "Step 1: No /storage volume detected."
fi

# 2. SYMLINK PREP
echo "Step 2: Preparing public/uploads..."
if [ ! -L "public/uploads" ]; then
  rm -rf public/uploads
  if [ -d "/storage" ]; then
    ln -s /storage/uploads public/uploads
    echo "Symlink created."
  else
    mkdir -p public/uploads/thumbnails public/uploads/medium public/uploads/full
    chown -R nextjs:nodejs public/uploads
  fi
fi

# 3. DATABASE MIGRATIONS (Run as nextjs)
echo "Step 3: Running Prisma migrations as nextjs user..."
# Note: npx might need npm to be available. 
# In standalone mode, we might need to point to the node_modules if npx fails.
su-exec nextjs npx prisma migrate deploy
echo "Migrations applied."

# 4. START SERVER
echo "Step 4: Starting Next.js server..."
export HOSTNAME="0.0.0.0"
exec su-exec nextjs node server.js
