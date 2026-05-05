package com.iot.bc_api.mqtt;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.iot.bc_api.dto.SensorDataRequest;
import com.iot.bc_api.service.SensorDataService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHandler;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class MqttSensorMessageHandler implements MessageHandler {

    private final SensorDataService sensorDataService;
    private final ObjectMapper objectMapper;

    public MqttSensorMessageHandler(SensorDataService sensorDataService) {
        this.sensorDataService = sensorDataService;
        this.objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Override
    public void handleMessage(Message<?> message) {
        String payload = message.getPayload().toString();
        String topic = String.valueOf(message.getHeaders().get(MqttHeaders.RECEIVED_TOPIC));

        try {
            JsonNode jsonNode = objectMapper.readTree(payload);
            JsonNode deviceIdNode = jsonNode.get("deviceId");
            if (deviceIdNode == null || deviceIdNode.asText().isBlank()) {
                deviceIdNode = jsonNode.get("device_id");
            }

            if (deviceIdNode == null || deviceIdNode.asText().isBlank()) {
                log.warn("MQTT message missing deviceId. Topic: {}, Payload: {}", topic, payload);
                return;
            }

            SensorDataRequest request = SensorDataRequest.builder()
                    .deviceId(deviceIdNode.asText())
                    .rawData(payload)
                    .build();

            sensorDataService.saveSensorData(request);
            log.info("MQTT -> DB saved. Topic: {}, Device: {}", topic, request.getDeviceId());
        } catch (Exception e) {
            log.error("Failed to process MQTT message. Topic: {}, Payload: {}, Error: {}",
                    topic, payload, e.getMessage(), e);
        }
    }
}
