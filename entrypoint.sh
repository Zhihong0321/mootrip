#!/bin/sh
set -e

echo "--- MOOTRIP MINIMAL STARTUP ---"

# Skip migrations for now to isolate 502
echo "Skipping migrations..."

# Start the application as root
export HOSTNAME="0.0.0.0"
export PORT="3000"
echo "Starting Next.js server on 0.0.0.0:3000..."
exec node server.js
