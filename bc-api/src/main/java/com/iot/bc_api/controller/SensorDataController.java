package com.iot.bc_api.controller;

import com.iot.bc_api.dto.SensorDataRequest;
import com.iot.bc_api.dto.SensorDataResponse;
import com.iot.bc_api.dto.BlockchainSensorHistoryEntry;
import com.iot.bc_api.dto.BlockchainSensorRecord;
import com.iot.bc_api.service.SensorDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sensor-data")
@RequiredArgsConstructor
@Slf4j
public class SensorDataController {

    private final SensorDataService sensorDataService;

    /**
     * Create new sensor data entry
     * POST /api/sensor-data
     *
     * @param request Sensor data request with deviceId and rawData
     * @return Created sensor data with 201 status
     */
    @PostMapping
    public ResponseEntity<SensorDataResponse> createSensorData(
            @Valid @RequestBody SensorDataRequest request) {
        log.info("POST /api/sensor-data - Creating new sensor data for device: {}", request.getDeviceId());
        try {
            SensorDataResponse response = sensorDataService.saveSensorData(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("Error creating sensor data: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get all sensor data
     * GET /api/sensor-data
     *
     * @return List of all sensor data entries
     */
    @GetMapping
    public ResponseEntity<List<SensorDataResponse>> getAllSensorData() {
        log.info("GET /api/sensor-data - Fetching all sensor data");
        List<SensorDataResponse> data = sensorDataService.getAllSensorData();
        return ResponseEntity.ok(data);
    }

    /**
     * Get sensor data by ID
     * GET /api/sensor-data/{id}
     *
     * @param id Sensor data ID
     * @return Sensor data with specified ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SensorDataResponse> getSensorDataById(@PathVariable Long id) {
        log.info("GET /api/sensor-data/{} - Fetching sensor data with id: {}", id, id);
        try {
            SensorDataResponse response = sensorDataService.getSensorDataById(id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Sensor data not found with id: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get sensor data by device ID
     * GET /api/sensor-data/device/{deviceId}
     *
     * @param deviceId Device identifier
     * @return List of sensor data for the device
     */
    @GetMapping("/device/{deviceId}")
    public ResponseEntity<List<SensorDataResponse>> getSensorDataByDevice(
            @PathVariable String deviceId) {
        log.info("GET /api/sensor-data/device/{} - Fetching sensor data for device", deviceId);
        List<SensorDataResponse> data = sensorDataService.getSensorDataByDeviceId(deviceId);
        return ResponseEntity.ok(data);
    }

    /**
     * Verify data integrity
     * POST /api/sensor-data/{id}/verify
     *
     * @param id Sensor data ID
     * @param request Request body containing rawData to verify
     * @return Verification result (true/false)
     */
    @PostMapping("/{id}/verify")
    public ResponseEntity<VerifyResponse> verifySensorDataIntegrity(
            @PathVariable Long id,
            @RequestBody @Valid VerifyRequest request) {
        log.info("POST /api/sensor-data/{}/verify - Verifying data integrity", id);
        try {
            boolean isValid = sensorDataService.verifyDataIntegrity(id, request.getRawData());
            VerifyResponse response = VerifyResponse.builder()
                    .id(id)
                    .isValid(isValid)
                    .message(isValid ? "Data integrity verified" : "Data integrity check failed")
                    .build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error verifying data: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Verify data integrity against blockchain
     * POST /api/sensor-data/{id}/verify-blockchain
     *
     * @param id Sensor data ID
     * @param request Request body containing rawData to verify
     * @return Verification result (true/false)
     */
    @PostMapping("/{id}/verify-blockchain")
    public ResponseEntity<VerifyResponse> verifySensorDataBlockchainIntegrity(
            @PathVariable Long id,
            @RequestBody @Valid VerifyRequest request) {
        log.info("POST /api/sensor-data/{}/verify-blockchain - Verifying blockchain integrity", id);
        try {
            boolean isValid = sensorDataService.verifyBlockchainIntegrity(id, request.getRawData());
            VerifyResponse response = VerifyResponse.builder()
                    .id(id)
                    .isValid(isValid)
                    .message(isValid ? "Blockchain integrity verified" : "Blockchain integrity check failed")
                    .build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error verifying blockchain data: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Verify data integrity using stored raw data
     * GET /api/sensor-data/{id}/verify-local
     *
     * @param id Sensor data ID
     * @return Verification result (true/false)
     */
    @GetMapping("/{id}/verify-local")
    public ResponseEntity<VerifyResponse> verifySensorDataLocalIntegrity(@PathVariable Long id) {
        log.info("GET /api/sensor-data/{}/verify-local - Verifying stored data integrity", id);
        try {
            boolean isValid = sensorDataService.verifyLocalIntegrity(id);
            VerifyResponse response = VerifyResponse.builder()
                    .id(id)
                    .isValid(isValid)
                    .message(isValid ? "Local integrity verified" : "Local integrity check failed")
                    .build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error verifying local data: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get blockchain record for stored sensor data
     * GET /api/sensor-data/{id}/blockchain-record
     *
     * @param id Sensor data ID
     * @return Blockchain record
     */
    @GetMapping("/{id}/blockchain-record")
    public ResponseEntity<BlockchainSensorRecord> getBlockchainRecord(@PathVariable Long id) {
        log.info("GET /api/sensor-data/{}/blockchain-record - Fetching blockchain record", id);
        try {
            BlockchainSensorRecord record = sensorDataService.getBlockchainRecord(id);
            return ResponseEntity.ok(record);
        } catch (IllegalArgumentException e) {
            log.error("Error fetching blockchain record: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get blockchain history for stored sensor data
     * GET /api/sensor-data/{id}/blockchain-history
     *
     * @param id Sensor data ID
     * @return Blockchain history entries
     */
    @GetMapping("/{id}/blockchain-history")
    public ResponseEntity<List<BlockchainSensorHistoryEntry>> getBlockchainHistory(@PathVariable Long id) {
        log.info("GET /api/sensor-data/{}/blockchain-history - Fetching blockchain history", id);
        try {
            List<BlockchainSensorHistoryEntry> history = sensorDataService.getBlockchainHistory(id);
            return ResponseEntity.ok(history);
        } catch (IllegalArgumentException e) {
            log.error("Error fetching blockchain history: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Sensor Data API is running");
    }

    // Inner classes for request/response bodies

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class VerifyRequest {
        @jakarta.validation.constraints.NotBlank(message = "Raw data is required for verification")
        private String rawData;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class VerifyResponse {
        private Long id;
        private boolean isValid;
        private String message;
    }
}
