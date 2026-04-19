package com.iot.bc_api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO for sensor data response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorDataResponse {

    private Long id;
    private String deviceId;
    private String rawData;
    private String hash;
    private LocalDateTime createdAt;
}
