#!/bin/sh

set -e

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
COMPOSE="docker-compose -f $ROOT_DIR/docker-compose.yml"
NETWORK_NAME=iot-data-integrity-chain_iot-network

echo "Starting IoT Data Integrity Chain..."

if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
  echo "Creating shared Docker network..."
  docker network create "$NETWORK_NAME" >/dev/null
fi

if [ ! -f "$ROOT_DIR/blockchain/network/channel-artifacts/genesis.block" ]; then
  echo "Fabric artifacts are missing; generating crypto material and channel artifacts..."
  "$ROOT_DIR/blockchain/scripts/generate-artifacts.sh"
fi

echo "Starting database and MQTT broker..."
$COMPOSE up -d postgres mosquitto

echo "Starting Fabric orderer, peer, and tools..."
"$ROOT_DIR/blockchain/scripts/start-fabric.sh"

echo "Creating channel if needed..."
"$ROOT_DIR/blockchain/scripts/create-channel.sh"

echo "Deploying Chaincode-as-a-Service..."
"$ROOT_DIR/blockchain/scripts/deploy-chaincode.sh"

echo "Starting backend and sensor simulator..."
$COMPOSE up -d --build backend simulator

echo "System is starting. Useful checks:"
echo "  docker-compose ps"
echo "  curl http://localhost:8080/api/sensor-data/health"
echo "  docker logs -f iot-backend"
