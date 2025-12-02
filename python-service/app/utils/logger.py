"""
日志配置工具
"""

import sys
import os
from pathlib import Path
from loguru import logger


def setup_logger(name: str = None):
    """设置日志配置"""

    # 移除默认处理器
    logger.remove()

    # 确保日志目录存在
    log_file = "logs/python-ai-service.log"
    log_dir = Path(log_file).parent
    log_dir.mkdir(exist_ok=True)

    # 控制台输出格式
    console_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    )

    # 文件输出格式
    file_format = (
        "{time:YYYY-MM-DD HH:mm:ss.SSS} | "
        "{level: <8} | "
        "{name}:{function}:{line} - "
        "{message}"
    )

    # 添加控制台处理器
    logger.add(
        sys.stdout,
        format=console_format,
        level="INFO",
        colorize=True,
        backtrace=True,
        diagnose=True
    )

    # 添加文件处理器
    logger.add(
        log_file,
        format=file_format,
        level="DEBUG",
        rotation="100 MB",
        retention="30 days",
        compression="zip",
        backtrace=True,
        diagnose=True
    )

    # 错误日志单独文件
    logger.add(
        "logs/error.log",
        format=file_format,
        level="ERROR",
        rotation="50 MB",
        retention="30 days",
        compression="zip",
        backtrace=True,
        diagnose=True
    )

    return logger