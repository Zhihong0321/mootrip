#!/bin/sh
set -e

echo "--- MOOTRIP DEBUG STARTUP ---"
echo "UID: $(id -u)"
echo "DB: $DATABASE_URL"

# 1. PERMISSIONS
if [ -d "/storage" ]; then
  chown -R 1001:1001 /storage || echo "chown failed"
fi

# 2. MIGRATIONS (Try as root first to see if it works)
echo "Running migrations as root..."
prisma migrate deploy || echo "Root migration failed"

# 3. SERVER
echo "Starting Next.js..."
export HOSTNAME="0.0.0.0"
export PORT="3000"

# Running as root for this debug cycle to rule out su-exec issues
exec node server.js
