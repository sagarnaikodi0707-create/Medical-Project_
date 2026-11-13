import re
from typing import List, Optional
from app.schemas.report import ReportAnalysis, ParameterItem
from app.services.gemini_service import analyze_report_with_gemini

# Dictionary of standard medical knowledge for plain language explanations
EXPLANATION_KB = {
    "hemoglobin": "Carries oxygen from your lungs to the rest of your body inside red blood cells.",
    "hb": "Carries oxygen from your lungs to the rest of your body inside red blood cells.",
    "rbc": "Red blood cells deliver oxygen throughout your tissues and organs.",
    "wbc": "White blood cells defend your body against infections and foreign invaders.",
    "platelet": "Cell fragments that help your blood clot to stop and prevent bleeding.",
    "mcv": "Measures the physical volume and average size of your red blood cells.",
    "mch": "The average amount of oxygen-carrying hemoglobin inside each red blood cell.",
    "mchc": "The average concentration of hemoglobin in a given volume of packed red blood cells.",
    "neutrophil": "Primary immune first-responders that fight bacterial infections.",
    "lymphocyte": "Immune cells that recognize past viruses and produce targeted antibodies.",
    "monocyte": "Immune cells that clear dead cells and support tissue repair.",
    "eosinophil": "Immune cells involved in fighting parasites and managing allergic reactions.",
    "basophil": "Immune cells involved in inflammatory responses and histamine release.",
    "cholesterol": "A waxy lipid substance essential for building cells and producing hormones.",
    "ldl": "Often called 'bad cholesterol'; can accumulate along blood vessel walls over time.",
    "hdl": "Known as 'good cholesterol'; helps remove excess fats from arteries back to the liver.",
    "triglyceride": "A type of fat stored in your blood derived from extra calories and sugars.",
    "glucose": "Your body's primary immediate energy source from carbohydrates.",
    "sugar": "Your body's primary immediate energy source from carbohydrates.",
    "hba1c": "Shows your average blood sugar level over the past 2 to 3 months.",
    "creatinine": "A normal waste product from muscle breakdown, filtered out by healthy kidneys.",
    "urea": "Waste product from protein breakdown processed and cleared by kidneys.",
    "bun": "Blood Urea Nitrogen; monitors kidney function and fluid hydration balance.",
    "bilirubin": "Yellow pigment produced during the normal breakdown of red blood cells.",
    "sgpt": "An enzyme found mostly in liver cells; elevated when liver cells are irritated.",
    "alt": "An enzyme found mostly in liver cells; elevated when liver cells are irritated.",
    "sgot": "An enzyme found in liver and heart muscles; assists in metabolism.",
    "ast": "An enzyme found in liver and heart muscles; assists in metabolism.",
    "tsh": "Thyroid Stimulating Hormone; directs your thyroid gland how much hormone to produce.",
    "t3": "Active thyroid hormone regulating metabolism, energy, and temperature.",
    "t4": "Main thyroid hormone circulating in the blood, converted into active T3.",
    "calcium": "Essential mineral for bone strength, nerve signaling, and muscle contraction.",
    "sodium": "Electrolyte that balances body water volume, blood pressure, and nerves.",
    "potassium": "Electrolyte critical for healthy heart rhythm and muscle contraction.",
    "uric acid": "Waste product from breaking down purines found in certain foods.",
    "vitamin d": "Crucial vitamin for bone density, immune health, and calcium absorption.",
    "vitamin b12": "Essential vitamin for nerve function, brain health, and red blood cell creation."
}


def get_simple_explanation(name: str) -> str:
    name_clean = name.lower()
    for key, explanation in EXPLANATION_KB.items():
        if key in name_clean:
            return explanation
    return f"A routine clinical laboratory parameter measuring {name.strip()} levels in your specimen."


