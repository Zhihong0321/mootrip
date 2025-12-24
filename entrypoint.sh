#!/bin/sh
set -e

echo "--- MOOTRIP PRODUCTION ENTRYPOINT ---"
echo "Current User: $(whoami)"
echo "Working Directory: $(pwd)"
ls -la

# 1. PERMISSION RECONCILIATION
if [ -d "/storage" ]; then
  echo "Step 1: Fixing permissions for /storage..."
  chown -R nextjs:nodejs /storage
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  chown -R nextjs:nodejs /storage/uploads
else
  echo "Step 1: No /storage volume detected."
fi

# 2. SYMLINK PREP
echo "Step 2: Preparing public/uploads..."
rm -rf public/uploads
if [ -d "/storage" ]; then
  ln -s /storage/uploads public/uploads
  echo "Symlink created."
else
  mkdir -p public/uploads/thumbnails public/uploads/medium public/uploads/full
  chown -R nextjs:nodejs public/uploads
fi

# 3. DATABASE MIGRATIONS
echo "Step 3: Running Prisma migrations..."
# Try running migrations, but don't exit if they fail (for debugging)
su-exec nextjs ./node_modules/.bin/prisma migrate deploy || echo "MIGRATION FAILED - CHECK DATABASE_URL"

# 4. START SERVER
echo "Step 4: Starting Next.js server..."
export HOSTNAME="0.0.0.0"
# Run the server and pipe logs
exec su-exec nextjs node server.js
