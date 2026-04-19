"""
Configuration module for IoT Sensor Simulator

Handles all configuration settings for MQTT broker, sensor devices,
and application parameters.
"""

import os
from dataclasses import dataclass
from typing import List


@dataclass
class MQTTConfig:
    """MQTT Broker Configuration"""
    broker_host: str = os.getenv("MQTT_BROKER_HOST", "localhost")
    broker_port: int = int(os.getenv("MQTT_BROKER_PORT", "1883"))
    client_id: str = "iot-sensor-simulator"
    keepalive: int = 60
    
    def __post_init__(self):
        """Validate configuration after initialization"""
        if not self.broker_host:
            raise ValueError("MQTT_BROKER_HOST is required")
        if self.broker_port <= 0 or self.broker_port > 65535:
            raise ValueError(f"Invalid MQTT_BROKER_PORT: {self.broker_port}")


@dataclass
class SensorConfig:
    """Sensor Simulation Configuration"""
    # Device IDs
    device_ids: List[str] = None
    
    # Temperature settings (Celsius)
    temp_min: float = 15.0
    temp_max: float = 35.0
    temp_step: float = 0.5
    
    # Humidity settings (Percentage)
    humidity_min: float = 30.0
    humidity_max: float = 90.0
    humidity_step: float = 2.0
    
    # Publishing interval (seconds)
    publish_interval: int = 5
    
    # MQTT Topic
    topic_base: str = "iot/sensors"
    
    def __post_init__(self):
        """Validate and initialize sensor configuration"""
        if self.device_ids is None:
            self.device_ids = [f"sensor-{i:03d}" for i in range(1, 6)]
        
        if self.temp_min >= self.temp_max:
            raise ValueError("temp_min must be less than temp_max")
        if self.humidity_min >= self.humidity_max:
            raise ValueError("humidity_min must be less than humidity_max")
        if self.publish_interval <= 0:
            raise ValueError("publish_interval must be positive")


@dataclass
class AppConfig:
    """Application Configuration"""
    # Run mode
    mode: str = os.getenv("APP_MODE", "development")  # development, production
    
    # Debug mode
    debug: bool = os.getenv("APP_DEBUG", "True").lower() in ("true", "1", "yes")
    
    # Log level
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Maximum runtime (seconds, 0 = infinite)
    max_duration: int = int(os.getenv("MAX_DURATION", "0"))
    
    # Graceful shutdown timeout
    shutdown_timeout: int = 10
    

class Config:
    """Main Configuration Container"""
    
    def __init__(self):
        self.mqtt = MQTTConfig()
        self.sensor = SensorConfig(
            device_ids=os.getenv("DEVICE_IDS", "sensor-001,sensor-002,sensor-003").split(","),
            temp_min=float(os.getenv("TEMP_MIN", "15.0")),
            temp_max=float(os.getenv("TEMP_MAX", "35.0")),
            humidity_min=float(os.getenv("HUMIDITY_MIN", "30.0")),
            humidity_max=float(os.getenv("HUMIDITY_MAX", "90.0")),
            publish_interval=int(os.getenv("PUBLISH_INTERVAL", "5"))
        )
        self.app = AppConfig()
    
    def to_dict(self) -> dict:
        """Convert configuration to dictionary for logging"""
        return {
            "mqtt": {
                "broker_host": self.mqtt.broker_host,
                "broker_port": self.mqtt.broker_port,
                "client_id": self.mqtt.client_id,
            },
            "sensor": {
                "device_ids": self.sensor.device_ids,
                "temp_range": f"{self.sensor.temp_min}°C - {self.sensor.temp_max}°C",
                "humidity_range": f"{self.sensor.humidity_min}% - {self.sensor.humidity_max}%",
                "publish_interval": f"{self.sensor.publish_interval}s",
            },
            "app": {
                "mode": self.app.mode,
                "debug": self.app.debug,
                "log_level": self.app.log_level,
            }
        }


# Global configuration instance
config = Config()
