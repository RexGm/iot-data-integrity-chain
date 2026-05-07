package com.iot.bc_api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockchainSensorHistoryEntry {

    private String txId;
    private String timestamp;
    private boolean isDelete;
    private BlockchainSensorRecord record;
}
