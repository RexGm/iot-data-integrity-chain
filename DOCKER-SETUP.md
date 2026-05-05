# 🐳 Docker Setup Guide - IoT Data Integrity Chain

## 📋 Overview

Complete Docker setup for the entire IoT project with:
- **PostgreSQL** (Database)
- **Mosquitto** (MQTT Broker)
- **Spring Boot Backend** (Java API)
- **Python Simulator** (Sensor Data Generator)

All services are orchestrated with Docker Compose and communicate via an internal network.

---

## 🚀 Quick Start

### Prerequisites
- Docker desktop installed and running
- 6GB+ free disk space
- 2GB+ available RAM

### Start Everything (One Command)

```bash
cd /Users/rexgm/CodeSpells/iot-data-integrity-chain

# Start all services
./docker-start.sh

# Or manually
docker-compose up -d
```

### Stop Everything

```bash
./docker-stop.sh

# Or manually
docker-compose down
```

### Remove Everything (Including Data)

```bash
docker-compose down -v
```

---

## 📦 Services

### 1. PostgreSQL (Port 5432)

```
Container: iot-postgres
Image: postgres:16-alpine
Database: iot
User: iot_user
Password: Stron9EnoughToBeP@ssw0rd
```

**Connect from host:**
```bash
psql -h localhost -U iot_user -d iot

# Or with docker
docker-compose exec postgres psql -U iot_user -d iot
```

### 2. Mosquitto MQTT Broker (Port 1883, 9001)

```
Container: iot-mosquitto
Image: eclipse-mosquitto:2.0.18
Ports: 1883 (MQTT), 9001 (WebSocket)
```

**Subscribe to messages:**
```bash
mosquitto_sub -h localhost -p 1883 -t "iot/sensors/#"

# Or with docker
docker run --rm -it --network=host eclipse-mosquitto \
  mosquitto_sub -h localhost -p 1883 -t "iot/sensors/#"
```

### 3. Spring Boot Backend (Port 8080)

```
Container: iot-backend
Database: PostgreSQL
MQTT: Mosquitto
Health: http://localhost:8080/api/sensor-data/health
```

**Test health:**
```bash
curl http://localhost:8080/api/sensor-data/health

# Expected: "Sensor Data API is running"
```

**View logs:**
```bash
docker-compose logs -f backend
```

### 4. Python Sensor Simulator

```
Container: iot-simulator
Publishes: MQTT topics on iot/sensors/{device-id}
MQTT Broker: mosquitto (internal)
Devices: sensor-001 to sensor-005
```

**View logs:**
```bash
docker-compose logs -f simulator
```

---

## 🔧 Configuration

### Environment Variables

Edit `docker-compose.yml` to change:

```yaml
# Backend
SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/iot
SPRING_JPA_HIBERNATE_DDL_AUTO: update

# Simulator
MQTT_BROKER_HOST: mosquitto
DEVICE_IDS: sensor-001,sensor-002,sensor-003,sensor-004,sensor-005
PUBLISH_INTERVAL: 5
```

### Database Customization

Edit `database/init.sql` for initial setup.

### MQTT Configuration

Edit `mqtt/config/mosquitto.conf` for broker settings.

---

## 📊 Useful Commands

### View All Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f simulator
docker-compose logs -f postgres
docker-compose logs -f mosquitto
```

### Access Services

```bash
# Backend shell
docker-compose exec backend /bin/bash

# PostgreSQL shell
docker-compose exec postgres psql -U iot_user -d iot

# Simulator shell
docker-compose exec simulator bash

# Mosquitto shell
docker-compose exec mosquitto sh
```

### Check Service Status

```bash
# All containers
docker-compose ps

# Detailed status
docker-compose ps -a

# Health checks
docker-compose ps --format "table {{.Service}}\t{{.Status}}"
```

### Restart Services

```bash
# Specific service
docker-compose restart backend

# All services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build
```

### View Resource Usage

```bash
# Real-time stats
docker stats

# Specific container
docker stats iot-backend
```

---

## 🧪 Testing

### Test Sensor Data Flow

```bash
# Terminal 1: Watch MQTT messages
docker run --rm -it --network=host eclipse-mosquitto \
  mosquitto_sub -h localhost -p 1883 -t "iot/sensors/#" -v

# You should see:
# iot/sensors/sensor-001 {"deviceId":"sensor-001","temperature":23.5,"humidity":65.2,...}
# iot/sensors/sensor-002 {"deviceId":"sensor-002","temperature":21.2,"humidity":58.1,...}
```

### Test Backend API

```bash
# Health check
curl http://localhost:8080/api/sensor-data/health

