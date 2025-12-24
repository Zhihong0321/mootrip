#!/bin/sh
set -e

echo "--- MOOTRIP MINIMAL STARTUP ---"
echo "PORT: $PORT"

# Skip su-exec for this test
export HOSTNAME="0.0.0.0"
exec ./node_modules/.bin/next start -H 0.0.0.0 -p ${PORT:-3000}
