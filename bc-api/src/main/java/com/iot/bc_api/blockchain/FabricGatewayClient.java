package com.iot.bc_api.blockchain;

import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.client.Contract;
import org.hyperledger.fabric.client.Gateway;
import org.hyperledger.fabric.client.identity.Identities;
import org.hyperledger.fabric.client.identity.Identity;
import org.hyperledger.fabric.client.identity.Signer;
import org.hyperledger.fabric.client.identity.Signers;
import org.hyperledger.fabric.client.identity.X509Identity;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import io.grpc.ChannelCredentials;
import io.grpc.Grpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.TlsChannelCredentials;

import java.io.IOException;
import java.io.File;
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

            Identity identity;
            Signer signer;
            try {
                identity = new X509Identity(
                        properties.getMspId(),
                        Identities.readX509Certificate(Files.newBufferedReader(Path.of(properties.getCertPath())))
                );

                signer = Signers.newPrivateKeySigner(
                        Identities.readPrivateKey(Files.newBufferedReader(Path.of(properties.getKeyPath())))
                );
            } catch (java.security.cert.CertificateException | java.security.InvalidKeyException e) {
                throw new IllegalStateException("Failed to load blockchain identity material", e);
            }

        String[] endpointParts = properties.getPeerEndpoint().split(":", 2);
        String endpointHost = endpointParts[0];
        int endpointPort = Integer.parseInt(endpointParts[1]);

        ManagedChannelBuilder<?> channelBuilder;
        if (properties.isTlsEnabled()) {
            String tlsCertPath = properties.getTlsCertPath();
            if (tlsCertPath == null || tlsCertPath.isBlank()) {
                throw new IllegalStateException("Blockchain TLS is enabled but tlsCertPath is not set");
            }
                ChannelCredentials credentials = TlsChannelCredentials.newBuilder()
                    .trustManager(new File(tlsCertPath))
                    .build();
            channelBuilder = Grpc.newChannelBuilderForAddress(endpointHost, endpointPort, credentials)
                    .overrideAuthority(properties.getPeerHostAlias());
        } else {
            channelBuilder = ManagedChannelBuilder.forAddress(endpointHost, endpointPort)
                    .usePlaintext();
        }
        this.channel = channelBuilder.build();

        this.gateway = Gateway.newInstance()
                .identity(identity)
                .signer(signer)
            .connection(channel)
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
