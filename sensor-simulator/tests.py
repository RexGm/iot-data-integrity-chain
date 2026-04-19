"""
Unit tests for sensor simulator components

Tests sensor data generation, MQTT publishing, and configuration.
"""

import unittest
import sys
from datetime import datetime
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from models import SensorData, PublishMetrics
from config import MQTTConfig, SensorConfig, AppConfig


class TestSensorData(unittest.TestCase):
    """Tests for SensorData model"""
    
    def test_sensor_data_creation(self):
        """Test creating valid sensor data"""
        data = SensorData(
            device_id="sensor-001",
            temperature=23.5,
            humidity=65.2
        )
        
        self.assertEqual(data.device_id, "sensor-001")
        self.assertEqual(data.temperature, 23.5)
        self.assertEqual(data.humidity, 65.2)
        self.assertIsNotNone(data.timestamp)
    
    def test_sensor_data_validation(self):
        """Test sensor data validation"""
        data = SensorData("sensor-001", 23.5, 65.2)
        self.assertTrue(data.validate())
    
    def test_invalid_humidity(self):
        """Test humidity out of range"""
        with self.assertRaises(ValueError):
            SensorData("sensor-001", 23.5, 150)  # > 100%
    
    def test_invalid_device_id(self):
        """Test invalid device ID"""
        with self.assertRaises(ValueError):
            SensorData("", 23.5, 65.2)  # Empty
    
    def test_to_dict(self):
        """Test dict conversion"""
        data = SensorData("sensor-001", 23.5, 65.2)
        data_dict = data.to_dict()
        
        self.assertEqual(data_dict["device_id"], "sensor-001")
        self.assertEqual(data_dict["temperature"], 23.5)
        self.assertEqual(data_dict["humidity"], 65.2)
        self.assertIn("timestamp", data_dict)
    
    def test_to_json(self):
        """Test JSON serialization"""
        data = SensorData("sensor-001", 23.5, 65.2)
        json_str = data.to_json()
        
        self.assertIn("sensor-001", json_str)
        self.assertIn("23.5", json_str)
        self.assertIn("65.2", json_str)
    
    def test_to_compact_json(self):
        """Test compact JSON (single line)"""
        data = SensorData("sensor-001", 23.5, 65.2)
        json_str = data.to_compact_json()
        
        self.assertNotIn("\n", json_str)
        self.assertIn("sensor-001", json_str)


class TestPublishMetrics(unittest.TestCase):
    """Tests for PublishMetrics model"""
    
    def test_metrics_creation(self):
        """Test creating metrics"""
        metrics = PublishMetrics()
        
        self.assertEqual(metrics.total_published, 0)
        self.assertEqual(metrics.total_failed, 0)
        self.assertIsNone(metrics.last_publish_time)
    
    def test_record_success(self):
        """Test recording successful publish"""
        metrics = PublishMetrics()
        metrics.record_success()
        
        self.assertEqual(metrics.total_published, 1)
        self.assertIsNotNone(metrics.last_publish_time)
    
    def test_record_failure(self):
        """Test recording failed publish"""
        metrics = PublishMetrics()
        metrics.record_failure("Test error")
        
        self.assertEqual(metrics.total_failed, 1)
        self.assertEqual(metrics.last_error, "Test error")
    
    def test_success_rate(self):
        """Test success rate calculation"""
        metrics = PublishMetrics()
        
        # 5 successes, 0 failures = 100%
        for _ in range(5):
            metrics.record_success()
        
        result = metrics.to_dict()
        self.assertEqual(result["success_rate"], 100.0)
        
        # Add 5 failures = 50%
        for _ in range(5):
            metrics.record_failure("Error")
        
        result = metrics.to_dict()
        self.assertEqual(result["success_rate"], 50.0)


class TestMQTTConfig(unittest.TestCase):
    """Tests for MQTT configuration"""
    
    def test_mqtt_config_creation(self):
        """Test MQTT config creation"""
        config = MQTTConfig(
            broker_host="localhost",
            broker_port=1883
        )
        
        self.assertEqual(config.broker_host, "localhost")
        self.assertEqual(config.broker_port, 1883)
    
    def test_invalid_port(self):
        """Test invalid port validation"""
        with self.assertRaises(ValueError):
            MQTTConfig(broker_host="localhost", broker_port=-1)
    
    def test_port_too_high(self):
        """Test port > 65535"""
        with self.assertRaises(ValueError):
            MQTTConfig(broker_host="localhost", broker_port=99999)


class TestSensorConfig(unittest.TestCase):
    """Tests for Sensor configuration"""
    
    def test_sensor_config_creation(self):
        """Test sensor config creation"""
        config = SensorConfig(
            device_ids=["sensor-001", "sensor-002"],
            temp_min=15.0,
            temp_max=35.0
        )
        
        self.assertEqual(len(config.device_ids), 2)
        self.assertEqual(config.temp_min, 15.0)
        self.assertEqual(config.temp_max, 35.0)
    
    def test_default_device_ids(self):
        """Test default device ID generation"""
        config = SensorConfig()
        
        self.assertEqual(len(config.device_ids), 5)
        self.assertTrue(config.device_ids[0].startswith("sensor-"))
    
    def test_invalid_temp_range(self):
        """Test invalid temperature range"""
        with self.assertRaises(ValueError):
            SensorConfig(temp_min=35.0, temp_max=15.0)
    
    def test_invalid_publish_interval(self):
        """Test invalid publish interval"""
        with self.assertRaises(ValueError):
            SensorConfig(publish_interval=0)


class TestAppConfig(unittest.TestCase):
    """Tests for Application configuration"""
    
    def test_app_config_creation(self):
        """Test app config creation"""
        config = AppConfig()
        
        self.assertIsNotNone(config.mode)
        self.assertIsNotNone(config.log_level)


class TestConfiguration(unittest.TestCase):
    """Integration tests for configuration"""
    
    def test_config_to_dict(self):
        """Test configuration serialization"""
        from config import config
        
        config_dict = config.to_dict()
        
        self.assertIn("mqtt", config_dict)
        self.assertIn("sensor", config_dict)
        self.assertIn("app", config_dict)
    
    def test_config_validity(self):
        """Test overall configuration validity"""
        from config import config
        
        # Should not raise any exceptions
        self.assertIsNotNone(config.mqtt.broker_host)
        self.assertGreater(config.mqtt.broker_port, 0)
        self.assertGreater(len(config.sensor.device_ids), 0)
        self.assertGreater(config.sensor.publish_interval, 0)


# Run tests
if __name__ == "__main__":
    unittest.main()