def evaluate_status(value_str: str, range_str: str) -> str:
    """Deterministically evaluate if a numeric value is normal, high, or low based purely on printed range."""
    if not range_str or not range_str.strip():
        return "UNKNOWN"

    try:
        # Extract numeric value
        num_match = re.search(r"[-+]?\d*\.?\d+", value_str)
        if not num_match:
            return "UNKNOWN"
        val = float(num_match.group(0))

        # Check for range: e.g. "12.0 - 15.5" or "12.0-15.5" or "12.0 to 15.5"
        range_match = re.search(r"(\d*\.?\d+)\s*(?:-|to)\s*(\d*\.?\d+)", range_str)
        if range_match:
            low_bound = float(range_match.group(1))
            high_bound = float(range_match.group(2))
            if val < low_bound:
                return "LOW"
            elif val > high_bound:
                return "HIGH"
            else:
                return "NORMAL"

        # Check for "< 200" or "<= 200"
        less_match = re.search(r"(?:<|<=)\s*(\d*\.?\d+)", range_str)
        if less_match:
            upper = float(less_match.group(1))
            return "HIGH" if val > upper else "NORMAL"

        # Check for "> 40" or ">= 40"
        greater_match = re.search(r"(?:>|>=)\s*(\d*\.?\d+)", range_str)
        if greater_match:
            lower = float(greater_match.group(1))
            return "LOW" if val < lower else "NORMAL"

    except Exception:
        pass

    return "UNKNOWN"


