#!/bin/sh
set -e

echo "--- MOOTRIP DIAGNOSTICS ---"
echo "User: $(whoami)"
echo "Current Directory: $(pwd)"
echo "DATABASE_URL: $DATABASE_URL"
echo "PORT: $PORT"
echo "---------------------------"

# Run migrations
echo "Step 1: Running Prisma migrations..."
if npx prisma migrate deploy; then
  echo "Migrations successful."
else
  echo "Migrations FAILED. This usually means the database file at $DATABASE_URL is not writable or path is invalid."
  # Don't exit immediately so we can see other logs if needed, 
  # but server will likely fail anyway.
fi

# Setup persistence
echo "Step 2: Configuring storage..."
if [ -d "/storage" ]; then
  echo "Detected /storage volume."
  
  # Check if we can write to /storage
  if touch /storage/.writable_test 2>/dev/null; then
    echo "/storage is writable."
    rm /storage/.writable_test
  else
    echo "ERROR: /storage is NOT WRITABLE by $(whoami). You may need to check Railway volume permissions."
  fi

  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  
  echo "Linking public/uploads to /storage/uploads..."
  # Clean up existing static folder to make room for symlink
  rm -rf public/uploads
  ln -s /storage/uploads public/uploads
  echo "Link created."
else
  echo "No /storage found. Using ephemeral storage."
  mkdir -p public/uploads/thumbnails public/uploads/medium public/uploads/full
fi

# Verify symlink
echo "Uploads Path Check: $(ls -ld public/uploads)"

echo "Step 3: Starting Next.js standalone server..."
# Explicitly set HOSTNAME to 0.0.0.0 to ensure it's accessible externally
export HOSTNAME="0.0.0.0"
node server.js
