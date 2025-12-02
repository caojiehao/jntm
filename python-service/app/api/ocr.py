"""
OCR识别API路由
"""

from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
import time
import os

from app.models.response_models import OCRResponse
from app.services.ocr_service import OCRService
from app.utils.logger import setup_logger
from app.config import settings

router = APIRouter()
logger = setup_logger(__name__)


@router.post("/recognize", response_model=OCRResponse)
async def recognize_fund_image(
    image: UploadFile = File(...),
    image_type: str = Form(...),
    user_id: int = Form(...)
):
    """
    基金截图OCR识别

    - **image**: 上传的图片文件
    - **image_type**: 图片类型 (fund_app/screenshot)
    - **user_id**: 用户ID
    """
    start_time = time.time()

    try:
        # 验证文件类型
        if image.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"不支持的图片类型: {image.content_type}"
            )

        # 验证文件大小
        if image.size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"文件大小超出限制: {image.size} > {settings.MAX_FILE_SIZE}"
            )

        logger.info(f"收到OCR识别请求: 用户ID={user_id}, 图片类型={image_type}")

        # 确保上传目录存在
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

        # 保存上传的文件
        file_content = await image.read()
        temp_file_path = os.path.join(
            settings.UPLOAD_DIR,
            f"temp_{int(time.time())}_{image.filename}"
        )

        try:
            with open(temp_file_path, "wb") as f:
                f.write(file_content)

            # 创建OCR服务实例
            ocr_service = OCRService()

            # 执行OCR识别
            result = await ocr_service.recognize_fund_image(
                image_path=temp_file_path,
                image_type=image_type,
                user_id=user_id
            )

            processing_time = time.time() - start_time

            logger.info(f"OCR识别完成: 耗时{processing_time:.2f}秒")

            return OCRResponse(
                success=True,
                message="OCR识别完成",
                extracted_text=result["extracted_text"],
                fund_code=result.get("fund_code"),
                fund_name=result.get("fund_name"),
                nav_value=result.get("nav_value"),
                confidence=result["confidence"]
            )

        finally:
            # 清理临时文件
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR识别失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR识别失败: {str(e)}")


@router.post("/batch-recognize")
async def batch_recognize_fund_images(
    images: list[UploadFile] = File(...),
    image_type: str = Form(...),
    user_id: int = Form(...)
):
    """
    批量基金截图OCR识别

    - **images**: 上传的图片文件列表
    - **image_type**: 图片类型
    - **user_id**: 用户ID
    """
    try:
        if len(images) > 10:  # 限制批量处理数量
            raise HTTPException(
                status_code=400,
                detail="批量处理图片数量不能超过10张"
            )

        logger.info(f"收到批量OCR识别请求: 用户ID={user_id}, 图片数量={len(images)}")

        ocr_service = OCRService()
        results = []

        for i, image in enumerate(images):
            try:
                # 验证文件类型
                if image.content_type not in settings.ALLOWED_IMAGE_TYPES:
                    results.append({
                        "index": i,
                        "success": False,
                        "error": f"不支持的图片类型: {image.content_type}"
                    })
                    continue

                # 验证文件大小
                if image.size > settings.MAX_FILE_SIZE:
                    results.append({
                        "index": i,
                        "success": False,
                        "error": f"文件大小超出限制"
                    })
                    continue

                # 保存临时文件
                file_content = await image.read()
                temp_file_path = os.path.join(
                    settings.UPLOAD_DIR,
                    f"batch_{int(time.time())}_{i}_{image.filename}"
                )

                with open(temp_file_path, "wb") as f:
                    f.write(file_content)

                try:
                    # 执行OCR识别
                    result = await ocr_service.recognize_fund_image(
                        image_path=temp_file_path,
                        image_type=image_type,
                        user_id=user_id
                    )

                    results.append({
                        "index": i,
                        "success": True,
                        "extracted_text": result["extracted_text"],
                        "fund_code": result.get("fund_code"),
                        "fund_name": result.get("fund_name"),
                        "nav_value": result.get("nav_value"),
                        "confidence": result["confidence"]
                    })

                finally:
                    # 清理临时文件
                    if os.path.exists(temp_file_path):
                        os.remove(temp_file_path)

            except Exception as e:
                logger.error(f"批量OCR识别第{i+1}张图片失败: {str(e)}")
                results.append({
                    "index": i,
                    "success": False,
                    "error": str(e)
                })

        return {
            "success": True,
            "total_images": len(images),
            "successful_recognitions": sum(1 for r in results if r["success"]),
            "results": results
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"批量OCR识别失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"批量OCR识别失败: {str(e)}")


@router.get("/health")
async def ocr_service_health():
    """OCR服务健康检查"""
    try:
        ocr_service = OCRService()
        health_status = await ocr_service.health_check()

        return {
            "service": "OCR Recognition Service",
            "status": "healthy" if health_status else "unhealthy",
            "timestamp": time.time()
        }

    except Exception as e:
        logger.error(f"OCR服务健康检查失败: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "service": "OCR Recognition Service",
                "status": "unhealthy",
                "error": str(e)
            }
        )