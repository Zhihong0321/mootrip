#!/bin/sh
set -e

echo "--- MOOTRIP DEBUG ---"
ls -R /app

# 1. PERMISSION RECONCILIATION
if [ -d "/storage" ]; then
  chown -R nextjs:nodejs /storage
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  chown -R nextjs:nodejs /storage/uploads
fi

# 2. SYMLINK PREP
rm -rf public/uploads
if [ -d "/storage" ]; then
  ln -s /storage/uploads public/uploads
else
  mkdir -p public/uploads/thumbnails public/uploads/medium public/uploads/full
  chown -R nextjs:nodejs public/uploads
fi

# 3. DATABASE MIGRATIONS
su-exec nextjs ./node_modules/.bin/prisma migrate deploy || echo "MIGRATION FAILED"

# 4. START SERVER
echo "Starting Next.js..."
export HOSTNAME="0.0.0.0"
exec node server.js
