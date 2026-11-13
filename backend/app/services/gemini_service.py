import os
import json
import logging
from typing import Optional, Dict, Any
from PIL import Image
from google import genai
from google.genai import types
from google.genai.errors import APIError
from pydantic import ValidationError
from app.config import settings
from app.schemas.report import ReportAnalysis, ParameterItem

logger = logging.getLogger("reportsaathi.gemini")

GEMINI_SYSTEM_INSTRUCTION = """
You are ReportSaathi, an educational medical laboratory interpretation assistant.
Your goal is to increase health literacy by explaining clinical laboratory reports in clear, simple terms.

MANDATORY CLINICAL SAFETY AND ACCURACY RULES:
1. NO DIAGNOSIS OR TREATMENT: Do NOT diagnose diseases, prescribe medication, recommend medical treatments, or claim absolute certainty about any clinical condition.
2. NO INVENTED FACTS: NEVER invent, estimate, hallucinate, or guess values, units, or reference intervals.
3. STRICT SOURCE-EXTRACTION: Extract ONLY the test names, numeric/qualitative values, units, and reference ranges that are explicitly printed in the provided document text.
4. UNSTATED REFERENCE RANGES: If a reference range is not stated in the source document, leave reference_range as an empty string ("") and explicitly record in missing_or_unclear_notes: "Reference range not specified on report". Mark status as "UNKNOWN".
5. CLARITY ASSESSMENT: If the report text is truncated, blurry, missing headers, or unclear, set is_clarity_issue to true, state the ambiguity in clarity_assessment, and advise the user to consult a qualified clinician.
6. SOURCE FACTS VS AI EXPLANATIONS: Keep source parameters strictly factual. Place plain-language translations in simple_explanation.
7. QUESTIONS FOR DOCTOR: Formulate 3-5 respectful, specific questions the patient can bring to their physician appointment.
8. DISCLAIMER: Always output the mandatory educational disclaimer.
"""


def get_gemini_client() -> Optional[genai.Client]:
    """Retrieve Gemini client using server-side API key from environment."""
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    if not api_key or len(api_key.strip()) < 5:
        return None
    try:
        return genai.Client(api_key=api_key.strip())
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {e}")
        return None


def extract_text_with_gemini_vision(image: Image.Image) -> str:
    """Multimodal vision text extraction for scanned documents."""
    client = get_gemini_client()
    if not client:
        return ""

    import io
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG", quality=90)
    image_bytes = buffered.getvalue()

    prompt = (
        "Extract all readable text, tables, laboratory test names, measured values, units, "
        "and reference ranges from this medical laboratory report image verbatim. Preserve layout where possible."
    )

    for model_name in ["gemini-2.5-flash", "gemini-1.5-flash"]:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    prompt
                ]
            )
            if response.text and len(response.text.strip()) > 15:
                return response.text.strip()
        except Exception as e:
            logger.warning(f"Vision extraction attempt with {model_name} failed: {e}")
            continue

    return ""


def analyze_report_with_gemini(extracted_text: str) -> Optional[ReportAnalysis]:
    """
    Sends extracted report text to Gemini and validates the structured output with Pydantic.
    Returns validated ReportAnalysis or None on failure.
    """
    client = get_gemini_client()
    if not client:
        logger.info("Gemini API key is not configured; using deterministic clinical parser.")
        return None

    prompt = f"""
Analyze the following laboratory report text and output a strictly valid JSON object matching the requested schema.
Remember the absolute rule: Never invent missing values or reference ranges.

Document text:
\"\"\"
{extracted_text}
\"\"\"

Return ONLY a valid JSON object matching this exact schema:
{{
  "report_title": "string (e.g. Complete Blood Count (CBC) / Lipid Profile)",
  "report_date": "string or empty",
  "patient_demographics": "string or empty (e.g. Adult 45y)",
  "overview_summary": "string (educational plain-language overview, no diagnostic claims)",
  "clarity_assessment": "string (note whether document text is clear, or if parts are missing)",
  "is_clarity_issue": false,
  "key_findings": ["string", "string"],
  "parameters": [
    {{
      "name": "string (Exact test name from document)",
      "value": "string (Observed value from document)",
      "unit": "string (Measurement unit or empty)",
      "reference_range": "string (ONLY if printed on document, otherwise empty string)",
      "status": "NORMAL | HIGH | LOW | UNKNOWN",
      "simple_explanation": "string (plain-language explanation of what marker measures)",
      "missing_or_unclear_notes": "string (note if unit or range was absent on source document)",
      "source_extracted": true
    }}
  ],
  "questions_for_doctor": ["string", "string", "string"],
  "lifestyle_notes": ["string", "string"],
  "ai_engine_used": "Gemini 2.5 Flash",
  "medical_disclaimer": "This summary is for educational purposes only and is not a medical diagnosis or treatment plan. Never disregard professional medical advice. Always consult a qualified healthcare professional with your original report."
}}
"""

    for model_name in ["gemini-2.5-flash", "gemini-1.5-flash"]:
        try:
            logger.info(f"Querying Gemini API with model: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=GEMINI_SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )

            raw_json = response.text
            if not raw_json:
                continue

            # Parse JSON
            data = json.loads(raw_json)

            # Pydantic schema validation
            validated_analysis = ReportAnalysis.model_validate(data)
            validated_analysis.ai_engine_used = f"Google {model_name}"

            # Extra clinical safety check: enforce empty range if unstated
            for param in validated_analysis.parameters:
                if not param.reference_range or param.reference_range.strip() == "":
                    param.reference_range = ""
                    if not param.missing_or_unclear_notes:
                        param.missing_or_unclear_notes = "Reference range not specified on report"
                    param.status = "UNKNOWN" if param.status not in ("NORMAL", "HIGH", "LOW") else param.status

            logger.info(f"Successfully validated Gemini output with {len(validated_analysis.parameters)} parameters.")
            return validated_analysis

        except ValidationError as val_err:
            logger.error(f"Pydantic validation failed for Gemini response from {model_name}: {val_err}")
            continue
        except (APIError, Exception) as api_err:
            logger.warning(f"Gemini API request failed with {model_name}: {api_err}")
            continue

    return None
