"""
MQTT Publisher module for IoT sensor data

Handles publishing sensor data to MQTT broker with proper connection
management, error handling, and reconnection logic.
"""

import logging
from typing import Callable, Optional
import paho.mqtt.client as mqtt
from models import SensorData, PublishMetrics
from config import MQTTConfig


class MQTTPublisher:
    """
    MQTT Publisher for sending sensor data to an MQTT broker.
    
    Manages connection lifecycle, handles reconnections, and provides
    methods for publishing sensor data with error handling.
    """
    
    def __init__(self, config: MQTTConfig, logger: logging.Logger):
        """
        Initialize MQTT Publisher.
        
        Args:
            config (MQTTConfig): MQTT configuration
            logger (logging.Logger): Logger instance
            
        Raises:
            ValueError: If configuration is invalid
        """
        self.config = config
        self.logger = logger
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1, client_id=config.client_id)
        self.is_connected = False
        self.metrics = PublishMetrics()
        self._setup_callbacks()
    
    def _setup_callbacks(self):
        """Setup MQTT client callbacks"""
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_publish = self._on_publish
        self.client.on_message = self._on_message
    
    def _on_connect(self, client, userdata, flags, rc):
        """
        Callback for when client connects to broker.
        
        Args:
            client: MQTT client instance
            userdata: User data
            flags: Connection flags
            rc (int): Connection return code
        """
        if rc == 0:
            self.is_connected = True
            self.logger.info(f"✅ Connected to MQTT broker at {self.config.broker_host}:{self.config.broker_port}")
        else:
            self.logger.error(f"❌ Failed to connect to MQTT broker - Return code: {rc}")
            self.is_connected = False
    
    def _on_disconnect(self, client, userdata, rc):
        """
        Callback for when client disconnects from broker.
        
        Args:
            client: MQTT client instance
            userdata: User data
            rc (int): Disconnect return code
        """
        self.is_connected = False
        if rc != 0:
            self.logger.warning(f"⚠️ Unexpected disconnection from MQTT broker - Return code: {rc}")
        else:
            self.logger.info("Disconnected from MQTT broker")
    
    def _on_publish(self, client, userdata, mid):
        """
        Callback for when message publish completes.
        
        Args:
            client: MQTT client instance
            userdata: User data
            mid (int): Message ID
        """
        self.logger.debug(f"Message published with ID: {mid}")
    
    def _on_message(self, client, userdata, msg):
        """
        Callback for when message is received.
        
        Args:
            client: MQTT client instance
            userdata: User data
            msg: Message object
        """
        self.logger.debug(f"Message received on topic {msg.topic}: {msg.payload.decode()}")
    
    def connect(self) -> bool:
        """
        Connect to MQTT broker.
        
        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            self.logger.info(f"Connecting to MQTT broker at {self.config.broker_host}:{self.config.broker_port}...")
            self.client.connect(
                self.config.broker_host,
                self.config.broker_port,
                keepalive=self.config.keepalive
            )
            self.client.loop_start()
            return True
        except Exception as e:
            error_msg = f"Failed to connect to MQTT broker: {str(e)}"
            self.logger.error(f"❌ {error_msg}")
            self.metrics.record_failure(error_msg)
            return False
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        try:
            self.logger.info("Disconnecting from MQTT broker...")
            self.client.loop_stop()
            self.client.disconnect()
            self.is_connected = False
            self.logger.info("Disconnected from MQTT broker")
        except Exception as e:
            self.logger.error(f"Error during disconnect: {str(e)}")
    
    def publish(self, topic: str, payload: str, qos: int = 1, retain: bool = False) -> bool:
        """
        Publish message to MQTT broker.
        
        Args:
            topic (str): MQTT topic
            payload (str): Message payload
            qos (int): Quality of service (0, 1, or 2)
            retain (bool): Whether to retain the message
            
        Returns:
            bool: True if publish successful, False otherwise
        """
        if not self.is_connected:
            error_msg = "MQTT broker not connected"
            self.logger.error(f"❌ {error_msg}")
            self.metrics.record_failure(error_msg)
            return False
        
        try:
            result = self.client.publish(topic, payload, qos=qos, retain=retain)
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                self.metrics.record_success()
                self.logger.debug(f"Published to topic: {topic}")
                return True
            else:
                error_msg = f"Publish failed with return code: {result.rc}"
                self.logger.error(f"❌ {error_msg}")
                self.metrics.record_failure(error_msg)
                return False
        except Exception as e:
            error_msg = f"Exception during publish: {str(e)}"
            self.logger.error(f"❌ {error_msg}")
            self.metrics.record_failure(error_msg)
            return False
    
    def publish_sensor_data(self, sensor_data: SensorData, topic: str = None) -> bool:
        """
        Publish sensor data to MQTT topic.
        
        Args:
            sensor_data (SensorData): Sensor data to publish
            topic (str): MQTT topic (if None, uses device_id)
            
        Returns:
            bool: True if publish successful, False otherwise
        """
        if topic is None:
            topic = f"iot/sensors/{sensor_data.device_id}"
        
        try:
            payload = sensor_data.to_compact_json()
            return self.publish(topic, payload, qos=1, retain=False)
        except Exception as e:
            error_msg = f"Error publishing sensor data: {str(e)}"
            self.logger.error(f"❌ {error_msg}")
            self.metrics.record_failure(error_msg)
            return False
    
    def get_metrics(self) -> PublishMetrics:
        """
        Get publishing metrics.
        
        Returns:
            PublishMetrics: Current metrics
        """
        return self.metrics
    
    def log_metrics(self):
        """Log current metrics"""
        metrics = self.metrics.to_dict()
        self.logger.info(f"📊 Publishing Metrics: {metrics}")
    
    def is_healthy(self) -> bool:
        """
        Check if publisher is healthy.
        
        Returns:
            bool: True if connected and publishing successfully
        """
        return self.is_connected and self.metrics.total_failed == 0
