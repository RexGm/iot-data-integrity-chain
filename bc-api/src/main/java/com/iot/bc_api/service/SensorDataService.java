package com.iot.bc_api.service;

import com.iot.bc_api.dto.SensorDataRequest;
import com.iot.bc_api.dto.SensorDataResponse;
import com.iot.bc_api.entity.SensorData;
import com.iot.bc_api.repository.SensorDataRepository;
import com.iot.bc_api.util.HashUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SensorDataService {

    private final SensorDataRepository sensorDataRepository;
    private final com.iot.bc_api.blockchain.BlockchainService blockchainService;

    /**
     * Save sensor data with SHA-256 hash
     *
     * @param request Sensor data request containing deviceId and rawData
     * @return Saved sensor data response
     * @throws IllegalArgumentException if hash already exists (duplicate data)
     */
    @Transactional
    public SensorDataResponse saveSensorData(SensorDataRequest request) {
        log.info("Saving sensor data for device: {}", request.getDeviceId());

        // Generate SHA-256 hash from raw data
        String hash = HashUtil.generateSHA256(request.getRawData());
        log.debug("Generated hash: {} for device: {}", hash, request.getDeviceId());

        // Check if data with this hash already exists (prevent duplicates)
        if (sensorDataRepository.existsByHash(hash)) {
            log.warn("Duplicate sensor data detected for device: {} with hash: {}", 
                    request.getDeviceId(), hash);
            throw new IllegalArgumentException("Sensor data with this hash already exists");
        }

        LocalDateTime createdAt = LocalDateTime.now();
        String timestamp = formatTimestamp(createdAt);

        // Store hash in blockchain first (fail-fast if blockchain is unavailable)
        blockchainService.storeSensorHash(request.getDeviceId(), hash, timestamp);

        // Create and save sensor data
        SensorData sensorData = SensorData.builder()
                .deviceId(request.getDeviceId())
                .rawData(request.getRawData())
                .hash(hash)
            .createdAt(createdAt)
                .build();

        SensorData savedData = sensorDataRepository.save(sensorData);
        log.info("Sensor data saved successfully with id: {} for device: {}", 
                savedData.getId(), savedData.getDeviceId());

        return mapToResponse(savedData);
    }

    /**
     * Get all sensor data
     *
     * @return List of sensor data responses
     */
    @Transactional(readOnly = true)
    public List<SensorDataResponse> getAllSensorData() {
        log.info("Fetching all sensor data");
        return sensorDataRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get sensor data by ID
     *
     * @param id Sensor data ID
     * @return Sensor data response, or throw exception if not found
     */
    @Transactional(readOnly = true)
    public SensorDataResponse getSensorDataById(Long id) {
        log.info("Fetching sensor data with id: {}", id);
        SensorData sensorData = sensorDataRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Sensor data not found with id: {}", id);
                    return new IllegalArgumentException("Sensor data not found with id: " + id);
                });
        return mapToResponse(sensorData);
    }

    /**
     * Get sensor data by device ID
     *
     * @param deviceId Device identifier
     * @return List of sensor data responses for the device
     */
    @Transactional(readOnly = true)
    public List<SensorDataResponse> getSensorDataByDeviceId(String deviceId) {
        log.info("Fetching sensor data for device: {}", deviceId);
        return sensorDataRepository.findByDeviceId(deviceId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Verify data integrity by comparing hash
     *
     * @param id Sensor data ID
     * @param rawData Raw data to verify
     * @return true if hash matches, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean verifyDataIntegrity(Long id, String rawData) {
        log.info("Verifying data integrity for id: {}", id);
        SensorData sensorData = sensorDataRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sensor data not found with id: " + id));

        String calculatedHash = HashUtil.generateSHA256(rawData);
        boolean isValid = sensorData.getHash().equals(calculatedHash);

        if (!isValid) {
            log.warn("Data integrity check failed for id: {}. Expected: {}, Got: {}", 
                    id, sensorData.getHash(), calculatedHash);
        } else {
            log.debug("Data integrity verified for id: {}", id);
        }

        return isValid;
    }

    /**
     * Verify data integrity against blockchain
     *
     * @param id Sensor data ID
     * @param rawData Raw data to verify
     * @return true if blockchain hash matches, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean verifyBlockchainIntegrity(Long id, String rawData) {
        log.info("Verifying blockchain integrity for id: {}", id);
        SensorData sensorData = sensorDataRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sensor data not found with id: " + id));

        String calculatedHash = HashUtil.generateSHA256(rawData);
        String timestamp = formatTimestamp(sensorData.getCreatedAt());
        boolean isValid = blockchainService.verifySensorData(
                sensorData.getDeviceId(),
                calculatedHash,
                timestamp
        );

        if (!isValid) {
            log.warn("Blockchain integrity check failed for id: {}", id);
        } else {
            log.debug("Blockchain integrity verified for id: {}", id);
        }

        return isValid;
    }

    /**
     * Verify data integrity using stored raw data
     *
     * @param id Sensor data ID
     * @return true if stored raw data matches stored hash, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean verifyLocalIntegrity(Long id) {
        log.info("Verifying local integrity for id: {}", id);
        SensorData sensorData = sensorDataRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sensor data not found with id: " + id));

        String calculatedHash = HashUtil.generateSHA256(sensorData.getRawData());
        boolean isValid = sensorData.getHash().equals(calculatedHash);

        if (!isValid) {
            log.warn("Local integrity check failed for id: {}. Expected: {}, Got: {}",
                    id, sensorData.getHash(), calculatedHash);
        } else {
            log.debug("Local integrity verified for id: {}", id);
        }

        return isValid;
    }

    /**
     * Map SensorData entity to SensorDataResponse DTO
     */
    private SensorDataResponse mapToResponse(SensorData sensorData) {
        return SensorDataResponse.builder()
                .id(sensorData.getId())
                .deviceId(sensorData.getDeviceId())
                .rawData(sensorData.getRawData())
                .hash(sensorData.getHash())
                .createdAt(sensorData.getCreatedAt())
                .build();
    }

    private String formatTimestamp(LocalDateTime timestamp) {
        return timestamp.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
}
