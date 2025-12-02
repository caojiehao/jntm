"""
API路由包
"""

from .ai import router as ai_router
from .ocr import router as ocr_router
from .analytics import router as analytics_router

__all__ = ["ai_router", "ocr_router", "analytics_router"]