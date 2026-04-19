# Phase 1 - Backend Core: Tamamlama Rehberi

## 📋 Başarıyla Tamamlanan Bileşenler

### 1. **Entity Tasarımı** ✅

**Dosya:** `src/main/java/com/iot/bc_api/entity/SensorData.java`

```
SensorData Entity:
- id (Long) - Primary Key, Auto-increment
- deviceId (String) - İçileyen ID
- rawData (Text) - Ham sensor verisi (JSON/Text)
- hash (String) - SHA-256 hash
- createdAt (LocalDateTime) - Oluşturma tarihi (otomatik)
```

**Özellikler:**
- Unique hash kontrolü (duplikat veriyi önler)
- Otomatik timestamp işleme (`@PrePersist`)
- Lombok desteği (@Data, @Builder vb.)

---

### 2. **Repository Katmanı** ✅

**Dosya:** `src/main/java/com/iot/bc_api/repository/SensorDataRepository.java`

**Metotlar:**
- `findById(Long)` - ID ile veri getir
- `findByDeviceId(String)` - Device ID ile veri getir
- `findByHash(String)` - Hash ile veri getir (veri bütünlüğü kontrolü)
- `existsByHash(String)` - Hash kontrolü (duplikat önleme)
- `findLatestByDeviceId(String, int)` - Son N kaydı getir

---

### 3. **Hash Mekanizması** ✅

**Dosya:** `src/main/java/com/iot/bc_api/util/HashUtil.java`

```java
HashUtil.generateSHA256(String data) → SHA-256 hash
```

**Özellikleri:**
- SHA-256 hashing algoritması
- Hexadecimal format çıktı
- Thread-safe ve stateless

---

### 4. **Service Katmanı** ✅

**Dosya:** `src/main/java/com/iot/bc_api/service/SensorDataService.java`

**İşlevler:**
1. `saveSensorData(SensorDataRequest)` - Yeni veri kaydetme
   - Hash oluşturma
   - Duplikat kontrol
   - DB'ye kaydetme

2. `getAllSensorData()` - Tüm verileri getirme

3. `getSensorDataById(Long)` - Belirli ID'li veriyi getirme

4. `getSensorDataByDeviceId(String)` - Device'a ait tüm verileri getirme

5. `verifyDataIntegrity(Long, String)` - Hash ile veri bütünlüğünü doğrulama

**Özellikler:**
- `@Transactional` kullanımı
- Detaylı logging (SLF4J)
- Exception handling

---

### 5. **REST API Endpoints** ✅

**Dosya:** `src/main/java/com/iot/bc_api/controller/SensorDataController.java`

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| POST | `/api/sensor-data` | Yeni sensor verisi oluştur |
| GET | `/api/sensor-data` | Tüm sensor verilerini getir |
| GET | `/api/sensor-data/{id}` | ID ile veri getir |
| GET | `/api/sensor-data/device/{deviceId}` | Device'a ait verileri getir |
| POST | `/api/sensor-data/{id}/verify` | Veri bütünlüğünü doğrula |
| GET | `/api/sensor-data/health` | Health check |

---

### 6. **DTO Katmanı** ✅

**Dosyalar:**
- `SensorDataRequest.java` - POST/verify istekleri için
- `SensorDataResponse.java` - Response için

**Validation:**
- `@NotBlank` - Zorunlu alanlar
- Custom error messages

---

### 7. **Global Exception Handler** ✅

**Dosya:** `src/main/java/com/iot/bc_api/exception/GlobalExceptionHandler.java`

**Yönetilen Exceptions:**
- `MethodArgumentNotValidException` - Validation hataları
- `IllegalArgumentException` - Business logic hataları
- `Exception` - Genel hatalar

**Response Format:**
```json
{
  "status": 400,
  "message": "Hata mesajı",
  "errors": {
    "field": "error message"
  },
  "timestamp": "2026-04-19T10:30:00"
}
```

---

### 8. **Security Configuration** ✅

**Dosya:** `src/main/java/com/iot/bc_api/config/SecurityConfig.java`

**Ayarlar:**
- CSRF devre dışı (geliştirme ortamı için)
- `/api/**` ve `/actuator/**` endpoints'i izin verilen
- JWT için hazır (sonraki fazlar)

---

## 🚀 Kurulum ve Çalıştırma

### Ön Koşullar

1. **PostgreSQL Installed**
   ```bash
   # macOS
   brew install postgresql
   
   # Başlatma
   brew services start postgresql
   ```

2. **Database Oluşturma**
   ```bash
   psql -U postgres
   
   CREATE DATABASE iot;
   CREATE USER iot_user WITH PASSWORD 'Stron9EnoughToBeP@ssw0rd';
   GRANT ALL PRIVILEGES ON DATABASE iot TO iot_user;
   ```

3. **Java & Maven**
   - Java 21+
   - Maven 3.8+

### Spring Boot Uygulamayı Başlatma

```bash
cd bc-api

# Maven clean build
./mvnw clean install

# Uygulamayı başlat
./mvnw spring-boot:run
```

**Beklenen Output:**
```
Started BcApiApplication in XX.XXX seconds
Server is running on port 8080
```

---

## 📮 Postman ile Test Etme

### 1. **Postman Collection İçe Aktarma**

1. Postman'i aç
2. **Import** → **File** → `bc-api/Postman-Collection.json` seç
3. Collection'ı içe aktar

### 2. **Test Sırası**

