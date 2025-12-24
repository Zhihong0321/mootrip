#!/bin/sh
set -e

# Run migrations to ensure the database schema is up to date
npx prisma migrate deploy

# Start the application
node server.js
