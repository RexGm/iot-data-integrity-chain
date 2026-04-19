# 🚀 Phase 1 - Hızlı Başlangıç Rehberi

## 5 Dakikada Başla

### Adım 1: Veritabanını Hazırla (1 dakika)

```bash
# PostgreSQL başlat
brew services start postgresql

# Terminal'de PostgreSQL'e gir
psql -U postgres

# Aşağıdaki komutları çalıştır
CREATE DATABASE iot;
CREATE USER iot_user WITH PASSWORD 'Stron9EnoughToBeP@ssw0rd';
GRANT ALL PRIVILEGES ON DATABASE iot TO iot_user;
\q
```

### Adım 2: Backend'i Başlat (2 dakika)

```bash
cd bc-api

./mvnw clean install

./mvnw spring-boot:run
```

**Başarı belirtisi:**
```
2026-04-19 10:30:45 - Starting BcApiApplication...
2026-04-19 10:30:50 - Started BcApiApplication in 5.234 seconds
```

### Adım 3: API Health Check (30 saniye)

```bash
curl http://localhost:8080/api/sensor-data/health
```

**Expected Response:**
```
Sensor Data API is running
```

### Adım 4: Postman ile Test Et (2 dakika)

1. Postman'i aç
2. **Import** → `bc-api/Postman-Collection.json`
3. Koleksiyondaki requests'i yönetmen

---

## 📋 Temel Test Senaryosu

### 1️⃣ Sensor Verisi Oluştur

**Request:**
```http
POST http://localhost:8080/api/sensor-data
Content-Type: application/json

{
  "deviceId": "sensor-001",
  "rawData": "{\"temp\": 23.5, \"humidity\": 65}"
}
```

**Response (201):**
```json
{
  "id": 1,
  "deviceId": "sensor-001",
  "rawData": "{\"temp\": 23.5, \"humidity\": 65}",
  "hash": "a1b2c3d4e5f6g7h8...",
  "createdAt": "2026-04-19T10:30:50"
}
```

### 2️⃣ Tüm Verileri Al

```http
GET http://localhost:8080/api/sensor-data
```

### 3️⃣ Spesifik Veriyi Al

```http
GET http://localhost:8080/api/sensor-data/1
```

### 4️⃣ Device'a Ait Verileri Al

```http
GET http://localhost:8080/api/sensor-data/device/sensor-001
```

### 5️⃣ Veri Bütünlüğünü Doğrula

```http
POST http://localhost:8080/api/sensor-data/1/verify
Content-Type: application/json

{
  "rawData": "{\"temp\": 23.5, \"humidity\": 65}"
}
```

**Response (Valid):**
```json
{
  "id": 1,
  "isValid": true,
  "message": "Data integrity verified"
}
```

---

## 🧪 Hızlı cURL Test Komutları

```bash
# Health Check
curl -X GET http://localhost:8080/api/sensor-data/health

# Create
curl -X POST http://localhost:8080/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"sensor-001","rawData":"{\"temp\":23.5}"}'

# Get All
curl -X GET http://localhost:8080/api/sensor-data

# Get by ID
curl -X GET http://localhost:8080/api/sensor-data/1

# Get by Device
curl -X GET http://localhost:8080/api/sensor-data/device/sensor-001
```

---

## 🔍 Log Kontrolü

**Terminal'de çalışan uygulamanın çıktısını izle:**

```bash
DEBUG seviyesi loglar:
[DEBUG] com.iot.bc_api - Saving sensor data for device: sensor-001
[DEBUG] com.iot.bc_api - Generated hash: a1b2c3d4...
```

---

## ✅ Kontrol Listesi

- [ ] PostgreSQL çalışıyor mu? `psql -U iot_user -d iot -c "SELECT 1"`
- [ ] Spring Boot başladı mı? `http://localhost:8080/api/sensor-data/health`
- [ ] Postman collection'ı içe aktardım mı?
- [ ] Health endpoint çalışıyor mu?
- [ ] POST request başarılı mı?
- [ ] GET request verileri döndürüyor mü?

---

## 🆘 Sorun Çözüm

| Sorun | Çözüm |
|-------|--------|
| `Connection refused` | `brew services start postgresql` |
| `Port 8080 in use` | `application.yaml`'de port değiştir |
| `Build failed` | `./mvnw clean install -DskipTests` |
| `404 Not Found` | URL'nin doğru olduğunu kontrol et |
| `Duplicate hash error` | Aynı rawData ile yeni POST yapmaya çalışmışsın |

---

## 📊 Database Doğrulama

```bash
# PostgreSQL'e bağlan
psql -U iot_user -d iot

# Tabloyu görüntüle
SELECT * FROM sensor_data;

# Verinin detayını gör
SELECT id, device_id, hash, created_at FROM sensor_data;

# Çık
\q
```

---

## 🎯 Sonraki Adımlar

✅ **Phase 1 Tamamlandı!**

Şimdi:
1. Tüm endpoints'i sıfırla
2. Farklı device ID'leri ile veri oluştur
3. Hash verification'ı test et
4. Duplikat veriyi test et

Hazır olduğunda Phase 2'ye geçebilirsin:
- Blockchain (Hyperledger Fabric)
- Smart contracts
- Data chain verification

---

**Happy Testing! 🚀**
