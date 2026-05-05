#!/bin/bash

# Docker Cleanup Script

set -e

echo "========================================="
echo "🛑 Stopping IoT Data Integrity Chain"
echo "========================================="
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Stop and remove containers
echo "🛑 Stopping services..."
docker-compose -f "$SCRIPT_DIR/docker-compose.yml" down

echo ""
echo "Optional cleanup (removes volumes):"
echo "docker-compose -f $SCRIPT_DIR/docker-compose.yml down -v"
echo ""
echo "✅ Stopped successfully"
