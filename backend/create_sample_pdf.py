# Script to generate a valid PDF with text for testing
pdf_content = (
    b"%PDF-1.4\n"
    b"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
    b"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
    b"3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
    b"4 0 obj <</Length 360>> stream\n"
    b"BT\n"
    b"/F1 12 Tf\n"
    b"50 720 Td (CLINICAL PATHOLOGY LABORATORY REPORT) Tj\n"
    b"0 -25 Td (Patient: Adult 45y | Date: 12 Nov 2026) Tj\n"
    b"0 -30 Td (COMPLETE BLOOD COUNT & METABOLIC PANEL) Tj\n"
    b"0 -25 Td (Hemoglobin 11.2 g/dL 13.0 - 17.0) Tj\n"
    b"0 -20 Td (Total Leukocyte Count 7.2 10^3/uL 4.5 - 11.0) Tj\n"
    b"0 -20 Td (Platelet Count 230 10^3/uL 150 - 450) Tj\n"
    b"0 -20 Td (Fasting Blood Glucose 115 mg/dL 70 - 99) Tj\n"
    b"0 -20 Td (Total Cholesterol 224 mg/dL < 200) Tj\n"
    b"0 -20 Td (Triglycerides 185 mg/dL < 150) Tj\n"
    b"ET\n"
    b"endstream\n"
    b"endobj\n"
    b"5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n"
    b"xref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000244 00000 n\n0000000654 00000 n\n"
    b"trailer <</Size 6 /Root 1 0 R>>\nstartxref\n725\n%%EOF\n"
)

with open("backend/sample_lab_report.pdf", "wb") as f:
    f.write(pdf_content)

print("Generated backend/sample_lab_report.pdf successfully")
