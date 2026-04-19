# Phase 2 - IoT Simülasyonu (Python)

## 📋 Genel Bakış

Phase 2 IoT sensör verilerini simüle ederek MQTT broker'ına yayınlayan profesyonel bir Python uygulamasıdır. Gerçekçi sensor verileri (sıcaklık, nem) üretir ve belirtilen aralıklarla MQTT topiclerine yayınlar.

## 🎯 Karakteristikler

✅ **MQTT Publisher**
- Paho MQTT 1.6.1 kütüphanesi
- Otomatik reconnection logics
- QoS 1 (At least once) delivery
- Connection state management

✅ **Sensor Data Generator**
- Gerçekçi veri geçişleri (düz rasgelelik değil)
- Konfigüre edilebilir sıcaklık ve nem aralıkları
- Multi-device desteği
- State management

✅ **Professional Architecture**
- Modüler tasarım (config, models, publisher, generator)
- Comprehensive logging (console + file)
- Error handling ve graceful shutdown
- Environment variable configuration
- Type hints ve docstrings

✅ **DevOps Ready**
- Virtual environment management
- Systemd compatible
- Docker support ready
- Metrics tracking

---

## 📦 Proje Yapısı

```
sensor-simulator/
├── src/
│   ├── __init__.py              # Package initialization
│   ├── config.py                # Configuration management
│   ├── models.py                # Data models
│   ├── mqtt_publisher.py        # MQTT Publisher class
│   ├── sensor_generator.py      # Sensor data generator
│   ├── logger_setup.py          # Logging configuration
│   └── producer.py              # Main application
├── .env                         # Environment variables
├── requirements.txt             # Python dependencies
├── start-simulator.sh           # Startup script
├── stop-simulator.sh            # Shutdown script
├── README.md                    # This file
└── mqtt_client.py              # Alternative manual MQTT client
```

---

## 🔧 Kurulum

### Ön Koşullar

```bash
# macOS
brew install python@3.11
brew install mosquitto

# Linux (Ubuntu/Debian)
sudo apt-get install python3 python3-venv mosquitto

# Windows (WSL recommended)
# Aynı Linux komutları
```

### Bağımlılıkları Kur

```bash
cd sensor-simulator

# Sanal ortam oluştur
python3 -m venv venv

# Sanal ortamı aktif et
source venv/bin/activate  # macOS/Linux
# veya
.\venv\Scripts\activate   # Windows

# Bağımlılıkları yükle
pip install -r requirements.txt
```

---

## 🚀 Çalıştırma

### Otomatik Başlatma (Önerilen)

```bash
cd sensor-simulator
./start-simulator.sh
```

**Ne yapar:**
- Python ve mosquitto kontrolü
- Virtual environment oluşturma/aktive etme
- Dependencies yükleme
- .env dosyasından config yükleme
- MQTT broker bağlantısı kontrolü
- Producer'ı başlatma

### Manuel Başlatma

```bash
cd sensor-simulator/src

# .env dosyasını yükle
export $(cat ../.env | xargs)

# Producer'ı çalıştır
python3 producer.py
```

### Duruma Bakma

```bash
# Producer process'i kontrol et
ps aux | grep producer.py

# MQTT Broker bağlantı testi
mosquitto_sub -h localhost -p 1883 -t "iot/sensors/#"
```

### Durdurma

```bash
./sensor-simulator/stop-simulator.sh
# veya Ctrl+C
```

---

## ⚙️ Konfigürasyon

### Environment Variables (.env)

```env
# MQTT Broker
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883

# Sensor Devices
DEVICE_IDS=sensor-001,sensor-002,sensor-003

# Sıcaklık (Celsius)
TEMP_MIN=15.0
TEMP_MAX=35.0

# Nem (Percentage)
HUMIDITY_MIN=30.0
HUMIDITY_MAX=90.0

# Publishing interval (seconds)
PUBLISH_INTERVAL=5

# Application
APP_MODE=development
APP_DEBUG=True
LOG_LEVEL=DEBUG

# Max runtime (0 = infinite)
MAX_DURATION=0
```

### Konfigürasyon Sınıfları

**config.py içinde:**

```python
MQTTConfig       # MQTT broker ayarları
SensorConfig     # Sensor parametreleri
AppConfig        # Application ayarları
Config           # Tüm konfigürasyonlar
```

---

## 📊 Veri Yapısı

### Sensor Data JSON

```json
{
  "deviceId": "sensor-001",
  "temperature": 23.5,
  "humidity": 65.2,
  "timestamp": "2026-04-19T10:30:50.123456"
}
```

