#!/bin/bash
echo "--- RAILWAY STARTUP ---"

# Fallback DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:./dev.db"
fi

# Start Next.js immediately
export HOSTNAME="0.0.0.0"
export PORT=${PORT:-3000}
echo "Starting Next.js on 0.0.0.0:$PORT"

./node_modules/.bin/next start -H 0.0.0.0 -p $PORT
