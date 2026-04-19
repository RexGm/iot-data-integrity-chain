# Phase 2 - Quick Start Guide

## 🚀 5 Dakikada Başla

### Adım 1: Mosquitto Başlat (1 dakika)

```bash
# Başlat
brew services start mosquitto

# Kontrol et
brew services list | grep mosquitto

# Test et
mosquitto_sub -h localhost -p 1883 -t "test/topic"
# Başka terminal'de:
mosquitto_pub -h localhost -p 1883 -t "test/topic" -m "Hello"
```

### Adım 2: Producer Başlat (2 dakika)

```bash
cd sensor-simulator
./start-simulator.sh
```

**Başarı belirtisi:**
```
✅ Connected to MQTT broker at localhost:1883
▶️ Starting sensor data publishing loop...
📤 [1] Published: sensor-001 | Temp: 23.5°C | Humidity: 65%
```

### Adım 3: Verileri Dinle (1 dakika)

```bash
# Başka terminal'de
mosquitto_sub -h localhost -p 1883 -t "iot/sensors/#" -v

# Beklenen çıktı:
iot/sensors/sensor-001 {"deviceId":"sensor-001","temperature":23.5,"humidity":65.2,"timestamp":"2026-04-19T10:30:50.123456"}
iot/sensors/sensor-002 {"deviceId":"sensor-002","temperature":21.2,"humidity":58.1,"timestamp":"2026-04-19T10:35:00.654321"}
```

### Adım 4: Backend'i Test Et (1 dakika)

```bash
# Phase 1'deki backend çalışıyor mu?
curl -X GET http://localhost:8080/api/sensor-data/health
# Response: "Sensor Data API is running"
```

---

## 📋 Temel Komutlar

```bash
# Producer başlat
./sensor-simulator/start-simulator.sh

# Producer durdur
./sensor-simulator/stop-simulator.sh

# MQTT verilerini dinle
mosquitto_sub -h localhost -p 1883 -t "iot/sensors/#" -v

# Test verileri yayınla
mosquitto_pub -h localhost -p 1883 -t "iot/sensors/test" -m '{"test":"data"}'

# Logs izle
tail -f sensor-simulator/logs/sensor-simulator.log

# Producer process'i kontrol et
ps aux | grep producer.py
```

---

## 🔧 Konfigürasyon Ödemesi

Hızlı ayarlamalar için `.env` dosyasını düzenle:

```env
# Daha hızlı veri (1 saniyede bir)
PUBLISH_INTERVAL=1

# Daha yavaş veri (30 saniyede bir)
PUBLISH_INTERVAL=30

# Daha fazla device
DEVICE_IDS=sensor-001,sensor-002,sensor-003,sensor-004

# Daha yüksek sıcaklık aralığı
TEMP_MIN=20.0
TEMP_MAX=40.0
```

---

## 🧪 Test Senaryoları

### Scenario 1: Temel Publishing

```bash
# Terminal 1
./sensor-simulator/start-simulator.sh

# Terminal 2
mosquitto_sub -h localhost -p 1883 -t "iot/sensors/#"

# Beklenti: Sensor verilerini görmek
```

### Scenario 2: Multi-Consumer

```bash
# Terminal 1: Producer
./sensor-simulator/start-simulator.sh

# Terminal 2: Subscriber 1
mosquitto_sub -h localhost -p 1883 -t "iot/sensors/sensor-001"

# Terminal 3: Subscriber 2
mosquitto_sub -h localhost -p 1883 -t "iot/sensors/sensor-002"

# Terminal 4: Tümü
mosquitto_sub -h localhost -p 1883 -t "iot/sensors/#"
```

### Scenario 3: Backend Integration

```bash
# Terminal 1: Backend
cd bc-api
./mvnw spring-boot:run

# Terminal 2: Producer
cd sensor-simulator
./start-simulator.sh

# Terminal 3: Verileri dinle ve backend'e post et
mosquitto_sub -h localhost -p 1883 -t "iot/sensors/#" | while read topic payload; do
  curl -X POST http://localhost:8080/api/sensor-data \
    -H "Content-Type: application/json" \
    -d "$payload"
done
```

---

## 📊 Örnek JSON Çıktı

```json
{
  "deviceId": "sensor-001",
  "temperature": 23.5,
  "humidity": 65.2,
  "timestamp": "2026-04-19T10:30:50.123456"
}
```

---

## ⚠️ Sık Hatalar

| Hata | Çözüm |
|------|-------|
| `Connection refused` | `brew services start mosquitto` |
| `No module named 'paho'` | `pip install -r requirements.txt` |
| `Permission denied` | `chmod +x *.sh` |
| `Port 1883 in use` | `.env`'de port değiştir |

---

## 📈 Performance Metrikleri

Producer console'da metrics'i gösteriyor:

```
📤 [1] Published: sensor-001 | Temp: 23.5°C | Humidity: 65%
📤 [2] Published: sensor-002 | Temp: 21.2°C | Humidity: 58%
📤 [3] Published: sensor-003 | Temp: 19.8°C | Humidity: 72%
...
📊 Publishing Metrics: {
  'total_published': 150,
  'total_failed': 0,
  'last_publish_time': '2026-04-19T10:45:30',
  'success_rate': 100.0
}
```

---

## 🎯 Next Steps

✅ Phase 2 başarılı!

Sonraki:
1. Backend'i Phase 2 verilerine bağla
2. Real-time dashboard oluştur
3. Blockchain verification ekle

---

**Happy IoT Ting!** 🚀
