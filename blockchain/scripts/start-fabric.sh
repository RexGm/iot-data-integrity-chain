#!/bin/sh

set -e

ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
NETWORK_NAME=iot-data-integrity-chain_iot-network

# Ensure artifacts exist
if [ ! -f "$ROOT_DIR/blockchain/network/channel-artifacts/genesis.block" ]; then
  echo "Artifacts missing. Run: blockchain/scripts/generate-artifacts.sh"
  exit 1
fi

# Ensure docker network exists
if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
  docker network create "$NETWORK_NAME"
fi

# Start fabric services
docker-compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/blockchain/network/docker-compose-fabric.yml" up -d orderer.example.com peer0.org1.example.com fabric-tools

# Wait a bit for services to be ready
sleep 3

echo "Fabric services started"
