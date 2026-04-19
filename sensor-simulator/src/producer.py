"""
IoT Sensor Data Producer

Main application that generates sensor data and publishes it to MQTT broker.
Runs continuously, publishing data at configured intervals.
"""

import time
import signal
import sys
import logging
from pathlib import Path
from typing import Optional

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from config import config
from models import SensorData
from logger_setup import setup_logging, get_logger
from mqtt_publisher import MQTTPublisher
from sensor_generator import SensorDataGenerator


class SensorDataProducer:
    """
    Main application class that orchestrates sensor data generation and publishing.
    
    Manages the lifecycle of the sensor simulator, including initialization,
    continuous data generation and publishing, metrics tracking, and graceful shutdown.
    """
    
    def __init__(self):
        """Initialize the sensor data producer"""
        self.logger = setup_logging(config.app)
        self.publisher: Optional[MQTTPublisher] = None
        self.generator: Optional[SensorDataGenerator] = None
        self.running = False
        self.published_count = 0
        
        self.logger.info("🚀 IoT Sensor Data Producer Initializing...")
        self._log_configuration()
    
    def _log_configuration(self):
        """Log the current configuration"""
        config_dict = config.to_dict()
        self.logger.info("📋 Configuration:")
        for key, value in config_dict.items():
            self.logger.info(f"   {key}: {value}")
    
    def initialize(self) -> bool:
        """
        Initialize publisher and generator.
        
        Returns:
            bool: True if initialization successful, False otherwise
        """
        try:
            self.logger.info("🔌 Initializing MQTT Publisher...")
            self.publisher = MQTTPublisher(config.mqtt, get_logger("mqtt_publisher"))
            
            if not self.publisher.connect():
                self.logger.error("❌ Failed to connect to MQTT broker")
                return False
            
            # Wait for connection to establish
            time.sleep(1)
            
            self.logger.info("🔬 Initializing Sensor Data Generator...")
            self.generator = SensorDataGenerator(config.sensor, get_logger("sensor_generator"))
            
            self.logger.info("✅ Producer initialized successfully")
            return True
        except Exception as e:
            self.logger.error(f"❌ Initialization failed: {str(e)}", exc_info=True)
            return False
    
    def _setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown"""
        def signal_handler(sig, frame):
            self.logger.info("\n⚠️ Shutdown signal received (Ctrl+C)")
            self.running = False
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    def run(self):
        """
        Main run loop that generates and publishes sensor data.
        
        Continuously publishes sensor data at configured intervals until
        interrupted by user or timeout is reached.
        """
        if not self.initialize():
            self.logger.error("❌ Failed to initialize producer")
            return
        
        self._setup_signal_handlers()
        self.running = True
        start_time = time.time()
        
        self.logger.info("▶️ Starting sensor data publishing loop...")
        self.logger.info(f"Publishing every {config.sensor.publish_interval}s")
        
        try:
            while self.running:
                elapsed_time = time.time() - start_time
                
                # Check maximum duration
                if config.app.max_duration > 0 and elapsed_time >= config.app.max_duration:
                    self.logger.info(f"⏱️ Max duration ({config.app.max_duration}s) reached")
                    break
                
                try:
                    # Generate and publish data
                    batch = self.generator.generate_batch()
                    
                    for sensor_data in batch:
                        topic = f"{config.sensor.topic_base}/{sensor_data.device_id}"
                        success = self.publisher.publish_sensor_data(sensor_data, topic)
                        
                        if success:
                            self.published_count += 1
                            self.logger.info(
                                f"📤 [{self.published_count}] Published: "
                                f"{sensor_data.device_id} | "
                                f"Temp: {sensor_data.temperature}°C | "
                                f"Humidity: {sensor_data.humidity}%"
                            )
                    
                    # Sleep before next batch
                    time.sleep(config.sensor.publish_interval)
                
                except Exception as e:
                    self.logger.error(f"❌ Error in publish loop: {str(e)}", exc_info=True)
                    time.sleep(1)  # Brief pause before retry
        
        except Exception as e:
            self.logger.error(f"❌ Critical error in run loop: {str(e)}", exc_info=True)
        
        finally:
            self.shutdown()
    
    def shutdown(self):
        """Gracefully shutdown the producer"""
        self.logger.info("🛑 Shutting down...")
        self.running = False
        
        # Log final metrics
        if self.publisher:
            self.logger.info("📊 Final Publishing Metrics:")
            self.publisher.log_metrics()
            time.sleep(0.5)  # Allow messages to send
            self.publisher.disconnect()
        
        self.logger.info(f"✅ Shutdown complete. Total published: {self.published_count}")
    
    def print_status(self):
        """Print current status"""
        if not self.publisher or not self.generator:
            self.logger.warning("Producer not initialized")
            return
        
        self.logger.info("📊 Current Status:")
        self.logger.info(f"   Published Messages: {self.published_count}")
        self.logger.info(f"   Metrics: {self.publisher.get_metrics()}")
        self.logger.info(f"   Sensor States: {self.generator.get_current_state()}")


def main():
    """Main entry point"""
    producer = SensorDataProducer()
    producer.run()


if __name__ == "__main__":
    main()
