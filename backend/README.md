# ReportSaathi Backend API

Python FastAPI service that ingests medical laboratory reports (PDF, JPG, PNG), extracts clinical parameters via digital parsing and OCR, and generates plain-language educational explanations with doctor consultation questions.

---

## Architecture & Endpoints

- `GET /api/health`: Health check and system capability status (Gemini, Tesseract, Supabase).
- `POST /api/reports/analyze`: Multipart file upload endpoint.
  - Accepts: `.pdf`, `.jpg`, `.jpeg`, `.png`
  - Maximum size: 10 MB
  - Output: Structured JSON with extracted text, biomarkers, units, reference intervals, status (`NORMAL`, `HIGH`, `LOW`, `UNKNOWN`), plain-language explanations, and consultation questions.

---

## Local Setup Instructions

### 1. Create Virtual Environment
```powershell
cd d:\AntigravityIDE\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```ini
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]

# Optional: Google Gemini API Key (https://aistudio.google.com/)
GEMINI_API_KEY=

# Optional: Path to Tesseract OCR executable on Windows
TESSERACT_CMD=
```

### 4. Run the API Server
```powershell
.\.venv\Scripts\python.exe -u -m uvicorn app.main:app --port 8000 --app-dir backend --host 127.0.0.1
```

- Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
