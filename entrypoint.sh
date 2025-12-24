#!/bin/sh
set -e

# Run migrations to ensure the database schema is up to date
npx prisma migrate deploy

# Ensure upload directories exist
mkdir -p public/uploads/thumbnails public/uploads/medium public/uploads/full

# Start the application
node server.js
