#!/bin/sh

set -e

ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
NET_DIR="$ROOT_DIR/blockchain/network"

CHANNEL_NAME=mychannel
ORDERER_CA=/var/hyperledger/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt
COMPOSE="docker-compose -f $ROOT_DIR/docker-compose.yml -f $ROOT_DIR/blockchain/network/docker-compose-fabric.yml"

if $COMPOSE exec -T fabric-tools peer channel list | grep -q "$CHANNEL_NAME"; then
  echo "Channel $CHANNEL_NAME already exists and peer is joined"
  exit 0
fi

# Create channel
$COMPOSE exec -T fabric-tools \
  peer channel create -o orderer:7050 -c $CHANNEL_NAME \
  -f /var/hyperledger/channel-artifacts/channel.tx \
  --outputBlock /var/hyperledger/channel-artifacts/${CHANNEL_NAME}.block \
  --tls --cafile $ORDERER_CA --ordererTLSHostnameOverride orderer.example.com

# Join peer to channel
$COMPOSE exec -T fabric-tools \
  peer channel join -b /var/hyperledger/channel-artifacts/${CHANNEL_NAME}.block

# Set anchor peer

$COMPOSE exec -T fabric-tools \
  peer channel update -o orderer:7050 -c $CHANNEL_NAME \
  -f /var/hyperledger/channel-artifacts/Org1MSPanchors.tx \
  --tls --cafile $ORDERER_CA --ordererTLSHostnameOverride orderer.example.com

echo "Channel created and peer joined"
