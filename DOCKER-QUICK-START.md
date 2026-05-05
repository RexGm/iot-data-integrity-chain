# 🐳 Docker Quick Start - 2 Minutes

## Tek Komut ile Başlat

```bash
cd /Users/rexgm/CodeSpells/iot-data-integrity-chain
./docker-start.sh
```

**Başarı belirtisi:**
```
🚀 All Services Starting!
📋 Service URLs:
  Backend API:       http://localhost:8080
  MQTT Broker:       localhost:1883
  PostgreSQL:        localhost:5432
```

---

## Hızlı Testler

### 1. Backend Sağlıklı mı?
```bash
curl http://localhost:8080/api/sensor-data/health

# Response: "Sensor Data API is running"
```

### 2. MQTT Verileri Alıyor mu?
```bash
docker run --rm -it --network=host eclipse-mosquitto \
  mosquitto_sub -h localhost -p 1883 -t "iot/sensors/#" -v

# Beklenen çıktı:
# iot/sensors/sensor-001 {"deviceId":"sensor-001","temperature":23.5,...}
```

### 3. Database Çalışıyor mu?
```bash
docker-compose exec postgres psql -U iot_user -d iot -c "SELECT COUNT(*) FROM sensor_data;"
```

---

## Logs İzle

```bash
# Tüm services
docker-compose logs -f

# Sadece backend
docker-compose logs -f backend

# Sadece simulator
docker-compose logs -f simulator
```

---

## Durdur

```bash
./docker-stop.sh

# Veya tüm data temizle
docker-compose down -v
```

---

## 📊 Kontrol Listesi

- [ ] Docker Desktop açık
- [ ] `./docker-start.sh` çalıştırıldı
- [ ] Tüm containers çalışıyor: `docker-compose ps`
- [ ] Backend health: `curl http://localhost:8080/api/sensor-data/health`
- [ ] MQTT messages alınıyor
- [ ] Database bağlı

---

## 🔗 Service URLs

| Service | URL | Port |
|---------|-----|------|
| Backend API | http://localhost:8080 | 8080 |
| MQTT | localhost:1883 | 1883 |
| PostgreSQL | localhost:5432 | 5432 |

---

## 💡 Tips

```bash
# Tekrar build et (değişiklikleri almak için)
docker-compose build --no-cache backend

# Specific service yeniden başlat
docker-compose restart backend

# Shell'e gir
docker-compose exec backend bash
docker-compose exec simulator bash
docker-compose exec postgres psql -U iot_user -d iot

# Real-time stats
docker stats

# Service kaldır ve tekrar başlat
docker-compose up -d --build backend
```

---

**Ready! 🚀**

Tüm services Docker'da çalışıyor ve hazır!
