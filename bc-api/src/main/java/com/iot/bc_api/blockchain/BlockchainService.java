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

    public void storeHash(String hash) {
        if (!properties.isEnabled()) {
            return;
        }
        FabricGatewayClient client = gatewayProvider.getIfAvailable();
        if (client == null) {
            throw new IllegalStateException("Fabric gateway not available");
        }
        try {
            client.getContract().submitTransaction("StoreHash", hash);
            log.info("Blockchain StoreHash success. Hash: {}", hash);
        } catch (Exception e) {
            throw new IllegalStateException("Blockchain StoreHash failed: " + e.getMessage(), e);
        }
    }

    public boolean verifyHash(String hash) {
        if (!properties.isEnabled()) {
            return false;
        }
        FabricGatewayClient client = gatewayProvider.getIfAvailable();
        if (client == null) {
            throw new IllegalStateException("Fabric gateway not available");
        }
        try {
            byte[] response = client.getContract().evaluateTransaction("VerifyHash", hash);
            return Boolean.parseBoolean(new String(response));
        } catch (Exception e) {
            throw new IllegalStateException("Blockchain VerifyHash failed: " + e.getMessage(), e);
        }
    }
}
