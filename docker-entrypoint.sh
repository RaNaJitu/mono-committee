#!/bin/sh
set -e

echo "🚀 Starting Docker Entrypoint..."

###############################################################################
# 1️⃣ RUN PRISMA MIGRATIONS (important for Render free tier)
###############################################################################
echo "📌 Running Prisma migrations..."
npx prisma migrate deploy || {
  echo "⚠️  Prisma migration failed, but continuing..."
}

echo "✅ Prisma migrations check completed."

###############################################################################
# 2️⃣ START THE APPLICATION
###############################################################################
echo "🚀 Starting Fastify server..."
exec "$@"
