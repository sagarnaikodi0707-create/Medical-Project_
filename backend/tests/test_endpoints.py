import io
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from starlette.testclient import TestClient
from app.main import app
import pypdf

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["project"] == "ReportSaathi"
    print("✓ Health check test passed")


def test_unsupported_file_type():
    file_content = b"This is a text file, not a lab report"
    response = client.post(
        "/api/reports/analyze",
        files={"file": ("report.txt", file_content, "text/plain")}
    )
    assert response.status_code == 415
    assert "Unsupported file format" in response.json()["detail"]
    print("✓ Unsupported file type validation test passed")


def test_empty_file():
    response = client.post(
        "/api/reports/analyze",
        files={"file": ("empty.pdf", b"", "application/pdf")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()
    print("✓ Empty file validation test passed")


def test_digital_pdf_cbc_extraction():
    # Create an in-memory PDF with pypdf
    writer = pypdf.PdfWriter()
    page = writer.add_blank_page(width=612, height=792)
    
    # We can write text to PDF via PageObject
    # Alternatively, use pypdf PageObject annotations or create simple PDF stream
    # Let's write standard PDF text stream
    pdf_content = (
        b"%PDF-1.4\n"
        b"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
        b"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
        b"3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
        b"4 0 obj <</Length 280>> stream\n"
        b"BT\n"
        b"/F1 12 Tf\n"
        b"50 700 Td (COMPLETE BLOOD COUNT REPORT) Tj\n"
        b"0 -25 Td (Hemoglobin 10.8 g/dL 12.0 - 15.5) Tj\n"
        b"0 -20 Td (RBC Count 4.10 million/uL 3.90 - 5.20) Tj\n"
        b"0 -20 Td (Platelet Count 245 10^3/uL 150 - 450) Tj\n"
        b"0 -20 Td (Total Leukocyte Count 6.8 10^3/uL 4.5 - 11.0) Tj\n"
        b"0 -20 Td (Mean Corpuscular Volume 76.4 fL 80.0 - 100.0) Tj\n"
        b"ET\n"
        b"endstream\n"
        b"endobj\n"
        b"5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n"
        b"xref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000244 00000 n\n0000000574 00000 n\n"
        b"trailer <</Size 6 /Root 1 0 R>>\nstartxref\n645\n%%EOF\n"
    )

    response = client.post(
        "/api/reports/analyze",
        files={"file": ("sample_cbc.pdf", pdf_content, "application/pdf")}
    )
    assert response.status_code == 200, f"Error: {response.text}"
    data = response.json()
    assert data["success"] is True
    analysis = data["analysis"]
    assert "Complete Blood Count" in analysis["report_title"]
    assert len(analysis["parameters"]) >= 3

    # Verify Hemoglobin was marked LOW without hallucination
    hb = next((p for p in analysis["parameters"] if "hemoglobin" in p["name"].lower()), None)
    assert hb is not None
    assert hb["value"] == "10.8"
    assert hb["status"] == "LOW"

    # Verify Platelets was marked NORMAL
    plt = next((p for p in analysis["parameters"] if "platelet" in p["name"].lower()), None)
    assert plt is not None
    assert plt["status"] == "NORMAL"

    print("✓ Digital PDF CBC analysis test passed")


if __name__ == "__main__":
    test_health_check()
    test_unsupported_file_type()
    test_empty_file()
    test_digital_pdf_cbc_extraction()
    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")