# Get all sensor data
curl http://localhost:8080/api/sensor-data

# Post new data
curl -X POST http://localhost:8080/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test-sensor","rawData":"{\"temp\":25}"}'
```

### Test Database

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U iot_user -d iot

# In psql shell:
\dt                              # List tables
SELECT * FROM sensor_data;       # View data
SELECT COUNT(*) FROM sensor_data; # Count records
\q                               # Exit
```

### Test MQTT

```bash
# Publish test message
mosquitto_pub -h localhost -p 1883 -t "test/topic" -m "Hello Docker"

# Subscribe to all messages
mosquitto_sub -h localhost -p 1883 -t "#" -v
```

---

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Kill it
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "8081:8080"  # Use 8081 instead
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### MQTT Not Publishing

```bash
# Check Mosquitto is running
docker-compose ps mosquitto

# Check Simulator logs
docker-compose logs simulator

# Verify network
docker network ls
docker network inspect iot-data-integrity-chain_iot-network
```

### Out of Memory

```bash
# Reduce container limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
```

### Slow Performance

```bash
# Allocate more resources to Docker Desktop:
# Docker Desktop → Settings → Resources
# Increase CPUs and Memory
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         Docker Network: iot-network             │
├──────────────┬──────────────┬────────┬──────────┤
│              │              │        │          │
│ PostgreSQL   │  Mosquitto   │Backend │Simulator │
│   :5432      │   :1883      │ :8080  │(internal)│
│              │   :9001      │        │          │
└──────────────┴──────────────┴────────┴──────────┘
      ▲               ▲          ▲        ▲
      └───────────────┴──────────┴────────┘
       Host: localhost (Docker Desktop)
```

---

## 📈 Scaling & Production

### Multiple Simulators

```yaml
# Add more simulators in docker-compose.yml
simulator2:
  build:
    context: .
    dockerfile: Dockerfile.simulator
  environment:
    DEVICE_IDS: sensor-006,sensor-007,sensor-008
    # ...
  depends_on:
    mosquitto:
      condition: service_healthy
```

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Persistence

```yaml
volumes:
  postgres_data:
    driver: local
  mosquitto_data:
    driver: local
```

Data persists across container restarts.

---

## 🔐 Security Notes

### For Production

1. **Change Passwords**
   - PostgreSQL default password
   - Update in docker-compose.yml

2. **Enable MQTT Authentication**
   - Update mosquitto.conf
   - Add password file

3. **Use Environment Files**
   - Create `.env.prod`
   - Use: `docker-compose --env-file .env.prod up -d`

4. **Network Security**
   - Restrict port access
   - Use reverse proxy (nginx)
   - Enable SSL/TLS

### Development

Current setup is optimized for local development with:
- All ports exposed
- Default credentials
- Debug logging enabled

---

## 📝 File Structure

```
iot-data-integrity-chain/
├── Dockerfile.backend          # Spring Boot image
├── Dockerfile.simulator        # Python simulator image
├── docker-compose.yml          # Orchestration
├── docker-start.sh             # Startup script
├── docker-stop.sh              # Shutdown script
├── .dockerignore               # Build context exclusions
├── bc-api/
│   ├── Dockerfile (this one uses Dockerfile.backend)
│   └── src/main/resources/
│       └── application-docker.yml
├── sensor-simulator/
│   ├── .env
│   ├── requirements.txt
│   └── src/
├── mqtt/
│   └── config/
│       └── mosquitto.conf
└── database/
    └── init.sql
```

---

## 🚀 Quick Reference

```bash
# Start everything
./docker-start.sh

# View status
docker-compose ps

# View logs
docker-compose logs -f

# Stop everything
./docker-stop.sh

# Remove everything (including data)
docker-compose down -v

# Test health
curl http://localhost:8080/api/sensor-data/health

# Test MQTT
mosquitto_sub -h localhost -p 1883 -t "iot/sensors/#"

# Rebuild images
docker-compose build --no-cache

# Update and restart specific service
docker-compose up -d --build backend
```

---

## 📞 Support

For issues:

1. Check logs: `docker-compose logs -f`
2. Verify ports: `lsof -i :8080`, `lsof -i :1883`, `lsof -i :5432`
3. Restart service: `docker-compose restart <service>`
4. Full reset: `docker-compose down -v && docker-compose up -d`

---

**Docker Setup Ready!** 🎉

All services configured and ready to run in containers!
