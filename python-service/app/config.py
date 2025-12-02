"""
基你太美 - Python AI服务配置文件
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """应用配置类"""

    # 服务配置
    APP_NAME: str = "JNTM Python AI Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    PORT: int = 5081
    HOST: str = "0.0.0.0"

    # AI服务配置
    DEEPSEEK_API_KEY: Optional[str] = None
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com/v1"

    QWEN_API_KEY: Optional[str] = None
    QWEN_BASE_URL: str = "https://dashscope.aliyuncs.com/api/v1"

    # AI模型配置
    DEFAULT_MODEL: str = "deepseek-chat"
    MAX_TOKENS: int = 4000
    TEMPERATURE: float = 0.7

    # OCR服务配置
    TENCENT_SECRET_ID: Optional[str] = None
    TENCENT_SECRET_KEY: Optional[str] = None
    TENCENT_REGION: str = "ap-beijing"

    # 文件上传配置
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/png", "image/jpg"]

    # 缓存配置
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 1

    # Java后端服务配置
    JAVA_SERVICE_BASE_URL: str = "http://localhost:5080/api/v1"

    # 日志配置
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/python-ai-service.log"

    # 性能配置
    REQUEST_TIMEOUT: int = 30  # 秒
    MAX_CONCURRENT_REQUESTS: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = True


# 创建全局配置实例
settings = Settings()