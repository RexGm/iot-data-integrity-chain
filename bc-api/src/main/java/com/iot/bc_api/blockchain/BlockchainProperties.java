package com.iot.bc_api.blockchain;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "blockchain")
public class BlockchainProperties {

    private boolean enabled = false;
    private String channel = "mychannel";
    private String chaincode = "sensor-contract";
    private String mspId = "Org1MSP";
    private String certPath;
    private String keyPath;
    private String peerEndpoint = "localhost:7051";
    private String peerHostAlias = "peer0.org1.example.com";
    private boolean tlsEnabled = false;
    private String tlsCertPath;
}
