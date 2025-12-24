#!/bin/bash
echo "--- RAILWAY STARTUP ---"

# Start Next.js immediately to pass health check
export HOSTNAME="0.0.0.0"
export PORT=${PORT:-3000}
echo "Starting Next.js on 0.0.0.0:$PORT"

./node_modules/.bin/next start -H 0.0.0.0 -p $PORT &
NEXT_PID=$!

# Run migrations in the background
echo "Running migrations in background..."
./node_modules/.bin/prisma migrate deploy &

# Wait for Next.js
wait $NEXT_PID
