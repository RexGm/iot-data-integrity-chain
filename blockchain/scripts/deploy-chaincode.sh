#!/bin/sh

set -e

ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
CHANNEL_NAME=mychannel
CC_NAME=sensor-contract
CC_VERSION=1.0
CC_SEQUENCE=1
CC_SRC_PATH=/var/hyperledger/chaincode/sensor-contract

# Package chaincode

docker-compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/blockchain/network/docker-compose-fabric.yml" exec -T fabric-tools \
  peer lifecycle chaincode package /var/hyperledger/chaincode/${CC_NAME}.tgz \
  --path $CC_SRC_PATH --lang golang --label ${CC_NAME}_${CC_VERSION}

# Install chaincode

docker-compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/blockchain/network/docker-compose-fabric.yml" exec -T fabric-tools \
  peer lifecycle chaincode install /var/hyperledger/chaincode/${CC_NAME}.tgz

# Query installed to get package id
PACKAGE_ID=$(docker-compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/blockchain/network/docker-compose-fabric.yml" exec -T fabric-tools \
  peer lifecycle chaincode queryinstalled | grep ${CC_NAME}_${CC_VERSION} | awk -F "," '{print $1}' | awk -F ": " '{print $2}')

if [ -z "$PACKAGE_ID" ]; then
  echo "Package ID not found"
  exit 1
fi

# Approve chaincode

docker-compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/blockchain/network/docker-compose-fabric.yml" exec -T fabric-tools \
  peer lifecycle chaincode approveformyorg -o orderer:7050 \
  --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION \
  --package-id $PACKAGE_ID --sequence $CC_SEQUENCE --tls --cafile $ORDERER_CA

# Commit chaincode

docker-compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/blockchain/network/docker-compose-fabric.yml" exec -T fabric-tools \
  peer lifecycle chaincode commit -o orderer:7050 \
  --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION \
  --sequence $CC_SEQUENCE --tls --cafile $ORDERER_CA \
  --peerAddresses peer0.org1.example.com:7051 \
  --tlsRootCertFiles /var/hyperledger/peer/tls/ca.crt

echo "Chaincode deployed"
