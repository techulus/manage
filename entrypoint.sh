#!/bin/sh

set -e

echo "Starting checks..."

echo "Fix permissions..."
chown -R nextjs:nodejs /app/sqlite
chmod -R 777 /app/sqlite

echo "Running auth database migrations..."
for file in /app/better-auth_migrations/*.sql; do
    sqlite3 sqlite/auth.db < "$file"
done
echo "Auth database migrations complete."

echo "Checking AnyCable connection..."
ANYCABLE_HEALTH_CHECK_URL=$(echo "${ANYCABLE_BROADCAST_URL}" | sed 's/_broadcast/health/')
echo "Checking AnyCable connection at $ANYCABLE_HEALTH_CHECK_URL..."
curl -fsS $ANYCABLE_HEALTH_CHECK_URL || exit 1
echo "AnyCable connection is OK."

echo "Checking S3 Endpoint is set..."
if [ -z "$S3_ENDPOINT" ]; then
    echo "S3_ENDPOINT is not set. Please set it in your environment."
    exit 1
fi
echo "S3 Endpoint is set."

echo "Everything looks good, starting app..."
exec "$@"