"""
OCR识别服务
"""

import asyncio
import time
import os
import re
from typing import Dict, Any, Optional
from PIL import Image
import pytesseract
from tencentcloud.common import credential
from tencentcloud.common.profile.client_profile import ClientProfile
from tencentcloud.common.profile.http_profile import HttpProfile
from tencentcloud.ocr.v20181119 import ocr_client, models

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


class OCRService:
    """OCR识别服务类"""

    def __init__(self):
        self.tencent_client = None
        self._initialize_clients()

    def _initialize_clients(self):
        """初始化OCR客户端"""
        try:
            # 初始化腾讯云OCR客户端
            if settings.TENCENT_SECRET_ID and settings.TENCENT_SECRET_KEY:
                cred = credential.Credential(
                    settings.TENCENT_SECRET_ID,
                    settings.TENCENT_SECRET_KEY
                )
                httpProfile = HttpProfile()
                httpProfile.endpoint = "ocr.tencentcloudapi.com"

                clientProfile = ClientProfile()
                clientProfile.httpProfile = httpProfile

                self.tencent_client = ocr_client.OcrClient(
                    cred, settings.TENCENT_REGION, clientProfile
                )
                logger.info("腾讯云OCR客户端初始化成功")
            else:
                logger.warning("腾讯云OCR配置不完整，将使用本地OCR")

        except Exception as e:
            logger.error(f"OCR客户端初始化失败: {e}")

    async def recognize_fund_image(
        self,
        image_path: str,
        image_type: str,
        user_id: int
    ) -> Dict[str, Any]:
        """
        基金截图OCR识别

        Args:
            image_path: 图片路径
            image_type: 图片类型
            user_id: 用户ID

        Returns:
            识别结果
        """
        try:
            logger.info(f"开始OCR识别: 用户ID={user_id}, 图片类型={image_type}")

            # 读取图片
            with open(image_path, 'rb') as f:
                image_data = f.read()

            # 调用OCR识别
            if self.tencent_client:
                extracted_text = await self._tencent_ocr(image_data)
            else:
                extracted_text = await self._local_ocr(image_path)

            # 提取基金信息
            fund_info = self._extract_fund_info(extracted_text)

            # 计算置信度
            confidence = self._calculate_confidence(fund_info)

            logger.info(f"OCR识别完成: 用户ID={user_id}, 置信度={confidence}")
            return {
                "extracted_text": extracted_text,
                "fund_code": fund_info.get("fund_code"),
                "fund_name": fund_info.get("fund_name"),
                "nav_value": fund_info.get("nav_value"),
                "confidence": confidence
            }

        except Exception as e:
            logger.error(f"OCR识别失败: {str(e)}")
            raise

    async def health_check(self) -> bool:
        """OCR服务健康检查"""
        try:
            # 检查腾讯云客户端或本地OCR是否可用
            return self.tencent_client is not None or self._check_local_ocr()
        except Exception as e:
            logger.error(f"OCR服务健康检查失败: {str(e)}")
            return False

    async def _tencent_ocr(self, image_data: bytes) -> str:
        """腾讯云OCR识别"""
        try:
            req = models.GeneralAccurateOCRRequest()
            req.ImageBase64 = image_data.encode('base64')

            resp = self.tencent_client.GeneralAccurateOCR(req)

            # 提取文本
            text_blocks = []
            for text_detections in resp.TextDetections:
                text_blocks.append(text_detections.DetectedText)

            return "\n".join(text_blocks)

        except Exception as e:
            logger.error(f"腾讯云OCR识别失败: {str(e)}")
            raise

    async def _local_ocr(self, image_path: str) -> str:
        """本地OCR识别（使用pytesseract）"""
        try:
            # 打开图片并进行预处理
            image = Image.open(image_path)

            # 转换为灰度图
            if image.mode != 'L':
                image = image.convert('L')

            # OCR识别
            text = pytesseract.image_to_string(image, lang='chi_sim+eng')
            return text.strip()

        except Exception as e:
            logger.error(f"本地OCR识别失败: {str(e)}")
            raise

    def _extract_fund_info(self, text: str) -> Dict[str, Any]:
        """从识别的文本中提取基金信息"""
        fund_info = {}

        try:
            # 提取基金代码（6位数字）
            fund_code_pattern = r'\b(\d{6})\b'
            fund_codes = re.findall(fund_code_pattern, text)
            if fund_codes:
                fund_info["fund_code"] = fund_codes[0]

            # 提取基金名称（常见关键词匹配）
            fund_name_patterns = [
                r'([^，。\n]*基金[^，。\n]*)',
                r'([^，。\n]*ETF[^，。\n]*)',
                r'([^，。\n]*指数[^，。\n]*)'
            ]

            for pattern in fund_name_patterns:
                matches = re.findall(pattern, text)
                if matches:
                    fund_info["fund_name"] = matches[0].strip()
                    break

            # 提取净值信息
            nav_patterns = [
                r'净值[：:\s]*([0-9]+\.?[0-9]*)',
                r'NAV[：:\s]*([0-9]+\.?[0-9]*)',
                r'单位净值[：:\s]*([0-9]+\.?[0-9]*)'
            ]

            for pattern in nav_patterns:
                matches = re.findall(pattern, text)
                if matches:
                    try:
                        fund_info["nav_value"] = float(matches[0])
                        break
                    except ValueError:
                        continue

            # 提取增长率
            growth_patterns = [
                r'增长率[：:\s]*([+-]?[0-9]+\.?[0-9]*%)',
                r'涨跌幅[：:\s]*([+-]?[0-9]+\.?[0-9]*%)',
                r'日涨跌[：:\s]*([+-]?[0-9]+\.?[0-9]*%)'
            ]

            for pattern in growth_patterns:
                matches = re.findall(pattern, text)
                if matches:
                    fund_info["growth_rate"] = matches[0]
                    break

        except Exception as e:
            logger.warning(f"基金信息提取失败: {str(e)}")

        return fund_info

    def _calculate_confidence(self, fund_info: Dict[str, Any]) -> float:
        """计算识别置信度"""
        confidence = 0.0

        # 基金识别置信度评估
        if fund_info.get("fund_code"):
            confidence += 0.4
        if fund_info.get("fund_name"):
            confidence += 0.3
        if fund_info.get("nav_value") is not None:
            confidence += 0.2
        if fund_info.get("growth_rate"):
            confidence += 0.1

        return min(confidence, 1.0)

    def _check_local_ocr(self) -> bool:
        """检查本地OCR是否可用"""
        try:
            import pytesseract
            # 尝试获取tesseract版本
            pytesseract.get_tesseract_version()
            return True
        except Exception as e:
            logger.warning(f"本地OCR不可用: {str(e)}")
            return False