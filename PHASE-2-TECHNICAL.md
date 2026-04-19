# Phase 2 - Teknik Dokümantasyon

## 🏗️ Mimarı

```
┌──────────────────────────────────────────────────┐
│        Sensor Data Producer (producer.py)        │
│    Main orchestration & lifecycle management     │
└────┬────────────────────────────────┬────────────┘
     │                                │
     ├─→ SensorDataGenerator          ├─→ MQTTPublisher
     │   (sensor_generator.py)        │   (mqtt_publisher.py)
     │   - generate_batch()           │   - connect()
     │   - smooth transitions         │   - publish()
     │   - state management           │   - metrics tracking
     │                                │
     └────────────────┬───────────────┘
                      │
              ┌───────▼────────┐
              │   Models       │
              │ (models.py)    │
              │ SensorData     │
              │ PublishMetrics │
              └────────────────┘
                      │
     ┌────────────────┼────────────────┐
     │                │                │
┌────▼────┐   ┌───────▼─────┐   ┌────▼─────┐
│ Logger  │   │   Config    │   │   MQTT   │
│ Setup   │   │   (config)  │   │  Broker  │
└─────────┘   └─────────────┘   └──────────┘
```

---

## 📦 Bağımlılıklar

```
paho-mqtt==1.6.1
├─ MQTT communication
├─ QoS support (0, 1, 2)
├─ SSL/TLS ready
└─ Reconnection logic

python-dotenv==1.0.0
├─ .env file loading
├─ Environment variables
└─ Configuration management

Standard Library:
├─ logging - Structured logging
├─ dataclasses - Data structures
├─ json - Serialization
├─ random - Data generation
├─ signal - Graceful shutdown
├─ pathlib - File paths
└─ time - Timing & delays
```

---

## 🔄 Data Flow

### Publishing Cycle

```
1. generate_batch()
   ├─ For each device:
   │  ├─ Apply smooth variation
   │  ├─ Round to 1 decimal
   │  └─ Create SensorData object
   └─ Return batch list

2. publish_sensor_data()
   ├─ Convert to compact JSON
   ├─ Create MQTT topic
   └─ Publish with QoS 1

3. Update metrics
   ├─ Increment counter
   ├─ Record timestamp
   └─ Log success/failure

4. Wait (publish_interval)
```

### Single Sensor Reading

```
Device State
├─ temperature: 23.5°C
├─ humidity: 65.2%
└─ timestamp: now()
    │
    ▼
Apply Variation
├─ Change temp: ±0.5°C max
├─ Change humidity: ±2.0% max
└─ Bound to min/max
    │
    ▼
Create SensorData
├─ device_id: "sensor-001"
├─ temperature: 23.5
├─ humidity: 65.2
└─ timestamp: ISO format
    │
    ▼
Serialize to JSON
{
  "deviceId": "sensor-001",
  "temperature": 23.5,
  "humidity": 65.2,
  "timestamp": "2026-04-19T10:30:50.123456"
}
    │
    ▼
Publish to MQTT
Topic: iot/sensors/sensor-001
QoS: 1
Retain: False
```

---

## 🔐 MQTT Protocol Details

### Connection

```python
client.connect(
    host="localhost",
    port=1883,
    keepalive=60
)
```

- **Keepalive:** 60 saniye
- **Protocol:** MQTT v3.1.1 (Version 1)
- **Clean Session:** True (default)

### Publishing

```python
client.publish(
    topic="iot/sensors/sensor-001",
    payload='{"deviceId":"sensor-001",...}',
    qos=1,
    retain=False
)
```

**QoS 1 (At Least Once):**
- Message delivers at least once
- Broker confirms with PUBACK
- Slightly increased latency
- Ideal for sensor data

**Retain:** False
- Broker doesn't store last message
- Clients starting will not receive old data
- Fresh data only

### Callbacks

```python
on_connect()    # Broker bağlantısında
on_disconnect() # Bağlantı kopması
on_publish()    # Mesaj yayını tamamında
on_message()    # Mesaj alınması (if subscribed)
```

---

## 📊 Configuration Schema

### Environment Variables