def deterministic_parse(raw_text: str) -> ReportAnalysis:
    """
    Robust rule-based parser that extracts explicit parameters from text
    WITHOUT inventing any missing values or reference ranges.
    """
    lines = raw_text.splitlines()
    parameters: List[ParameterItem] = []
    
    # Infer report title
    title = "Medical Laboratory Report"
    upper_text = raw_text.upper()
    if "COMPLETE BLOOD COUNT" in upper_text or "CBC" in upper_text or "HAEMOGRAM" in upper_text or "HEMOGRAM" in upper_text:
        title = "Complete Blood Count (CBC)"
    elif "LIPID" in upper_text or "CHOLESTEROL" in upper_text:
        title = "Lipid & Metabolic Profile"
    elif "LIVER" in upper_text or "LFT" in upper_text or "HEPATIC" in upper_text:
        title = "Liver Function Test (LFT)"
    elif "KIDNEY" in upper_text or "KFT" in upper_text or "RENAL" in upper_text:
        title = "Renal / Kidney Function Test"
    elif "THYROID" in upper_text or "TSH" in upper_text:
        title = "Thyroid Function Panel"

    # Line extraction regex patterns for lab test formats:
    # Matches patterns like:
    # "Hemoglobin 13.5 g/dL 12.0 - 15.5"
    # "Total Cholesterol | 218 | mg/dL | < 200"
    # "Platelets: 245 10^3/uL (150-450)"
    pattern = re.compile(
        r"^[\s\|\*\-]*([A-Za-z][A-Za-z0-9\s\(\)\/\-\,\.]+?)"       # Test Name
        r"[\s\|\:\=]+([0-9]+\.?[0-9]*)"                           # Result Value
        r"(?:\s*([a-zA-Z\/\%µ\^\*0-9]+))?"                        # Unit (optional)
        r"(?:[\s\|\(\[]+((?:[<>]|<=|>=)?\s*[0-9\.\s\-to]+[0-9\.]*))?", # Ref range (optional)
        re.IGNORECASE
    )

    seen_names = set()

    for line in lines:
        line_clean = line.strip()
        if not line_clean or len(line_clean) < 4:
            continue
            
        # Skip pure header rows
        if any(h in line_clean.lower() for h in ["test name", "investigation", "reference interval", "method", "page ", "doctor", "signature"]):
            continue

        match = pattern.search(line_clean)
        if match:
            raw_name = match.group(1).strip(" |:-")
            value = match.group(2).strip()
            unit = (match.group(3) or "").strip(" |()[]")
            ref_range = (match.group(4) or "").strip(" |()[]")

            # Validate name is realistic and not a sentence
            if len(raw_name) > 35 or len(raw_name) < 2 or raw_name.lower() in seen_names:
                continue
            # Exclude false positives like "Page 1" or "Date 12"
            if raw_name.lower().startswith(("page", "date", "sample", "report", "tel", "age", "phone")):
                continue

            seen_names.add(raw_name.lower())
            status = evaluate_status(value, ref_range)
            simple_exp = get_simple_explanation(raw_name)

            missing_notes = ""
            if not ref_range:
                missing_notes = "Reference range not specified on report"
            elif not unit:
                missing_notes = "Measurement unit omitted on source document"

            parameters.append(
                ParameterItem(
                    name=raw_name,
                    value=value,
                    unit=unit,
                    reference_range=ref_range, # strictly what is printed, empty if none
                    status=status,
                    simple_explanation=simple_exp,
                    missing_or_unclear_notes=missing_notes,
                    source_extracted=True
                )
            )

    # Key findings & questions
    normal_count = sum(1 for p in parameters if p.status == "NORMAL")
    attention_items = [p for p in parameters if p.status in ("HIGH", "LOW")]

    key_findings = []
    for item in attention_items[:4]:
        direction = "above" if item.status == "HIGH" else "below"
        range_note = f" (reference: {item.reference_range})" if item.reference_range else ""
        key_findings.append(f"{item.name} is {item.value} {item.unit}, which is {direction} the reference interval{range_note}.")

    if normal_count > 0:
        key_findings.append(f"{normal_count} parameter{'s' if normal_count > 1 else ''} measured within normal standard reference intervals.")

    if not key_findings:
        key_findings = ["Extracted parameters have been categorized against their printed laboratory reference ranges."]

    overview = (
        f"This document corresponds to a {title}. "
        f"We extracted {len(parameters)} test parameters from the document. "
        + (f"{len(attention_items)} parameter(s) appear outside normal reference thresholds." if attention_items else "Observed values are largely within expected ranges.")
    )

    questions = [
        "What clinical context do these specific results indicate in relation to my overall health?",
        "Are there any follow-up blood tests or confirmation screenings recommended?",
        "Do you recommend any temporary lifestyle, hydration, or dietary adjustments based on these numbers?"
    ]
    if attention_items:
        questions.insert(0, f"What might be contributing to my {attention_items[0].name} reading of {attention_items[0].value} {attention_items[0].unit}?")

    return ReportAnalysis(
        report_title=title,
        report_date="",
        patient_demographics="",
        overview_summary=overview,
        clarity_assessment="Standard clinical typography detected",
        is_clarity_issue=False,
        key_findings=key_findings,
        parameters=parameters,
        questions_for_doctor=questions[:4],
        lifestyle_notes=[
            "Maintain adequate daily hydration with clean water.",
            "Discuss any vitamin or mineral supplements with your doctor prior to starting."
        ],
        ai_engine_used="Deterministic Clinical Parser",
        medical_disclaimer="This summary is for educational purposes only and is not a medical diagnosis or treatment plan. Never disregard professional medical advice. Always consult a qualified healthcare professional with your original report.",
        extracted_text_preview=raw_text[:600] + ("..." if len(raw_text) > 600 else "")
    )


def process_report_analysis(raw_text: str) -> ReportAnalysis:
    """Orchestrate Gemini AI extraction or fallback to deterministic parser."""
    # Try Gemini if key is provided
    gemini_analysis = analyze_report_with_gemini(raw_text)
    if gemini_analysis and len(gemini_analysis.parameters) > 0:
        gemini_analysis.extracted_text_preview = raw_text[:600] + ("..." if len(raw_text) > 600 else "")
        return gemini_analysis

    # Fallback to deterministic parser
    return deterministic_parse(raw_text)
