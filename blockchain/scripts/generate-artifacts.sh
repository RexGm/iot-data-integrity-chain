#!/bin/sh

set -e

ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
NET_DIR="$ROOT_DIR/blockchain/network"

rm -rf "$NET_DIR/crypto-config" "$NET_DIR/channel-artifacts"
mkdir -p "$NET_DIR/crypto-config" "$NET_DIR/channel-artifacts"

# Generate crypto material

docker run --rm \
  -v "$NET_DIR":/work \
  -w /work \
  hyperledger/fabric-tools:2.5.7 \
  cryptogen generate --config=crypto-config.yaml

# Generate genesis block

docker run --rm \
  -v "$NET_DIR":/work \
  -w /work \
  hyperledger/fabric-tools:2.5.7 \
  sh -c "FABRIC_CFG_PATH=/work configtxgen -profile OrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block"

# Generate channel tx

docker run --rm \
  -v "$NET_DIR":/work \
  -w /work \
  hyperledger/fabric-tools:2.5.7 \
  sh -c "FABRIC_CFG_PATH=/work configtxgen -profile Channel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID mychannel"

# Generate anchor peer update

docker run --rm \
  -v "$NET_DIR":/work \
  -w /work \
  hyperledger/fabric-tools:2.5.7 \
  sh -c "FABRIC_CFG_PATH=/work configtxgen -profile Channel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID mychannel -asOrg Org1MSP"

echo "Artifacts generated in $NET_DIR"
