import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingSection from './components/LandingSection';
import UploadZone from './components/UploadZone';
import LoadingState from './components/LoadingState';
import ResultsView from './components/ResultsView';
import EmptyState from './components/EmptyState';
import ErrorState from './components/ErrorState';
import DisclaimerBanner from './components/DisclaimerBanner';
import HistoryDrawer from './components/HistoryDrawer';
import AuthModal from './components/AuthModal';
import { SAMPLE_REPORTS } from './data/sampleReports';
import { uploadReport } from './lib/api';
import { ShieldCheck, Info, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing'); // 'landing', 'upload', 'results'
  const [processingState, setProcessingState] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [currentReport, setCurrentReport] = useState(null);
  const [currentFileName, setCurrentFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [disclaimerModalOpen, setDisclaimerModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  // Load a demo clinical report
  const handleLoadSampleReport = (sampleId) => {
    const found = SAMPLE_REPORTS.find(r => r.id === sampleId) || SAMPLE_REPORTS[0];
    setCurrentFileName(`Clinical-Demo-${found.category}.pdf`);
    setProcessingState('loading');
    setActiveTab('results');

    setTimeout(() => {
      setCurrentReport(found);
      setProcessingState('success');
    }, 1200);
  };

  // Process an uploaded file via Python FastAPI Backend
  const handleProcessFile = async (file) => {
    setCurrentFileName(file.name);
    setProcessingState('loading');
    setActiveTab('results');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Call backend POST /api/reports/analyze
      const res = await uploadReport(formData);

      if (res && res.success && res.analysis) {
        const analysis = res.analysis;
        const mappedReport = {
          id: `report-${Date.now()}`,
          title: analysis.report_title || `${file.name}`,
          category: 'Clinical Analysis',
          reportDate: analysis.report_date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          patientInfo: analysis.patient_demographics || 'Patient Lab Report',
          summary: analysis.overview_summary,
          clarityAssessment: analysis.clarity_assessment || 'Legible report text',
          isClarityIssue: Boolean(analysis.is_clarity_issue),
          aiEngineUsed: analysis.ai_engine_used || 'Gemini API',
          keyFindings: analysis.key_findings || [],
          parameters: (analysis.parameters || []).map((p, idx) => ({
            id: `p-${idx}`,
            name: p.name,
            value: p.value,
            unit: p.unit || '',
            referenceRange: p.reference_range || '',
            status: p.status || 'NORMAL',
            category: 'Biomarker',
            simpleExplanation: p.simple_explanation || 'A standard clinical test parameter.',
            missingOrUnclearNotes: p.missing_or_unclear_notes || '',
            sourceExtracted: p.source_extracted !== false,
            lifestyleContext: ''
          })),
          questionsForDoctor: analysis.questions_for_doctor || [],
          generalAdvice: analysis.lifestyle_notes || []
        };
        setCurrentReport(mappedReport);
        setProcessingState('success');
      } else {
        throw new Error('Analysis response was empty.');
      }
    } catch (err) {
      console.error('API Error:', err);
      const detail = err.response?.data?.detail || err.message || 'Unable to process document. Please check that the file is not corrupted or password-protected.';
      setErrorMessage(detail);
      setProcessingState('error');
    }
  };

  const handleStartUpload = () => {
    setActiveTab('upload');
  };

  const handleUploadNew = () => {
    setCurrentReport(null);
    setProcessingState('idle');
    setActiveTab('upload');
  };

  const handleRetry = () => {
    setProcessingState('idle');
    setActiveTab('upload');
  };

  // Load a report selected from history
  const handleSelectFromHistory = (historyRecord) => {
    if (!historyRecord) return;
    setCurrentReport(historyRecord);
    setCurrentFileName(historyRecord.fileName || historyRecord.title || 'History Report');
    setProcessingState('success');
    setActiveTab('results');
    setHistoryOpen(false);
  };

  return (
    <div 
      className="min-h-screen text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-slate-950 relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(11, 19, 41, 0.86), rgba(15, 23, 42, 0.82), rgba(11, 19, 41, 0.94)), url('/assets/hospital-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenDisclaimer={() => setDisclaimerModalOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Connected Notice Banner */}
      <div className="bg-sky-950/80 backdrop-blur-md text-sky-200 border-b border-sky-800/50 text-xs py-2 px-4 text-center font-medium shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-sky-400" />
          <span>
            <strong className="text-white">FastAPI Backend Connected:</strong> Real-time PDF parsing, Tesseract/OCR engine &amp; educational report interpretation active on port 8000.
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Landing Page View */}
        {activeTab === 'landing' && (
          <LandingSection
            onStartUpload={handleStartUpload}
            onLoadSampleReport={handleLoadSampleReport}
          />
        )}

        {/* Upload Action View */}
        {activeTab === 'upload' && (
          <UploadZone
            onProcessFile={handleProcessFile}
            onLoadSampleReport={handleLoadSampleReport}
          />
        )}

        {/* Results / Processing View */}
        {activeTab === 'results' && (
          <>
            {processingState === 'loading' && (
              <LoadingState
                fileName={currentFileName}
                onCancel={() => {
                  setProcessingState('idle');
                  setActiveTab('upload');
                }}
              />
            )}

            {processingState === 'error' && (
              <ErrorState
                errorMessage={errorMessage}
                onRetry={handleRetry}
                onUploadNew={handleUploadNew}
              />
            )}

            {processingState === 'success' && currentReport && (
              <ResultsView
                report={currentReport}
                onUploadNew={handleUploadNew}
                onOpenDisclaimer={() => setDisclaimerModalOpen(true)}
              />
            )}

            {processingState === 'idle' && !currentReport && (
              <EmptyState
                onUploadClick={handleStartUpload}
                onLoadSample={handleLoadSampleReport}
              />
            )}
          </>
        )}
      </main>

      {/* Global Safety Modal */}
      <DisclaimerBanner
        isOpen={disclaimerModalOpen}
        onClose={() => setDisclaimerModalOpen(false)}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectReport={handleSelectFromHistory}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-950/85 backdrop-blur-md border-t border-slate-800 py-8 mt-12 print:hidden text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strictly Educational Health Literacy Service &mdash; Never disregard professional medical advice</span>
          </div>
          <p className="text-xs text-slate-500">
            ReportSaathi &copy; {new Date().getFullYear()} &bull; FastAPI + React + Vite + Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}
