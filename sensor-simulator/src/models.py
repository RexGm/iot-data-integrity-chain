"""
Data models for IoT sensor data

Defines the structure of sensor data and related models using dataclasses.
"""

import json
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Optional


@dataclass
class SensorData:
    """
    Represents a single sensor reading with temperature and humidity data.
    
    Attributes:
        device_id (str): Unique identifier for the sensor device
        temperature (float): Temperature reading in Celsius
        humidity (float): Humidity reading in percentage (0-100)
        timestamp (datetime): When the reading was taken
    """
    device_id: str
    temperature: float
    humidity: float
    timestamp: datetime = None
    
    def __post_init__(self):
        """Validate sensor data after initialization"""
        if self.timestamp is None:
            self.timestamp = datetime.now()
        
        if not isinstance(self.device_id, str) or not self.device_id.strip():
            raise ValueError("device_id must be a non-empty string")
        
        if not isinstance(self.temperature, (int, float)):
            raise ValueError("temperature must be a number")
        
        if not isinstance(self.humidity, (int, float)):
            raise ValueError("humidity must be a number")
        
        if not (0 <= self.humidity <= 100):
            raise ValueError("humidity must be between 0 and 100")
    
    def to_dict(self) -> dict:
        """
        Convert sensor data to dictionary.
        
        Returns:
            dict: Dictionary representation with ISO format timestamp
        """
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data
    
    def to_json(self) -> str:
        """
        Convert sensor data to JSON string.
        
        Returns:
            str: JSON string representation
        """
        return json.dumps(self.to_dict(), indent=2)
    
    def to_compact_json(self) -> str:
        """
        Convert sensor data to compact JSON (single line).
        
        Returns:
            str: Compact JSON string representation
        """
        return json.dumps(self.to_dict(), separators=(',', ':'))
    
    def validate(self) -> bool:
        """
        Validate sensor data consistency.
        
        Returns:
            bool: True if data is valid
        """
        try:
            if not (0 <= self.humidity <= 100):
                return False
            if not (-50 <= self.temperature <= 60):  # Reasonable range
                return False
            return True
        except (TypeError, ValueError):
            return False
    
    def __str__(self) -> str:
        """String representation of sensor data"""
        return (f"SensorData(device_id={self.device_id}, "
                f"temp={self.temperature}°C, "
                f"humidity={self.humidity}%, "
                f"timestamp={self.timestamp.isoformat()})")


@dataclass
class PublishMetrics:
    """
    Metrics for monitoring MQTT publishing operations.
    
    Attributes:
        total_published (int): Total messages successfully published
        total_failed (int): Total messages failed to publish
        last_publish_time (Optional[datetime]): Timestamp of last successful publish
        last_error (Optional[str]): Last error message if any
    """
    total_published: int = 0
    total_failed: int = 0
    last_publish_time: Optional[datetime] = None
    last_error: Optional[str] = None
    
    def record_success(self):
        """Record a successful publish"""
        self.total_published += 1
        self.last_publish_time = datetime.now()
    
    def record_failure(self, error: str):
        """Record a failed publish"""
        self.total_failed += 1
        self.last_error = error
    
    def to_dict(self) -> dict:
        """Convert metrics to dictionary"""
        return {
            "total_published": self.total_published,
            "total_failed": self.total_failed,
            "last_publish_time": self.last_publish_time.isoformat() if self.last_publish_time else None,
            "last_error": self.last_error,
            "success_rate": (
                self.total_published / (self.total_published + self.total_failed) * 100
                if (self.total_published + self.total_failed) > 0 else 0
            )
        }
    
    def __str__(self) -> str:
        """String representation of metrics"""
        success_rate = self.to_dict()["success_rate"]
        return (f"PublishMetrics(published={self.total_published}, "
                f"failed={self.total_failed}, "
                f"success_rate={success_rate:.1f}%)")
