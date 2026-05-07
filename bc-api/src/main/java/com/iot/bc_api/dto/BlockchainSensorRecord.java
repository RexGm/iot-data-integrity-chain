package com.iot.bc_api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockchainSensorRecord {

    private String deviceId;
    private String hash;
    private String timestamp;
}
