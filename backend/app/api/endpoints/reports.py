from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.extractor import extract_document
from app.services.parser import process_report_analysis
from app.schemas.report import ReportUploadResponse

router = APIRouter()


@router.post("/analyze", response_model=ReportUploadResponse)
async def analyze_report_endpoint(file: UploadFile = File(...)):
    """
    POST /api/reports/analyze
    Accepts PDF, JPG, or PNG uploads.
    Extracts text, parses laboratory parameters, and returns structured plain-language explanations.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A file upload is required."
        )

    # Read file bytes safely in chunks to check size
    file_bytes = await file.read()

    # Extract text using safe temporary file management & OCR / PDF parser
    extraction_result = extract_document(
        file_bytes=file_bytes,
        filename=file.filename,
        content_type=file.content_type
    )

    extracted_text = extraction_result.get("text", "")

    # Parse and structure report parameters
    analysis = process_report_analysis(extracted_text)

    # Attach preview
    preview = extracted_text[:800] + ("..." if len(extracted_text) > 800 else "")
    analysis.extracted_text_preview = preview

    return ReportUploadResponse(
        success=True,
        analysis=analysis,
        saved_to_history=False,
        report_id=None
    )
