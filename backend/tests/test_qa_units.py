import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.extractor import extract_document
from app.services.parser import deterministic_parse, process_report_analysis
from app.services.chat_service import answer_report_question
from app.schemas.report import ReportAnalysis

def test_unit_parser_cbc():
    sample_text = """
    COMPLETE BLOOD COUNT REPORT
    Hemoglobin 10.8 g/dL 12.0 - 15.5
    RBC Count 4.10 million/uL 3.90 - 5.20
    Platelet Count 245 10^3/uL 150 - 450
    Total Leukocyte Count 6.8 10^3/uL 4.5 - 11.0
    Mean Corpuscular Volume 76.4 fL 80.0 - 100.0
    """
    analysis = deterministic_parse(sample_text)
    assert analysis is not None
    assert len(analysis.parameters) >= 3
    
    hb = next((p for p in analysis.parameters if "hemoglobin" in p.name.lower()), None)
    assert hb is not None
    assert hb.value == "10.8"
    assert hb.status == "LOW"
    assert hb.reference_range == "12.0 - 15.5"
    print("✓ Unit test: CBC Deterministic Parser passed")

def test_unit_unclear_report_handling():
    # When text is empty or too short
    analysis = deterministic_parse("unreadable scan noise")
    assert analysis is not None
    assert analysis.is_clarity_issue is True
    assert "consult" in analysis.clarity_assessment.lower()
    print("✓ Unit test: Low-clarity / noise report handling passed")

def test_unit_chat_guardrails():
    report_context = {
        "report_title": "Lipid Profile",
        "parameters": [
            {
                "name": "Total Cholesterol",
                "value": "240",
                "unit": "mg/dL",
                "reference_range": "< 200",
                "status": "HIGH",
                "simple_explanation": "Cholesterol measures fatty lipids in your bloodstream."
            }
        ]
    }
    
    # 1. On-topic question
    res_valid = answer_report_question("What is my cholesterol level?", report_context)
    assert "240" in res_valid["answer"]
    assert "educational" in res_valid["disclaimer"].lower()

    # 2. Off-topic question (not present)
    res_invalid = answer_report_question("What is my thyroid TSH?", report_context)
    assert "not available" in res_invalid["answer"].lower()
    assert "healthcare provider" in res_invalid["answer"].lower()
    print("✓ Unit test: Chat boundaries and safety disclaimers passed")

if __name__ == "__main__":
    test_unit_parser_cbc()
    test_unit_unclear_report_handling()
    test_unit_chat_guardrails()
    print("\nALL QA UNIT TESTS COMPLETED SUCCESSFULLY!")
