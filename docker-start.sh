#!/bin/bash

# Docker Setup and Launch Script for IoT Data Integrity Chain

set -e

echo "========================================="
echo "🐳 Docker IoT Data Integrity Chain"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Docker installation
echo "🔍 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "   Install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
DOCKER_VERSION=$(docker --version)
echo -e "${GREEN}✅ $DOCKER_VERSION found${NC}"
echo ""

# Check Docker Compose installation
echo "🔍 Checking Docker Compose installation..."
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "   Install: https://docs.docker.com/compose/install/"
    exit 1
fi
COMPOSE_VERSION=$(docker-compose --version)
echo -e "${GREEN}✅ $COMPOSE_VERSION found${NC}"
echo ""

# Check Docker daemon
echo "🔌 Checking Docker daemon..."
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    echo "   Start Docker and try again"
    exit 1
fi
echo -e "${GREEN}✅ Docker daemon is running${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "📂 Project Directory: $SCRIPT_DIR"
echo ""

# Stop existing containers (if any)
echo "🛑 Stopping existing containers..."
docker-compose -f "$SCRIPT_DIR/docker-compose.yml" down -v 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ Old containers removed${NC}"
echo ""

# Build images
echo "🔨 Building Docker images..."
docker-compose -f "$SCRIPT_DIR/docker-compose.yml" build --no-cache

echo -e "${GREEN}✅ Images built successfully${NC}"
echo ""

# Start services
echo "▶️ Starting services..."
docker-compose -f "$SCRIPT_DIR/docker-compose.yml" up -d

echo -e "${GREEN}✅ Services starting...${NC}"
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check PostgreSQL
echo -n "🐘 PostgreSQL: "
if docker-compose -f "$SCRIPT_DIR/docker-compose.yml" exec -T postgres pg_isready -U iot_user -d iot &> /dev/null; then
    echo -e "${GREEN}✅ Ready${NC}"
else
    echo -e "${YELLOW}⏳ Starting...${NC}"
fi

# Check MQTT
echo -n "📡 MQTT Broker: "
if docker-compose -f "$SCRIPT_DIR/docker-compose.yml" exec -T mosquitto mosquitto_sub -h localhost -t '$SYS/#' -C 1 &> /dev/null; then
    echo -e "${GREEN}✅ Ready${NC}"
else
    echo -e "${YELLOW}⏳ Starting...${NC}"
fi

# Check Backend
echo -n "🔵 Backend API: "
sleep 10
if curl -sf http://localhost:8080/api/sensor-data/health &> /dev/null; then
    echo -e "${GREEN}✅ Ready${NC}"
else
    echo -e "${YELLOW}⏳ Starting...${NC}"
fi

echo ""
echo "========================================="
echo -e "${BLUE}🚀 All Services Starting!${NC}"
echo "========================================="
echo ""
echo "📋 Service URLs:"
echo -e "  Backend API:       ${GREEN}http://localhost:8080${NC}"
echo -e "  MQTT Broker:       ${GREEN}localhost:1883${NC}"
echo -e "  PostgreSQL:        ${GREEN}localhost:5432${NC}"
echo ""
echo "📊 Docker Commands:"
echo "  View logs:         ${BLUE}docker-compose -f $SCRIPT_DIR/docker-compose.yml logs -f${NC}"
echo "  Stop services:     ${BLUE}docker-compose -f $SCRIPT_DIR/docker-compose.yml down${NC}"
echo "  Remove volumes:    ${BLUE}docker-compose -f $SCRIPT_DIR/docker-compose.yml down -v${NC}"
echo ""
echo "🧪 Test Backend:"
echo "  ${BLUE}curl http://localhost:8080/api/sensor-data/health${NC}"
echo ""
echo "📡 Test MQTT:"
echo "  ${BLUE}docker run --rm -it --network=host eclipse-mosquitto mosquitto_sub -h localhost -p 1883 -t 'iot/sensors/#'${NC}"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