```python
# MQTT (required)
MQTT_BROKER_HOST = str (default: localhost)
MQTT_BROKER_PORT = int (default: 1883)

# Sensors
DEVICE_IDS = comma-separated (default: sensor-001,002,003)
TEMP_MIN = float (default: 15.0)
TEMP_MAX = float (default: 35.0)
TEMP_STEP = internal, not configurable

HUMIDITY_MIN = float (default: 30.0)
HUMIDITY_MAX = float (default: 90.0)
HUMIDITY_STEP = internal, not configurable

# Publishing
PUBLISH_INTERVAL = int seconds (default: 5)

# Application
APP_MODE = development|production (default: development)
APP_DEBUG = boolean (default: True)
LOG_LEVEL = DEBUG|INFO|WARNING|ERROR (default: DEBUG)
MAX_DURATION = int seconds, 0=infinite (default: 0)
```

### Validation Rules

```
Temperature:
- Min < Max (required)
- Range: -50°C to 60°C (physical)
- Precision: 0.1°C

Humidity:
- Min < Max (required)
- Range: 0% to 100% (required)
- Precision: 0.1%

Interval:
- > 0 (required)
- Typical: 1-60 seconds

Device IDs:
- Non-empty (required)
- Typical: "sensor-XXX" format
```

---

## 🎯 Logging Strategy

### Log Levels

```
DEBUG:
├─ Generated: {sensor_data}
├─ Published to topic: {topic}
├─ Message published with ID: {mid}
└─ Detailed state changes

INFO:
├─ ✅ Connected to MQTT broker
├─ 📤 Published: sensor-001 | Temp: 23.5°C
├─ 🔬 Sensor Data Generator initialized
└─ ▶️ Starting sensor data publishing loop

WARNING:
├─ ⚠️ Unexpected disconnection
├─ ⚠️ broker not found at {host}:{port}
└─ Could not setup file logging

ERROR:
├─ ❌ Failed to connect to MQTT broker
├─ ❌ Error publishing sensor data
└─ ❌ Critical error in run loop

CRITICAL:
└─ System failures
```

### Log Format

```
%(asctime)s - %(name)s - %(levelname)s - %(message)s
2026-04-19 10:30:50 - iot-sensor-simulator - INFO - Message
2026-04-19 10:30:50 - iot-sensor-simulator.mqtt_publisher - DEBUG - Detail
```

### Log Files

```
logs/
├─ sensor-simulator.log (current)
├─ sensor-simulator.log.1 (rotated)
├─ sensor-simulator.log.2
├─ sensor-simulator.log.3
├─ sensor-simulator.log.4
└─ sensor-simulator.log.5

Max size: 10MB per file
Backup count: 5
Total: ~50MB max
```

---

## 🛡️ Error Handling

### Connection Errors

```python
try:
    client.connect(host, port, keepalive)
except Exception as e:
    logger.error(f"Failed to connect: {str(e)}")
    metrics.record_failure(error_msg)
    return False
```

**Recovery:** Auto-reconnect via MQTT library

### Publishing Errors

```python
if result.rc != mqtt.MQTT_ERR_SUCCESS:
    logger.error(f"Publish failed: {result.rc}")
    metrics.record_failure(error_msg)
    return False
```

**Recovery:** Retry on next cycle

### Generation Errors

```python
try:
    sensor_data = generate_sensor_data(device_id)
except Exception as e:
    logger.error(f"Error generating {device_id}: {str(e)}")
    # Continue with next device
```

**Recovery:** Continue with other devices

### Graceful Shutdown

```python
def signal_handler(sig, frame):
    logger.info("Shutdown signal received")
    running = False

try:
    while running:
        # main loop
finally:
    publisher.disconnect()
    logger.info("Shutdown complete")
```

---

## 📈 Performance Considerations

### Throughput

```
Current:
├─ 3 devices × 1 message = 3 messages per cycle
├─ 5 second interval = 0.6 messages/second
├─ Per day: 51,840 messages
└─ JSON payload: ~150 bytes

High Volume (1 sec interval, 20 devices):
├─ 20 devices × 1 cycle interval
├─ 1 second interval = 20 messages/second
├─ Per day: 1,728,000 messages
└─ Payload: ~3MB/day
```

### Resource Usage

