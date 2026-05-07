package com.iot.bc_api.blockchain;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iot.bc_api.dto.BlockchainSensorHistoryEntry;
import com.iot.bc_api.dto.BlockchainSensorRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlockchainService {

    private final BlockchainProperties properties;
    private final org.springframework.beans.factory.ObjectProvider<FabricGatewayClient> gatewayProvider;
    private final ObjectMapper objectMapper;

    public void storeSensorData(String deviceId, String rawData, String timestamp) {
        if (!properties.isEnabled()) {
            return;
        }
        FabricGatewayClient client = gatewayProvider.getIfAvailable();
        if (client == null) {
            throw new IllegalStateException("Fabric gateway not available");
        }
        try {
            client.getContract().submitTransaction("StoreSensorData", deviceId, rawData, timestamp);
            log.info("Blockchain StoreSensorData success. Device: {}, Timestamp: {}", deviceId, timestamp);
        } catch (Exception e) {
            throw new IllegalStateException("Blockchain StoreSensorData failed: " + e.getMessage(), e);
        }
    }

    public boolean verifySensorData(String deviceId, String rawData, String timestamp) {
        if (!properties.isEnabled()) {
            return false;
        }
        FabricGatewayClient client = gatewayProvider.getIfAvailable();
        if (client == null) {
            throw new IllegalStateException("Fabric gateway not available");
        }
        try {
            byte[] response = client.getContract().evaluateTransaction(
                    "VerifySensorData",
                    deviceId,
                    rawData,
                    timestamp
            );
            return Boolean.parseBoolean(new String(response));
        } catch (Exception e) {
            throw new IllegalStateException("Blockchain VerifySensorData failed: " + e.getMessage(), e);
        }
    }

    public BlockchainSensorRecord getSensorRecord(String deviceId, String rawData, String timestamp) {
        if (!properties.isEnabled()) {
            return null;
        }
        FabricGatewayClient client = gatewayProvider.getIfAvailable();
        if (client == null) {
            throw new IllegalStateException("Fabric gateway not available");
        }
        try {
            byte[] response = client.getContract().evaluateTransaction(
                    "GetSensorRecord",
                    deviceId,
                    rawData,
                    timestamp
            );
            return objectMapper.readValue(response, BlockchainSensorRecord.class);
        } catch (Exception e) {
            throw new IllegalStateException("Blockchain GetSensorRecord failed: " + e.getMessage(), e);
        }
    }

    public List<BlockchainSensorHistoryEntry> getSensorHistory(String deviceId, String rawData, String timestamp) {
        if (!properties.isEnabled()) {
            return List.of();
        }
        FabricGatewayClient client = gatewayProvider.getIfAvailable();
        if (client == null) {
            throw new IllegalStateException("Fabric gateway not available");
        }
        try {
            byte[] response = client.getContract().evaluateTransaction(
                    "GetSensorHistory",
                    deviceId,
                    rawData,
                    timestamp
            );
            return objectMapper.readValue(response, new TypeReference<List<BlockchainSensorHistoryEntry>>() {});
        } catch (Exception e) {
            throw new IllegalStateException("Blockchain GetSensorHistory failed: " + e.getMessage(), e);
        }
    }
}
