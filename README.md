# ReportSaathi (रिपोर्ट साथी)
### Plain-Language Clinical Laboratory Report Interpretation for Educational Health Literacy

ReportSaathi is an educational web application that translates complex clinical diagnostic reports (Complete Blood Count, Lipid Profile, Renal Function, Liver Function, etc.) into accessible, non-diagnostic, plain-language insights. It empowers patients to ask informed questions during consultations with their healthcare professionals without making clinical diagnoses or prescribing medications.

---

## 🏗️ Architecture & Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
* **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2
* **Extraction Engine**: `pdfplumber`, `pypdf`, `Pillow`, Tesseract OCR (with vision multimodal fallbacks)
* **AI Engine**: Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`) via `google-genai` SDK
* **Database (Opt-in)**: Supabase PostgreSQL with strict Row Level Security (RLS)
* **Telegram Integration**: Optional background Telegram bot (`python-telegram-bot`)

---

## 🔒 Privacy & Clinical Safety Architecture

1. **Strict Educational Boundary**: Never diagnoses diseases or claims clinical certainty.
2. **Fact vs Explanation Separation**: Displays source numerical laboratory values and printed reference ranges separately from AI explanations.
3. **No Unstated Reference Ranges**: Missing reference ranges are flagged as `UNKNOWN` rather than guessed or fabricated.
4. **Zero Raw File Storage**: Uploaded PDF/image files and raw OCR transcripts are processed in memory or ephemeral temporary directories and are deleted immediately upon completion.
5. **Report-Specific Chat**: Chat answers are grounded exclusively in the uploaded report's extracted parameters. Questions outside the report boundary are safely declined.

---

## ⚙️ Environment Variables Specification

### Backend Configuration (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:

```env
# Server
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]

# Google Gemini API (Get key from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# OCR Configuration (Optional for Windows local installations)
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe

# Supabase Configuration (Optional - for user accounts & report history)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_public_key

# Telegram Bot (Optional - obtained from @BotFather on Telegram)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

### Frontend Configuration (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:

```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8000

# Supabase Auth & Storage (Optional - leave blank for Guest Demo Mode)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

> ⚠️ **Security Warning**: Never commit `.env` files to source control. Only commit `.env.example` templates.

---

## 💻 Local Setup & Development

### 1. Prerequisites
* **Node.js**: v18+ and `npm`
* **Python**: v3.11+
* *(Optional)* Tesseract OCR for Windows/Linux or a valid `GEMINI_API_KEY` for vision-based OCR.

### 2. Backend Setup
```bash
# Navigate to workspace root
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows activation:
.venv\Scripts\activate
# macOS/Linux activation:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Interactive API Documentation (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* Health Check Endpoint: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 3. Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Install packages
npm install

# Run Vite development server
npm run dev
```
* App URL: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Testing & Quality Assurance

### Run Frontend Production Build Check
```bash
cd frontend
npm run build
```

### Run Backend Unit & QA Test Suite
```bash
python backend/tests/test_qa_units.py
```

### Run Synthetic PDF Analysis Integration
You can upload either `backend/sample_lab_report.pdf` or `backend/synthetic_test_report.pdf` directly through the UI or using `curl`:
```bash
curl -X POST "http://127.0.0.1:8000/api/reports/analyze" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@backend/sample_lab_report.pdf;type=application/pdf"
```

---

## 🚀 Production Deployment Instructions

### 1. Backend Deployment on Render (FastAPI)
1. **Create Web Service**:
   * Connect your GitHub repository: `https://github.com/sagarnaikodi0707-create/Medical-Project_`.
   * **Root Directory**: `backend`
   * **Environment**: `Python`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
2. **Environment Variables on Render**:
   * `ENVIRONMENT`: `production`
   * `CORS_ORIGINS`: `["https://your-frontend.pages.dev"]` *(Update once Cloudflare domain is active)*
   * `GEMINI_API_KEY`: `your_production_gemini_key`
   * `SUPABASE_URL`: `your_supabase_url`
   * `SUPABASE_KEY`: `your_supabase_anon_key`
3. **Health Check Path**:
   * Set health check path to `/api/health`.

### 2. Frontend Deployment on Cloudflare Pages (React + Vite)
1. **Create Project**:
   * Connect your GitHub repository in Cloudflare Pages.
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Build Output Directory**: `dist`
   * **Root Directory**: `frontend`
2. **Environment Variables on Cloudflare Pages**:
   * `VITE_API_BASE_URL`: `https://your-render-service.onrender.com`
   * `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   * `VITE_SUPABASE_ANON_KEY`: `your_supabase_anon_key`
3. **Finish CORS Configuration**:
   * Once Cloudflare assigns your `*.pages.dev` URL, update the `CORS_ORIGINS` variable on Render to match and trigger a redeploy of the backend.

---

## 📋 Pre-Launch QA Checklist & Known Limitations

### Pre-Launch Checklist
- [x] Input file validation (PDF, JPG, PNG accepted; other formats rejected with HTTP 415).
- [x] File size enforcement (Strict 10MB cutoff on frontend and backend).
- [x] No sensitive patient files or raw OCR text stored in database.
- [x] Deterministic fallback parses clinical parameters when AI keys are unconfigured.
- [x] Chat system refuses questions outside the provided report context.
- [x] Persistent medical disclaimers on results screen, chat drawer, and Telegram bot.
- [x] Responsive design checked across mobile, tablet, and desktop breakpoints.

### Remaining System Limitations
1. **Handwritten Prescriptions / Notes**: The system is tuned for structured laboratory reports. Freehand doctor prescriptions or cursive notes may yield low OCR clarity.
2. **Multi-page Scanned PDFs without Tesseract**: If a user uploads a high-resolution scanned PDF with no digital text and neither Tesseract nor Gemini Vision API is configured, the system flags the clarity issue and requests a digital report or clinical consultation.
3. **Render Free Tier Cold Starts**: When deploying the backend on Render's free tier, initial requests after 15 minutes of inactivity may take 30–50 seconds to warm up.
