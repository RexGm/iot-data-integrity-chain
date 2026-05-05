package com.iot.bc_api.blockchain;

import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.client.Contract;
import org.hyperledger.fabric.client.Gateway;
import org.hyperledger.fabric.client.GrpcClient;
import org.hyperledger.fabric.client.identity.Identities;
import org.hyperledger.fabric.client.identity.Identity;
import org.hyperledger.fabric.client.identity.Signer;
import org.hyperledger.fabric.client.identity.Signers;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
@ConditionalOnProperty(prefix = "blockchain", name = "enabled", havingValue = "true")
@Slf4j
public class FabricGatewayClient implements AutoCloseable {

    private final BlockchainProperties properties;
    private final ManagedChannel channel;
    private final Gateway gateway;
    private final Contract contract;

    public FabricGatewayClient(BlockchainProperties properties) throws IOException {
        this.properties = properties;

        Identity identity = Identities.newX509Identity(
                properties.getMspId(),
                Identities.readX509Certificate(Files.newBufferedReader(Path.of(properties.getCertPath())))
        );

        Signer signer = Signers.newPrivateKeySigner(
                Identities.readPrivateKey(Files.newBufferedReader(Path.of(properties.getKeyPath())))
        );

        ManagedChannelBuilder<?> channelBuilder = ManagedChannelBuilder.forTarget(properties.getPeerEndpoint());
        if (!properties.isTlsEnabled()) {
            channelBuilder.usePlaintext();
        }
        this.channel = channelBuilder.build();

        this.gateway = Gateway.newInstance()
                .identity(identity)
                .signer(signer)
                .connection(GrpcClient.newConnection(channel))
                .connect();

        this.contract = gateway.getNetwork(properties.getChannel()).getContract(properties.getChaincode());
        log.info("Fabric Gateway connected. Channel: {}, Chaincode: {}",
                properties.getChannel(), properties.getChaincode());
    }

    public Contract getContract() {
        return contract;
    }

    @Override
    public void close() {
        try {
            gateway.close();
        } catch (Exception e) {
            log.warn("Error closing gateway: {}", e.getMessage());
        }
        channel.shutdown();
    }
}
