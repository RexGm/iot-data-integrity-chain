"""
Logging setup module

Configures structured logging with console and file output for the
IoT sensor simulator application.
"""

import logging
import logging.handlers
import os
from pathlib import Path
from config import AppConfig


def setup_logging(config: AppConfig) -> logging.Logger:
    """
    Setup logging configuration.
    
    Creates both console and file handlers with appropriate formatting
    and log levels based on configuration.
    
    Args:
        config (AppConfig): Application configuration
        
    Returns:
        logging.Logger: Configured logger instance
    """
    # Create logs directory if needed
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Create logger
    logger = logging.getLogger("iot-sensor-simulator")
    logger.setLevel(getattr(logging, config.log_level))
    
    # Prevent duplicate handlers
    if logger.hasHandlers():
        logger.handlers.clear()
    
    # Format
    formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console Handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(getattr(logging, config.log_level))
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File Handler
    try:
        log_file = log_dir / "sensor-simulator.log"
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5
        )
        file_handler.setLevel(logging.DEBUG)  # Always log DEBUG to file
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        logger.info(f"📝 Logging to file: {log_file}")
    except Exception as e:
        logger.warning(f"Could not setup file logging: {str(e)}")
    
    logger.info(f"🔧 Logging initialized - Level: {config.log_level}")
    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Get a named logger instance.
    
    Args:
        name (str): Logger name
        
    Returns:
        logging.Logger: Logger instance
    """
    return logging.getLogger(f"iot-sensor-simulator.{name}")