```
Memory:
├─ Python runtime: ~30-50MB
├─ Paho MQTT: ~10-20MB
├─ Logs in memory: ~5MB
└─ Total: ~50-75MB

CPU:
├─ Idle: <1%
├─ Publishing: 1-2%
├─ JSON serialization: <1%
└─ Total: <5%

Disk:
├─ Logs generated: ~100KB/hour
├─ Log rotation: 10MB threshold
└─ Max: ~50MB (5 backups)
```

### Optimization Tips

```
For High Volume:
1. Increase PUBLISH_INTERVAL to batch more data
2. Reduce LOG_LEVEL to INFO (less disk I/O)
3. Use QoS 0 for fire-and-forget (if acceptable)
4. Disable retain flag

For Low Latency:
1. Decrease PUBLISH_INTERVAL to 1 second
2. Increase MQTT KEEPALIVE to 30
3. Use QoS 1 (current default)
4. Keep DEBUG logging for tracking
```

---

## 🧪 Testing Strategies

### Unit Tests

```python
# models_test.py
def test_sensor_data_creation():
    data = SensorData("sensor-001", 23.5, 65.2)
    assert data.device_id == "sensor-001"
    assert data.temperature == 23.5
    assert data.validate() == True

def test_duplicate_hash_prevention():
    generator = SensorDataGenerator(config, logger)
    # Should accept different variations
    # Should reject exact duplicates
```

### Integration Tests

```python
# integration_test.py
def test_mqtt_publishing():
    # Setup MQTT broker
    # Start publisher
    # Verify message received
    # Assert JSON format
    # Check metrics

def test_sensor_data_flow():
    # Generate data
    # Publish to MQTT
    # Subscribe and verify
    # Check timestamps
```

### Load Tests

```bash
# How many messages per second?
# Memory growth over time?
# Connection stability?
# Error rates under load?
```

---

## 🔍 Debugging

### Enable Verbose Logs

```bash
# .env
LOG_LEVEL=DEBUG
APP_DEBUG=True

# Run producer
./start-simulator.sh
```

### MQTT Debugging

```bash
# Subscribe with verbose output
mosquitto_sub -h localhost -p 1883 -t "iot/sensors/#" -d

# Publish test message
mosquitto_pub -h localhost -p 1883 -t "test/debug" -m '{"test":1}' -d

# Check broker status
mosquitto_ctrl status
```

### Python Debugging

```python
import pdb

# In producer.py
def run(self):
    # ...
    pdb.set_trace()  # Breakpoint
    batch = self.generator.generate_batch()
```

### Common Issues

```
Issue: "Connection refused"
Debug: 
  1. Check broker is running: ps aux | grep mosquitto
  2. Check port: lsof -i :1883
  3. Check hostname resolution: ping localhost
  4. Check firewall: sudo ufw status

Issue: "No JSON attribute"
Debug:
  1. Check data structure
  2. Verify serialization
  3. Log raw payload

Issue: "High memory usage"
Debug:
  1. Check log file size: du -sh logs/*
  2. Monitor process: top -p $(pgrep -f producer.py)
  3. Check for memory leaks: memory_profiler
```

---

## 🚀 Deployment

### Development

```bash
./start-simulator.sh
# Single instance, local broker
```

### Production

```bash
# 1. Install as systemd service
# 2. Use production grade MQTT (AWS IoT, Azure Event Hubs)
# 3. Enable TLS/SSL
# 4. Set LOG_LEVEL=INFO
# 5. Disable debug mode
# 6. Setup monitoring/alerts
# 7. Configure max_duration and restart policy
```

### Docker (Ready)

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY sensor-simulator /app

RUN pip install -r requirements.txt

CMD ["python", "src/producer.py"]
```

---

## 📞 Monitoring Checklist

- [ ] MQTT broker running and accessible
- [ ] Logs being written to file
- [ ] Message publishing successful
- [ ] No connection errors
- [ ] Metrics tracking accurate
- [ ] Memory usage stable
- [ ] CPU usage <5%
- [ ] JSON format valid
- [ ] Timestamps correct
- [ ] All devices publishing

---

**Phase 2 Implementation:** ✅ **COMPLETE**

Professional Python MQTT publisher ile IoT data simulation sağlanıyor!
