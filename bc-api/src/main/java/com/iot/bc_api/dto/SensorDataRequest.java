package com.iot.bc_api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating/receiving sensor data requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorDataRequest {

    @NotBlank(message = "Device ID is required")
    private String deviceId;

    @NotBlank(message = "Raw data is required")
    private String rawData;
}
