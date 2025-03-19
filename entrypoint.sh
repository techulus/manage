#!/bin/sh

set -e

echo "Starting checks..."

echo "Running auth database migrations..."
bunx @better-auth/cli migrate --config ./lib/betterauth/config.ts --y
echo "Auth database migrations complete."

echo "Checking TurboWire connection..."
TURBOWIRE_HEALTH_CHECK_URL="https://${TURBOWIRE_DOMAIN}/health"
echo "Checking TurboWire connection at $TURBOWIRE_HEALTH_CHECK_URL..."
curl -fsS $TURBOWIRE_HEALTH_CHECK_URL || exit 1
echo "TurboWire connection is OK."

echo "Checking S3 Endpoint is set..."
if [ -z "$S3_ENDPOINT" ]; then
    echo "S3_ENDPOINT is not set. Please set it in your environment."
    exit 1
fi
echo "S3 Endpoint is set."

echo "Everything looks good, starting app..."
exec "$@"