### MQTT Topic Format

```
iot/sensors/<device-id>

Örnek:
- iot/sensors/sensor-001
- iot/sensors/sensor-002
- iot/sensors/sensor-003
```

### Message Format

```
Compact JSON (single line):
{"deviceId":"sensor-001","temperature":23.5,"humidity":65.2,"timestamp":"2026-04-19T10:30:50.123456"}
```

---

## 📝 Logging

### Log Çıktıları

```
2026-04-19 10:30:45 - iot-sensor-simulator - INFO - 🚀 IoT Sensor Data Producer Initializing...
2026-04-19 10:30:45 - iot-sensor-simulator - INFO - 📋 Configuration:
   mqtt: {'broker_host': 'localhost', 'broker_port': 1883, ...}
2026-04-19 10:30:45 - iot-sensor-simulator - INFO - 🔌 Initializing MQTT Publisher...
2026-04-19 10:30:46 - iot-sensor-simulator - INFO - ✅ Connected to MQTT broker at localhost:1883
2026-04-19 10:30:47 - iot-sensor-simulator - INFO - 📤 [1] Published: sensor-001 | Temp: 23.5°C | Humidity: 65%
```

### Log Dosyası

```
logs/sensor-simulator.log
- MaxBytes: 10MB
- BackupCount: 5 (sensor-simulator.log.1-5)
- Level: DEBUG
```

---

## 🧪 Testing

### MQTT Subscriber ile Test

```bash
# Terminal 1: Producer başlat
./sensor-simulator/start-simulator.sh

# Terminal 2: Verileri dinle
mosquitto_sub -h localhost -p 1883 -t "iot/sensors/#" -v

# Beklenen çıktı:
iot/sensors/sensor-001 {"deviceId":"sensor-001","temperature":23.5,"humidity":65.2,"timestamp":"2026-04-19T..."}
iot/sensors/sensor-002 {"deviceId":"sensor-002","temperature":21.2,"humidity":58.1,"timestamp":"2026-04-19T..."}
```

### Python Test Script

```python
import paho.mqtt.client as mqtt
import json

def on_message(client, userdata, msg):
    data = json.loads(msg.payload)
    print(f"📨 {data['deviceId']}: {data['temperature']}°C, {data['humidity']}%")

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
client.on_message = on_message
client.connect("localhost", 1883)
client.subscribe("iot/sensors/#")
client.loop_forever()
```

### curl MQTT Broker Test

```bash
# Broker sağlık kontrolü
nc -zv localhost 1883
# Beklenen: Connection succeeded

# mosquitto_pub ile test yayını
mosquitto_pub -h localhost -p 1883 -t "test/topic" -m "Hello MQTT"
```

---

## 📚 Modüllerin Detayları

### config.py

```
MQTTConfig
├── broker_host: str (default: localhost)
├── broker_port: int (default: 1883)
├── client_id: str (default: iot-sensor-simulator)
└── keepalive: int (default: 60)

SensorConfig
├── device_ids: List[str] (default: sensor-001,002,003)
├── temp_min, temp_max: float
├── humidity_min, humidity_max: float
├── publish_interval: int (seconds)
└── topic_base: str (default: iot/sensors)

AppConfig
├── mode: str (development/production)
├── debug: bool
├── log_level: str (DEBUG, INFO, WARNING, ERROR)
└── max_duration: int (seconds)
```

### models.py

```
SensorData
├── device_id: str
├── temperature: float
├── humidity: float
├── timestamp: datetime
└── Methods:
    ├── to_dict()
    ├── to_json()
    ├── to_compact_json()
    └── validate()

PublishMetrics
├── total_published: int
├── total_failed: int
├── last_publish_time: datetime
├── last_error: str
└── Methods:
    ├── record_success()
    ├── record_failure()
    └── to_dict()
```

### mqtt_publisher.py

```
MQTTPublisher
├── connect()
├── disconnect()
├── publish(topic, payload, qos, retain)
├── publish_sensor_data(sensor_data, topic)
├── get_metrics()
├── log_metrics()
└── is_healthy()
```

### sensor_generator.py

```
SensorDataGenerator
├── generate_sensor_data(device_id)
├── generate_batch()
├── get_current_state()
├── reset_device(device_id)
└── reset_all()
```

### logger_setup.py

```
setup_logging(config) → Logger
get_logger(name) → Logger
```

### producer.py

```
SensorDataProducer
├── initialize()
├── run()
├── shutdown()
└── print_status()
```

---

