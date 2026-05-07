#!/bin/sh

set -e

ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)

CHANNEL_NAME=${CHANNEL_NAME:-mychannel}
CC_NAME=${CC_NAME:-sensor-contract}
CC_VERSION=${CC_VERSION:-1.0}
CC_LABEL="${CC_NAME}_${CC_VERSION}"

CC_SRC_DIR="$ROOT_DIR/blockchain/chaincode/sensor-contract"
CCAAS_DIR="$ROOT_DIR/blockchain/chaincode/ccaas-sensor-contract"
CC_PACKAGE="$CCAAS_DIR/${CC_NAME}.tgz"
ORDERER_CA=/var/hyperledger/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt
PEER_TLS_CA=/var/hyperledger/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

COMPOSE="docker-compose -f $ROOT_DIR/docker-compose.yml -f $ROOT_DIR/blockchain/network/docker-compose-fabric.yml"

echo "Validating chaincode source..."
docker run --rm \
  -v "$CC_SRC_DIR":/chaincode \
  -w /chaincode \
  golang:1.21-alpine \
  sh -c "go mod download && go test ./..."

echo "Packaging Chaincode-as-a-Service definition..."
$COMPOSE exec -T fabric-tools sh -c "
cd /var/hyperledger/chaincode/ccaas-sensor-contract
rm -f ${CC_NAME}.tgz code.tar.gz
tar --sort=name --mtime='UTC 2024-01-01' --owner=0 --group=0 --numeric-owner -czf code.tar.gz connection.json
tar --sort=name --mtime='UTC 2024-01-01' --owner=0 --group=0 --numeric-owner -czf ${CC_NAME}.tgz metadata.json code.tar.gz
rm -f code.tar.gz
"

echo "Installing chaincode package..."
INSTALL_OUTPUT=$($COMPOSE exec -T fabric-tools \
  peer lifecycle chaincode install "/var/hyperledger/chaincode/ccaas-sensor-contract/${CC_NAME}.tgz" 2>&1) || {
  echo "$INSTALL_OUTPUT"
  if ! echo "$INSTALL_OUTPUT" | grep -qi "already successfully installed"; then
    exit 1
  fi
}
if [ -n "$INSTALL_OUTPUT" ]; then
  echo "$INSTALL_OUTPUT"
fi

PACKAGE_ID=$($COMPOSE exec -T fabric-tools \
  peer lifecycle chaincode calculatepackageid "/var/hyperledger/chaincode/ccaas-sensor-contract/${CC_NAME}.tgz")

if [ -z "$PACKAGE_ID" ]; then
  echo "Package ID not found for label $CC_LABEL"
  exit 1
fi

echo "Package ID: $PACKAGE_ID"

echo "Starting chaincode server..."
export CHAINCODE_ID="$PACKAGE_ID"
$COMPOSE up -d --build sensor-contract
sleep 3

CURRENT_SEQUENCE=$($COMPOSE exec -T fabric-tools \
  peer lifecycle chaincode querycommitted --channelID "$CHANNEL_NAME" --name "$CC_NAME" 2>/dev/null | sed -n 's/.*Sequence: \([0-9][0-9]*\).*/\1/p' | head -n 1 || true)

if [ -n "$CURRENT_SEQUENCE" ] && [ "${FORCE_CHAINCODE_UPGRADE:-false}" != "true" ]; then
  echo "Chaincode is already committed on $CHANNEL_NAME at sequence $CURRENT_SEQUENCE."
  echo "Set FORCE_CHAINCODE_UPGRADE=true to approve and commit a new sequence."
  $COMPOSE exec -T fabric-tools \
    peer lifecycle chaincode querycommitted --channelID "$CHANNEL_NAME" --name "$CC_NAME"
  echo "Chaincode-as-a-Service is ready"
  exit 0
fi

if [ -z "$CURRENT_SEQUENCE" ]; then
  CC_SEQUENCE=1
else
  CC_SEQUENCE=$((CURRENT_SEQUENCE + 1))
fi

echo "Using sequence: $CC_SEQUENCE"

echo "Approving chaincode for Org1..."
$COMPOSE exec -T fabric-tools \
  peer lifecycle chaincode approveformyorg \
  -o orderer.example.com:7050 \
  --channelID "$CHANNEL_NAME" \
  --name "$CC_NAME" \
  --version "$CC_VERSION" \
  --package-id "$PACKAGE_ID" \
  --sequence "$CC_SEQUENCE" \
  --tls --cafile "$ORDERER_CA"

echo "Checking commit readiness..."
$COMPOSE exec -T fabric-tools \
  peer lifecycle chaincode checkcommitreadiness \
  --channelID "$CHANNEL_NAME" \
  --name "$CC_NAME" \
  --version "$CC_VERSION" \
  --sequence "$CC_SEQUENCE" \
  --tls --cafile "$ORDERER_CA" \
  --output json

echo "Committing chaincode..."
$COMPOSE exec -T fabric-tools \
  peer lifecycle chaincode commit \
  -o orderer.example.com:7050 \
  --channelID "$CHANNEL_NAME" \
  --name "$CC_NAME" \
  --version "$CC_VERSION" \
  --sequence "$CC_SEQUENCE" \
  --tls --cafile "$ORDERER_CA" \
  --peerAddresses peer0.org1.example.com:7051 \
  --tlsRootCertFiles "$PEER_TLS_CA"

echo "Verifying deployment..."
$COMPOSE exec -T fabric-tools \
  peer lifecycle chaincode querycommitted --channelID "$CHANNEL_NAME" --name "$CC_NAME"

echo "Chaincode-as-a-Service deployed successfully"
