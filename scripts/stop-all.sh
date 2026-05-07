#!/bin/sh

set -e

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

echo "Stopping IoT Data Integrity Chain..."
docker-compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/blockchain/network/docker-compose-fabric.yml" down

echo "Stopped"
