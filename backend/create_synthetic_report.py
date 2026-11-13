# Script to generate a synthetic report with missing reference intervals to test safe rules
pdf_content = (
    b"%PDF-1.4\n"
    b"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
    b"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
    b"3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
    b"4 0 obj <</Length 350>> stream\n"
    b"BT\n"
    b"/F1 12 Tf\n"
    b"50 720 Td (SYNTHETIC CLINICAL TRIAL PATHOLOGY REPORT) Tj\n"
    b"0 -25 Td (Investigation Result Unit Reference Range) Tj\n"
    b"0 -25 Td (Hemoglobin 13.8 g/dL 13.0 - 17.0) Tj\n"
    b"0 -20 Td (Platelet Count 210 10^3/uL 150 - 450) Tj\n"
    b"0 -20 Td (Vitamin D 18 ng/mL) Tj\n"
    b"0 -20 Td (Erythrocyte Sedimentation Rate 24 mm/hr) Tj\n"
    b"0 -20 Td (Serum Creatinine 0.9 mg/dL 0.7 - 1.3) Tj\n"
    b"ET\n"
    b"endstream\n"
    b"endobj\n"
    b"5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n"
    b"xref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000244 00000 n\n0000000644 00000 n\n"
    b"trailer <</Size 6 /Root 1 0 R>>\nstartxref\n715\n%%EOF\n"
)

with open("backend/synthetic_test_report.pdf", "wb") as f:
    f.write(pdf_content)

print("Created backend/synthetic_test_report.pdf")
