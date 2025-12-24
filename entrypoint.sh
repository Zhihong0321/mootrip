#!/bin/sh
set -e

echo "--- MOOTRIP DIAGNOSTIC STARTUP ---"
echo "Port: $PORT"
echo "Files in /app:"
ls -F /app

# 1. MIGRATIONS
echo "Running migrations..."
prisma migrate deploy || echo "Migration failed"

# 2. START SERVER
echo "Starting Next.js server.js..."
export HOSTNAME="0.0.0.0"

# Running as root to isolate permission issues
exec node server.js
