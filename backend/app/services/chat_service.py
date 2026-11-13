"""
ReportSaathi Chat Service
Answers user questions strictly using the report's extracted parameters.
Never diagnoses, never invents, always disclaims.
"""
import logging
from typing import Optional
from app.services.gemini_service import get_gemini_client
from app.config import settings

logger = logging.getLogger("reportsaathi.chat")

CHAT_DISCLAIMER = (
    "⚠️ For educational purposes only. Not medical advice. "
    "Always consult a qualified healthcare professional for personal health decisions."
)

CHAT_SYSTEM_INSTRUCTION = """You are ReportSaathi Chat, an educational health-literacy assistant.

You have access ONLY to the extracted parameters from the user's specific lab report (provided below).
Your ONLY job is to explain what the report shows in plain, non-technical language.

STRICT RULES:
1. Answer ONLY using information present in the provided report parameters.
2. If a question asks about something NOT in the report, say exactly:
   "This information is not available in your report. Please consult your healthcare provider."
3. NEVER diagnose any disease or condition.
4. NEVER recommend medication, treatment, supplements, or specific lifestyle changes as prescriptive advice.
5. NEVER invent, estimate, or hallucinate values, ranges, or facts.
6. ALWAYS end every response with the disclaimer: "{disclaimer}"
7. Keep answers under 200 words, plain and reassuring.
8. If a value is flagged LOW or HIGH, explain what the test measures, not what the result means clinically.
""".format(disclaimer=CHAT_DISCLAIMER)


def _build_report_context_text(report_context: dict) -> str:
    """Build a structured text description of the report for Gemini's context."""
    lines = []
    title = report_context.get("report_title", "Lab Report")
    lines.append(f"REPORT: {title}")

    key_findings = report_context.get("key_findings", [])
    if key_findings:
        lines.append(f"KEY FINDINGS: {'; '.join(str(f) for f in key_findings[:5])}")

    parameters = report_context.get("parameters", [])
    if parameters:
        lines.append("\nEXTRACTED TEST PARAMETERS:")
        for p in parameters:
            name = p.get("name", "Unknown")
            value = p.get("value", "N/A")
            unit = p.get("unit", "")
            ref = p.get("reference_range", "")
            status = p.get("status", "")
            explanation = p.get("simple_explanation", "")
            line = f"  - {name}: {value} {unit}".rstrip()
            if ref:
                line += f" (Reference: {ref})"
            if status:
                line += f" [Status: {status}]"
            if explanation:
                line += f"\n    Plain language: {explanation}"
            lines.append(line)

    return "\n".join(lines)


def _fallback_answer(question: str, report_context: dict) -> str:
    """Simple keyword fallback when Gemini is unavailable."""
    q_lower = question.lower()
    parameters = report_context.get("parameters", [])
    matches = []

    for p in parameters:
        name = p.get("name", "").lower()
        if any(word in name for word in q_lower.split() if len(word) > 3):
            value = p.get("value", "N/A")
            unit = p.get("unit", "")
            ref = p.get("reference_range", "")
            status = p.get("status", "")
            explanation = p.get("simple_explanation", "")
            part = f"**{p.get('name')}**: {value} {unit}".strip()
            if ref:
                part += f" (Range: {ref})"
            if status:
                part += f" — {status}"
            if explanation:
                part += f"\n{explanation}"
            matches.append(part)

    if matches:
        answer = "Based on your report:\n\n" + "\n\n".join(matches)
    else:
        answer = (
            "This information is not available in your report. "
            "Please consult your healthcare provider for a detailed explanation."
        )

    return answer + f"\n\n{CHAT_DISCLAIMER}"


def answer_report_question(question: str, report_context: dict) -> dict:
    """
    Answer a user question strictly from the provided report context.
    Returns: { answer: str, disclaimer: str, source_verified: bool, used_ai: bool }
    """
    if not question or len(question.strip()) < 3:
        return {
            "answer": "Please ask a question about your report.",
            "disclaimer": CHAT_DISCLAIMER,
            "source_verified": False,
            "used_ai": False,
        }

    client = get_gemini_client()
    report_text = _build_report_context_text(report_context)

    if not client:
        logger.info("Gemini unavailable — using keyword fallback for chat")
        return {
            "answer": _fallback_answer(question, report_context),
            "disclaimer": CHAT_DISCLAIMER,
            "source_verified": False,
            "used_ai": False,
        }

    prompt = (
        f"{CHAT_SYSTEM_INSTRUCTION}\n\n"
        f"=== CURRENT REPORT DATA ===\n{report_text}\n"
        f"=========================\n\n"
        f"User question: {question.strip()}"
    )

    for model_name in ["gemini-2.5-flash", "gemini-1.5-flash"]:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            answer_text = response.text.strip() if response.text else ""
            if not answer_text:
                continue

            # Ensure disclaimer is always present
            if CHAT_DISCLAIMER not in answer_text:
                answer_text = answer_text + f"\n\n{CHAT_DISCLAIMER}"

            return {
                "answer": answer_text,
                "disclaimer": CHAT_DISCLAIMER,
                "source_verified": True,
                "used_ai": True,
            }
        except Exception as e:
            logger.warning(f"Chat: Gemini {model_name} failed: {e}")
            continue

    # All Gemini attempts failed — keyword fallback
    logger.warning("Chat: All Gemini models failed, using keyword fallback")
    return {
        "answer": _fallback_answer(question, report_context),
        "disclaimer": CHAT_DISCLAIMER,
        "source_verified": False,
        "used_ai": False,
    }