## 🐛 Sık Sorulan Sorunlar

### Problem: "Connection refused" hatası

**Çözüm:**
```bash
# Mosquitto çalışıyor mu kontrol et
brew services list | grep mosquitto

# Başlat
brew services start mosquitto

# Test et
mosquitto_sub -h localhost -p 1883 -t "test/topic"
```

### Problem: "ModuleNotFoundError: No module named 'paho'"

**Çözüm:**
```bash
# Virtual environment aktif mi kontrol et
which python

# Requirements'ı yeniden yükle
pip install -r requirements.txt
```

### Problem: Port 1883 zaten kullanımda

**Çözüm:**
```bash
# Process'i bul
lsof -i :1883

# Veya .env'de port değiştir
MQTT_BROKER_PORT=1884
```

### Problem: "Permission denied" for scripts

**Çözüm:**
```bash
chmod +x sensor-simulator/start-simulator.sh
chmod +x sensor-simulator/stop-simulator.sh
```

### Problem: No logs görülüyor

**Çözüm:**
```bash
# .env'de log level'ı kontrol et
LOG_LEVEL=DEBUG

# Logs dizinini kontrol et
tail -f sensor-simulator/logs/sensor-simulator.log
```

---

## 🔄 Workflow

```
┌─────────────────┐
│ config.py       │ ← Environment variables
└────────┬────────┘
         ↓
┌─────────────────────────┐
│ producer.py             │
│  SensorDataProducer     │
└────────┬────────────────┘
         │
         ├─→ logger_setup.py (Logging config)
         ├─→ mqtt_publisher.py (MQTT conn)
         │    ├─→ connect()
         │    └─→ publish()
         ├─→ sensor_generator.py (Data gen)
         │    └─→ generate_batch()
         └─→ models.py (Data models)
              ├─→ SensorData
              └─→ PublishMetrics
         
         ↓
    MQTT Broker
    (localhost:1883)
         
         ↓
    Backend
    (localhost:8080)
```

---

## 📊 Performance Tuning

### High Volume Publishing

```env
# .env
PUBLISH_INTERVAL=1        # 1 saniye
DEVICE_IDS=sensor-001,sensor-002,sensor-003,sensor-004,sensor-005

# MQTT Config optimization
MQTT_KEEPALIVE=30
```

### Low Resource Mode

```env
# .env
PUBLISH_INTERVAL=10       # 10 saniye
DEVICE_IDS=sensor-001     # Tek device
LOG_LEVEL=INFO            # Less logging
```

---

## 🎯 Sonraki Adımlar

✅ **Phase 2 Tamamlandı!**

**Phase 3'e geçmek için:**

1. Phase 2 test edildi
2. MQTT verisi backend'e entegre edilecek
3. MQTT Subscriber yazılacak (Part 2)
4. Backend'de MQTT consumer oluşturulacak
5. Real-time data processing başlayacak

**Integration çalışması:**
- MQTT topiclerini Spring Boot'ta dinleme
- Sensor verilerini database'e kaydetme
- WebSocket ile frontend'e stream etme

---

## 📞 Destek

**Kontrol Listesi:**

- [ ] Python 3.11+ kurulu
- [ ] Mosquitto broker kurulu ve çalışıyor
- [ ] Virtual environment oluşturuldu
- [ ] Dependencies yüklendi
- [ ] .env dosyası konfigüre edildi
- [ ] Producer başlatıldı
- [ ] MQTT verileri alınıyor
- [ ] Logs loglanıyor

**Debug Mode:**

```bash
# Terminal 1: Producer
APP_DEBUG=True LOG_LEVEL=DEBUG ./start-simulator.sh

# Terminal 2: MQTT Subscribe
mosquitto_sub -h localhost -p 1883 -t "iot/sensors/#" -v

# Terminal 3: Monitor logs
tail -f sensor-simulator/logs/sensor-simulator.log
```

---

## 📄 Dosya Açıklamaları

| Dosya | Amaç |
|-------|------|
| `config.py` | Configuration management |
| `models.py` | Data structures |
| `mqtt_publisher.py` | MQTT publishing logic |
| `sensor_generator.py` | Sensor data simulation |
| `logger_setup.py` | Logging configuration |
| `producer.py` | Main application |
| `.env` | Environment variables |
| `start-simulator.sh` | Automated startup |
| `stop-simulator.sh` | Clean shutdown |

---

**Phase 2 Status:** ✅ **COMPLETE**

Professional Python uygulaması ile MQTT'ye sensor verisi yayınlanıyor!