#### Health Check
```
GET http://localhost:8080/api/sensor-data/health
```

#### Create Sensor Data
```
POST http://localhost:8080/api/sensor-data

{
  "deviceId": "sensor-001",
  "rawData": "{\"temperature\": 23.5, \"humidity\": 65, \"timestamp\": \"2026-04-19T10:30:00\"}"
}
```

**Expected Response (201):**
```json
{
  "id": 1,
  "deviceId": "sensor-001",
  "rawData": "{\"temperature\": 23.5, \"humidity\": 65, \"timestamp\": \"2026-04-19T10:30:00\"}",
  "hash": "a1b2c3d4e5f6g7h8...",
  "createdAt": "2026-04-19T10:30:00"
}
```

#### Get All
```
GET http://localhost:8080/api/sensor-data
```

#### GetById
```
GET http://localhost:8080/api/sensor-data/1
```

#### Get by Device
```
GET http://localhost:8080/api/sensor-data/device/sensor-001
```

#### Verify Integrity (Valid)
```
POST http://localhost:8080/api/sensor-data/1/verify

{
  "rawData": "{\"temperature\": 23.5, \"humidity\": 65, \"timestamp\": \"2026-04-19T10:30:00\"}"
}
```

**Response:**
```json
{
  "id": 1,
  "isValid": true,
  "message": "Data integrity verified"
}
```

#### Verify Integrity (Invalid)
```
POST http://localhost:8080/api/sensor-data/1/verify

{
  "rawData": "{\"temperature\": 25.0, \"humidity\": 70}"
}
```

**Response:**
```json
{
  "id": 1,
  "isValid": false,
  "message": "Data integrity check failed"
}
```

---

## 📊 Proje Yapısı

```
bc-api/
├── src/
│   ├── main/
│   │   ├── java/com/iot/bc_api/
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── controller/
│   │   │   │   └── SensorDataController.java
│   │   │   ├── dto/
│   │   │   │   ├── SensorDataRequest.java
│   │   │   │   └── SensorDataResponse.java
│   │   │   ├── entity/
│   │   │   │   └── SensorData.java
│   │   │   ├── exception/
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── repository/
│   │   │   │   └── SensorDataRepository.java
│   │   │   ├── service/
│   │   │   │   └── SensorDataService.java
│   │   │   ├── util/
│   │   │   │   └── HashUtil.java
│   │   │   └── BcApiApplication.java
│   │   └── resources/
│   │       └── application.yaml
│   └── test/
│       └── java/com/iot/bc_api/
│           └── BcApiApplicationTests.java
├── pom.xml
├── mvnw
├── Postman-Collection.json
└── PHASE-1-GUIDE.md

```

---

## ✅ Test Edilmesi Gerekenler

- [x] POST `/api/sensor-data` - Veri oluşturma
- [x] GET `/api/sensor-data` - Tüm veriyi getir
- [x] GET `/api/sensor-data/{id}` - ID ile getir
- [x] GET `/api/sensor-data/device/{deviceId}` - Device ile getir
- [x] POST `/api/sensor-data/{id}/verify` - Hash doğrulama
- [x] Duplikat veriyi reddetme (same hash)
- [x] Validation hataları (missing fields)
- [x] 404 hatası (inexistent ID)

---

## 🔧 Sonraki Fazlar Hazırlığı

Phase 1 tamamlandı! Sonraki fazlar:

### Phase 2: Blockchain Integration
- Hyperledger Fabric entegrasyonu
- Chaincode yazılışı
- Data hashing ve verification

### Phase 3: MQTT Integration
- Sensor verileri gerçek zamanlı alma
- Message processing
- Data pipeline

### Phase 4: Frontend
- Vue.js / React UI
- Real-time dashboard
- Data visualization

### Phase 5: Advanced Features
- JWT Authentication
- Rate limiting
- Caching
- Monitoring & Logging

---

## 📝 Notlar

- **Hash Uniqueness:** Aynı raw data'nın SHA-256 hash'i her zaman aynı çıkacağı için duplikat kontrol sağlanır
- **Data Integrity:** Verinin değişip değişmediğini kontrol etmek için hash'ini tekrar hesapla ve orijinali ile saklaştır
- **Logging:** `application.yaml`'de `DEBUG` level açılı, production'da `INFO`'ya düşürülmeli
- **Security:** Geliştirme ortamında CSRF ve Auth devre dışı, production'da kesinlikle açılmalı

---

## 🐛 Sık Sorulan Sorunlar

### Problem: PostgreSQL bağlantı hatası
**Çözüm:**
```bash
# PostgreSQL servisini kontrol et
brew services list

# Başlat
brew services start postgresql

# Test et
psql -U iot_user -d iot -c "SELECT 1"
```

### Problem: Build hatası
**Çözüm:**
```bash
./mvnw clean install -DskipTests
```

### Problem: Port 8080 zaten kullanılıyor
**Çözüm:** `application.yaml`'de port değiştir
```yaml
server:
  port: 8081
```

---

## 📞 Destek

Herhangi bir sorun için lütfen kontrol edin:
1. Logs: `./mvnw spring-boot:run` çıktısı
2. Database: `SELECT * FROM sensor_data;` query'sini çalıştır
3. API: Health endpoint'i test et: `GET /api/sensor-data/health`

---

**Phase 1 Status:** ✅ **COMPLETE**

Başarıyla tamamlanan Phase 1 backend core bileşenleri, profesyonel standartlar ve best practices ile geliştirilmiştir.
