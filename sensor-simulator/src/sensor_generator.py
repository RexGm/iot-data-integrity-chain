"""
Sensor data generator module

Generates realistic sensor readings with controlled variations to simulate
actual IoT sensor behavior.
"""

import random
import logging
from datetime import datetime
from typing import List
from models import SensorData
from config import SensorConfig


class SensorDataGenerator:
    """
    Generates simulated sensor readings with realistic temperature and
    humidity values based on configuration parameters.
    """
    
    def __init__(self, config: SensorConfig, logger: logging.Logger):
        """
        Initialize sensor data generator.
        
        Args:
            config (SensorConfig): Sensor configuration
            logger (logging.Logger): Logger instance
        """
        self.config = config
        self.logger = logger
        
        # State for smooth value transitions
        self.current_temps: dict = {
            device_id: random.uniform(config.temp_min, config.temp_max)
            for device_id in config.device_ids
        }
        self.current_humidities: dict = {
            device_id: random.uniform(config.humidity_min, config.humidity_max)
            for device_id in config.device_ids
        }
        
        self.logger.info(f"🔬 Sensor Data Generator initialized with {len(config.device_ids)} devices")
    
    def _apply_variation(self, current_value: float, min_val: float, max_val: float, step: float) -> float:
        """
        Apply realistic variation to sensor value.
        
        Creates natural value transitions by applying small random changes
        instead of completely random values, making data more realistic.
        
        Args:
            current_value (float): Current sensor value
            min_val (float): Minimum allowed value
            max_val (float): Maximum allowed value
            step (float): Maximum step size for variation
            
        Returns:
            float: New sensor value
        """
        # Random direction and magnitude
        change = random.uniform(-step, step)
        new_value = current_value + change
        
        # Ensure within bounds
        return max(min_val, min(max_val, new_value))
    
    def generate_sensor_data(self, device_id: str) -> SensorData:
        """
        Generate a single sensor reading.
        
        Args:
            device_id (str): Device identifier
            
        Returns:
            SensorData: Generated sensor data
            
        Raises:
            ValueError: If device_id is not in configured devices
        """
        if device_id not in self.config.device_ids:
            raise ValueError(f"Unknown device_id: {device_id}")
        
        # Apply variations to create smooth transitions
        self.current_temps[device_id] = self._apply_variation(
            self.current_temps[device_id],
            self.config.temp_min,
            self.config.temp_max,
            self.config.temp_step
        )
        
        self.current_humidities[device_id] = self._apply_variation(
            self.current_humidities[device_id],
            self.config.humidity_min,
            self.config.humidity_max,
            self.config.humidity_step
        )
        
        # Round to reasonable precision
        temp = round(self.current_temps[device_id], 1)
        humidity = round(self.current_humidities[device_id], 1)
        
        sensor_data = SensorData(
            device_id=device_id,
            temperature=temp,
            humidity=humidity,
            timestamp=datetime.now()
        )
        
        self.logger.debug(f"Generated: {sensor_data}")
        return sensor_data
    
    def generate_batch(self) -> List[SensorData]:
        """
        Generate readings for all configured devices.
        
        Returns:
            List[SensorData]: List of sensor data for all devices
        """
        batch = []
        for device_id in self.config.device_ids:
            try:
                sensor_data = self.generate_sensor_data(device_id)
                batch.append(sensor_data)
            except Exception as e:
                self.logger.error(f"Error generating data for {device_id}: {str(e)}")
        
        self.logger.debug(f"Generated batch of {len(batch)} readings")
        return batch
    
    def get_current_state(self) -> dict:
        """
        Get current state of all sensors.
        
        Returns:
            dict: Current temperature and humidity for each device
        """
        return {
            device_id: {
                "temperature": round(self.current_temps[device_id], 1),
                "humidity": round(self.current_humidities[device_id], 1)
            }
            for device_id in self.config.device_ids
        }
    
    def reset_device(self, device_id: str):
        """
        Reset a device to random initial state.
        
        Args:
            device_id (str): Device identifier
        """
        if device_id not in self.config.device_ids:
            raise ValueError(f"Unknown device_id: {device_id}")
        
        self.current_temps[device_id] = random.uniform(
            self.config.temp_min,
            self.config.temp_max
        )
        self.current_humidities[device_id] = random.uniform(
            self.config.humidity_min,
            self.config.humidity_max
        )
        self.logger.info(f"Reset device {device_id} to initial state")
    
    def reset_all(self):
        """Reset all devices to random initial state"""
        for device_id in self.config.device_ids:
            self.reset_device(device_id)
        self.logger.info("Reset all devices to initial state")
