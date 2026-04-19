#!/bin/bash

# IoT Sensor Simulator Startup Script

set -e

echo "========================================="
echo "IoT Sensor Simulator - Phase 2"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SENSOR_SIM_DIR="$PROJECT_ROOT/sensor-simulator"

echo "📂 Project Root: $PROJECT_ROOT"
echo "📂 Sensor Simulator: $SENSOR_SIM_DIR"
echo ""

# Check Python installation
echo "🔍 Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}✅ $PYTHON_VERSION found${NC}"
echo ""

# Check and setup virtual environment
VENV_DIR="$SENSOR_SIM_DIR/venv"
if [ ! -d "$VENV_DIR" ]; then
    echo "🔨 Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${GREEN}✅ Virtual environment exists${NC}"
fi
echo ""

# Activate virtual environment
echo "🚀 Activating virtual environment..."
source "$VENV_DIR/bin/activate"
echo -e "${GREEN}✅ Virtual environment activated${NC}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
cd "$SENSOR_SIM_DIR"
if pip install -q -r requirements.txt; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    deactivate
    exit 1
fi
echo ""

# Load environment variables
if [ -f "$SENSOR_SIM_DIR/.env" ]; then
    echo "📝 Loading environment variables from .env"
    set -a
    source "$SENSOR_SIM_DIR/.env"
    set +a
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
else
    echo -e "${YELLOW}⚠️ .env file not found${NC}"
fi
echo ""

# Check MQTT Broker
echo "🔌 Checking MQTT Broker..."
MQTT_HOST="${MQTT_BROKER_HOST:-localhost}"
MQTT_PORT="${MQTT_BROKER_PORT:-1883}"

if nc -z -w2 "$MQTT_HOST" "$MQTT_PORT" 2>/dev/null; then
    echo -e "${GREEN}✅ MQTT Broker is running at $MQTT_HOST:$MQTT_PORT${NC}"
else
    echo -e "${YELLOW}⚠️ MQTT Broker not found at $MQTT_HOST:$MQTT_PORT${NC}"
    echo "   Make sure Mosquitto is running:"
    echo "   brew services start mosquitto"
fi
echo ""

# Start producer
echo "▶️ Starting Sensor Data Producer..."
echo "========================================="
cd "$SENSOR_SIM_DIR/src"
python3 producer.py
