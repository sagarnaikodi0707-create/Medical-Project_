from typing import List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    project: str
    version: str
    gemini_configured: bool
    supabase_configured: bool
    tesseract_available: bool


class ParameterItem(BaseModel):
    name: str = Field(description="Name of the test/biomarker, e.g. Hemoglobin, Fasting Blood Sugar")
    value: str = Field(description="Observed numeric or qualitative value from the test report")
    unit: Optional[str] = Field(default="", description="Measurement unit, e.g. mg/dL, g/dL (empty if missing on report)")
    reference_range: Optional[str] = Field(
        default="",
        description="Normal reference range listed on report ONLY if present. Never invented."
    )
    status: str = Field(
        default="NORMAL",
        description="Status flag: NORMAL, HIGH, LOW, or UNKNOWN"
    )
    simple_explanation: str = Field(
        description="Clear, 1-2 sentence plain-language educational explanation of what this marker measures"
    )
    missing_or_unclear_notes: Optional[str] = Field(
        default="",
        description="Explicit note when information (unit, reference range, value) is missing, truncated, or unclear"
    )
    source_extracted: bool = Field(
        default=True,
        description="Flag indicating this value was extracted directly from the source document"
    )


class ReportAnalysis(BaseModel):
    report_title: str = Field(description="Category or title of the test report, e.g., Complete Blood Count (CBC)")
    report_date: Optional[str] = Field(default="", description="Date of the report if present")
    patient_demographics: Optional[str] = Field(default="", description="Age/Gender if present, without personal names")
    overview_summary: str = Field(
        description="Educational 2-4 sentence summary of the overall lab report without diagnosing or claiming certainty"
    )
    clarity_assessment: Optional[str] = Field(
        default="Legible report text",
        description="Assessment of whether the document is clear, or if parts are ambiguous or missing"
    )
    is_clarity_issue: bool = Field(
        default=False,
        description="Flag indicating that portions of the report were unclear or incomplete"
    )
    key_findings: List[str] = Field(
        description="Bullet points of the most noteworthy findings, highlighting normal vs flagged markers"
    )
    parameters: List[ParameterItem] = Field(
        description="Structured list of extracted individual test parameters"
    )
    questions_for_doctor: List[str] = Field(
        description="3-5 specific questions the patient can ask their physician during consultation"
    )
    lifestyle_notes: Optional[List[str]] = Field(
        default_factory=list,
        description="General non-prescriptive lifestyle or hydration habits to discuss with doctor"
    )
    ai_engine_used: Optional[str] = Field(
        default="Gemini API",
        description="Model or engine utilized to process this report"
    )
    medical_disclaimer: str = Field(
        default="This summary is for educational purposes only and is not a medical diagnosis or treatment plan. Never disregard professional medical advice. Always consult a qualified healthcare professional with your original report.",
        description="Mandatory medical safety disclaimer"
    )
    extracted_text_preview: Optional[str] = Field(
        default="",
        description="Truncated preview of raw extracted text for transparency"
    )


class ReportUploadResponse(BaseModel):
    success: bool
    analysis: ReportAnalysis
    saved_to_history: bool = False
    report_id: Optional[str] = None
