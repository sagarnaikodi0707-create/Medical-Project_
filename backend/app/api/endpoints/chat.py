"""
Chat endpoint: POST /api/reports/chat
Answers user questions strictly from the uploaded report context.
"""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from app.services.chat_service import answer_report_question

logger = logging.getLogger("reportsaathi.chat.endpoint")

router = APIRouter()


class ParameterContext(BaseModel):
    name: str
    value: str
    unit: Optional[str] = ""
    reference_range: Optional[str] = ""
    status: Optional[str] = ""
    simple_explanation: Optional[str] = ""


class ReportContext(BaseModel):
    report_title: Optional[str] = "Lab Report"
    key_findings: Optional[List[str]] = []
    parameters: List[ParameterContext] = []


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=400, description="User's question about their report")
    report_context: ReportContext


class ChatResponse(BaseModel):
    answer: str
    disclaimer: str
    source_verified: bool
    used_ai: bool


@router.post("/chat", response_model=ChatResponse, summary="Ask a question about your report")
async def chat_about_report(payload: ChatRequest):
    """
    Answer questions using ONLY the provided report's extracted parameters.
    Never diagnoses, never invents data, always includes educational disclaimer.
    """
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=422, detail="Question cannot be empty.")

    # Sanitize: strip personal identifiers from question (we don't log it)
    if len(question) > 400:
        raise HTTPException(status_code=422, detail="Question too long (max 400 characters).")

    try:
        result = answer_report_question(
            question=question,
            report_context=payload.report_context.model_dump(),
        )
        return ChatResponse(**result)
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to process your question. Please try again or consult your healthcare provider."
        )
