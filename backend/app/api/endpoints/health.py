import shutil
from fastapi import APIRouter
from app.config import settings
from app.schemas.report import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def get_health():
    # Check if tesseract binary is accessible
    tesseract_found = False
    if settings.TESSERACT_CMD:
        tesseract_found = shutil.which(settings.TESSERACT_CMD) is not None
    else:
        tesseract_found = shutil.which("tesseract") is not None

    return HealthResponse(
        status="ok",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        gemini_configured=bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5),
        supabase_configured=bool(settings.SUPABASE_URL and settings.SUPABASE_KEY),
        tesseract_available=bool(tesseract_found)
    )
