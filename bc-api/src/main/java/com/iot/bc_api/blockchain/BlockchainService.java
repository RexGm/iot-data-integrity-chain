package com.iot.bc_api.blockchain;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlockchainService {

    private final BlockchainProperties properties;
    private final org.springframework.beans.factory.ObjectProvider<FabricGatewayClient> gatewayProvider;

    public void storeSensorHash(String deviceId, String hash, String timestamp) {
        if (!properties.isEnabled()) {
            return;
        }
        FabricGatewayClient client = gatewayProvider.getIfAvailable();
        if (client == null) {
            throw new IllegalStateException("Fabric gateway not available");
        }
        try {
            client.getContract().submitTransaction("StoreSensorHash", deviceId, hash, timestamp);
            log.info("Blockchain StoreSensorHash success. Device: {}, Timestamp: {}", deviceId, timestamp);
        } catch (Exception e) {
            throw new IllegalStateException("Blockchain StoreSensorHash failed: " + e.getMessage(), e);
        }
    }

    public boolean verifySensorData(String deviceId, String hash, String timestamp) {
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
                    hash,
                    timestamp
            );
            return Boolean.parseBoolean(new String(response));
        } catch (Exception e) {
            throw new IllegalStateException("Blockchain VerifySensorData failed: " + e.getMessage(), e);
        }
    }
}
