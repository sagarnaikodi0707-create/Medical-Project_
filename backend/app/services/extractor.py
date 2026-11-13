import os
import io
import shutil
import tempfile
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from PIL import Image, UnidentifiedImageError
import pytesseract
import pdfplumber
import pypdf
from app.config import settings

# Maximum allowed file size: 10 MB
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
}

# Auto-configure Tesseract path if present
def get_tesseract_path() -> Optional[str]:
    if settings.TESSERACT_CMD and os.path.exists(settings.TESSERACT_CMD):
        return settings.TESSERACT_CMD
    which_path = shutil.which("tesseract")
    if which_path:
        return which_path
    common_win_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
    ]
    for p in common_win_paths:
        if os.path.exists(p):
            return p
    return None


def validate_file(filename: str, content_type: str, file_size: int) -> None:
    """Validate file type and size before processing."""
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a valid filename."
        )

    # Check extension
    ext = os.path.splitext(filename)[1].lower()
    valid_exts = [".pdf", ".jpg", ".jpeg", ".png"]
    if ext not in valid_exts:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file format '{ext}'. ReportSaathi accepts PDF, JPG, and PNG files."
        )

    # Check MIME type if provided
    clean_mime = (content_type or "").lower().split(";")[0].strip()
    if clean_mime and clean_mime not in ALLOWED_MIME_TYPES and clean_mime != "application/octet-stream":
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{clean_mime}'. Only PDF, JPEG, and PNG are supported."
        )

    # Check file size
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB."
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty (0 bytes). Please upload a valid document."
        )


def extract_text_from_pdf(file_path: str) -> Dict[str, Any]:
    """Extract digital text from PDF, falling back to page OCR if scanned."""
    extracted_text = ""
    page_count = 0

    try:
        with pdfplumber.open(file_path) as pdf:
            page_count = len(pdf.pages)
            for i, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                # Also try table extraction
                tables = page.extract_tables()
                table_text = ""
                for table in tables:
                    for row in table:
                        row_items = [str(col).strip() for col in row if col is not None]
                        if row_items:
                            table_text += " | ".join(row_items) + "\n"
                
                combined = f"--- Page {i+1} ---\n{text}\n{table_text}"
                extracted_text += combined + "\n"
    except Exception as e:
        # Fallback to pypdf
        try:
            reader = pypdf.PdfReader(file_path)
            page_count = len(reader.pages)
            for i, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                extracted_text += f"--- Page {i+1} ---\n{text}\n"
        except Exception as pypdf_err:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Unable to read PDF structure. The file may be password protected or corrupted: {str(e)}"
            )

    # If digital text exists and is substantial, return it
    clean_text = extracted_text.strip()
    # Filter out page markers
    content_only = "\n".join([line for line in clean_text.splitlines() if not line.startswith("--- Page")])
    if len(content_only.strip()) > 40:
        return {
            "text": clean_text,
            "method": "pdf_digital_text",
            "page_count": page_count,
            "is_scanned": False
        }

    # If digital text is empty/insufficient, this is likely a scanned PDF
    return ocr_scanned_pdf(file_path, page_count)


def ocr_scanned_pdf(file_path: str, page_count: int) -> Dict[str, Any]:
    """Perform OCR on a scanned PDF using pypdfium2 and Tesseract/Gemini."""
    tess_path = get_tesseract_path()
    
    try:
        import pypdfium2 as pdfium
        pdf = pdfium.PdfDocument(file_path)
        ocr_text = ""
        
        # Only process up to 5 pages for scanned PDF to prevent timeout
        max_pages = min(len(pdf), 5)
        for i in range(max_pages):
            page = pdf[i]
            bitmap = page.render(scale=2.0) # 2x scale for higher OCR clarity
            pil_image = bitmap.to_pil()
            page_text = run_ocr_on_image(pil_image, tess_path)
            ocr_text += f"--- Page {i+1} (OCR) ---\n{page_text}\n"
            
        if len(ocr_text.strip()) > 30:
            return {
                "text": ocr_text.strip(),
                "method": "pdf_ocr",
                "page_count": page_count,
                "is_scanned": True
            }
    except Exception as err:
        pass

    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=(
            "The uploaded PDF contains scanned images rather than digital text, and OCR was unable to read it. "
            "Please ensure Tesseract OCR is installed on the host or configure GEMINI_API_KEY in backend/.env for multimodal reading."
        )
    )


def extract_text_from_image(file_path: str) -> Dict[str, Any]:
    """Extract text from JPG or PNG image using OCR or vision fallback."""
    try:
        image = Image.open(file_path)
        image.verify()
        # Re-open for processing since verify() closes image
        image = Image.open(file_path)
    except (UnidentifiedImageError, OSError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image is corrupt or could not be decoded. Please upload a clear JPG or PNG file."
        )

    tess_path = get_tesseract_path()
    text = run_ocr_on_image(image, tess_path)

    if not text or len(text.strip()) < 15:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No legible text or laboratory parameters could be detected from this image. Please check camera focus, lighting, and ensure the document is right-side up."
        )

    return {
        "text": text.strip(),
        "method": "image_ocr",
        "page_count": 1,
        "is_scanned": True
    }


def run_ocr_on_image(image: Image.Image, tess_path: Optional[str]) -> str:
    """Run Tesseract on PIL image, or gracefully fall back to Gemini Vision if configured."""
    if tess_path:
        try:
            pytesseract.pytesseract.tesseract_cmd = tess_path
            # Preprocessing: convert to grayscale and threshold
            gray = image.convert("L")
            text = pytesseract.image_to_string(gray, lang="eng")
            if text and len(text.strip()) > 15:
                return text
        except Exception as e:
            pass

    # If Tesseract not available or returned empty, check Gemini API Key fallback
    if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5:
        from app.services.gemini_service import extract_text_with_gemini_vision
        try:
            vision_text = extract_text_with_gemini_vision(image)
            if vision_text and len(vision_text.strip()) > 15:
                return vision_text
        except Exception:
            pass

    # If neither Tesseract nor Gemini worked
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=(
            "Image OCR failed: Tesseract OCR is not installed in system PATH, and GEMINI_API_KEY is not configured. "
            "To process scanned images, please install Tesseract OCR on Windows or provide GEMINI_API_KEY in backend/.env. "
            "Digital PDFs with embedded text can be processed immediately without OCR."
        )
    )


def extract_document(file_bytes: bytes, filename: str, content_type: str) -> Dict[str, Any]:
    """Safe temporary file handling and extraction orchestration."""
    validate_file(filename, content_type, len(file_bytes))

    ext = os.path.splitext(filename)[1].lower()
    suffix = ext if ext else ".tmp"

    # Safe NamedTemporaryFile with delete=False so Windows can reopen it
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_path = temp_file.name

    try:
        temp_file.write(file_bytes)
        temp_file.flush()
        temp_file.close()

        if ext == ".pdf":
            result = extract_text_from_pdf(temp_path)
        else:
            result = extract_text_from_image(temp_path)

        clean_text = result.get("text", "").strip()
        if not clean_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Empty text extracted from document. The file does not appear to contain legible test data."
            )

        return result
    finally:
        # Guarantee cleanup
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
