import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveReportRecord } from '../lib/historyService';
import ReportChatWidget from './ReportChatWidget';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  Printer, 
  Share2, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  ArrowLeft,
  Sparkles,
  Info,
  Calendar,
  User,
  HeartHandshake,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  Cloud,
  CloudOff
} from 'lucide-react';

export default function ResultsView({ report, onUploadNew, onOpenDisclaimer, onOpenAuth }) {
  const { user, isConfigured } = useAuth();
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, ATTENTION, NORMAL
  const [expandedId, setExpandedId] = useState(null);
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);

  if (!report) return null;

  const normalCount = report.parameters.filter(p => p.status === 'NORMAL').length;
  const attentionCount = report.parameters.filter(p => p.status !== 'NORMAL').length;

  const filteredParameters = report.parameters.filter((param) => {
    if (activeFilter === 'ATTENTION') return param.status !== 'NORMAL';
    if (activeFilter === 'NORMAL') return param.status === 'NORMAL';
    return true;
  });

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleCopyQuestion = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIdx(idx);
    setTimeout(() => setCopiedQuestionIdx(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveReport = async () => {
    setSaveLoading(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      const result = await saveReportRecord(report, user);
      setIsSaved(true);
      if (result.isCloudSynced) {
        setSaveMessage("Saved to Supabase with Row Level Security!");
      } else {
        setSaveMessage(
          isConfigured && !user
            ? "Saved to local session. Sign in to sync across devices."
            : "Saved to local browser session (Demo Mode &mdash; Supabase not configured in .env)."
        );
      }
    } catch (err) {
      console.error(err);
      setSaveError(err.message || "Failed to save report.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 text-slate-100 print:text-slate-900 print:py-0 print:space-y-4">
      {/* Top action toolbar (hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <button
          onClick={onUploadNew}
          className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/60 backdrop-blur-md hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400" />
          <span>Upload Another Report</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Save to History Button (Opt-in) */}
          <button
            onClick={handleSaveReport}
            disabled={saveLoading || isSaved}
            className={`inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-lg border transition shadow-xs ${
              isSaved
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-500 cursor-pointer'
            }`}
          >
            {saveLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <Bookmark className="w-4 h-4 text-white" />
            )}
            <span>{isSaved ? "Saved to History" : "Save Summary"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-slate-200 bg-slate-900/60 backdrop-blur-md hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Save Status & Privacy Feedback */}
      {saveMessage && (
        <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-2xl p-3.5 flex items-center justify-between text-xs text-emerald-200 animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: saveMessage }} />
          </div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            {user ? "Cloud Synced (RLS)" : "Local Storage"}
          </span>
        </div>
      )}

      {saveError && (
        <div className="bg-red-950/60 border border-red-800 rounded-2xl p-3.5 flex items-center space-x-2 text-xs text-red-200 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Mandatory Prominent Disclaimer Banner */}
      <div className="bg-amber-950/60 backdrop-blur-md border border-amber-800/80 rounded-2xl p-4 sm:p-5 flex items-start space-x-3 text-amber-200 shadow-xl">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm space-y-1 flex-1">
          <p className="font-bold text-amber-100">Educational Summary Only &mdash; Not a Medical Diagnosis</p>
          <p className="text-amber-200/90 leading-relaxed font-light">
            This guide is synthesized for patient health literacy. Reference ranges differ across pathology laboratories. 
            <strong> Always discuss these findings with your qualified physician</strong> before starting, altering, or stopping any medication or diet.
          </p>
        </div>
        <button
          onClick={onOpenDisclaimer}
          className="text-xs font-semibold text-amber-300 underline flex-shrink-0 hover:text-amber-100 hidden sm:block"
        >
          Details
        </button>
      </div>

      {/* Report Header Card */}
      <div className="bg-slate-900/75 backdrop-blur-xl rounded-3xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-sky-950/80 text-sky-300 text-xs font-semibold border border-sky-800/60">
                <FileText className="w-3.5 h-3.5" />
                <span>{report.category || 'Clinical Pathology'}</span>
              </span>
              {report.aiEngineUsed && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-teal-950/80 text-teal-300 text-xs font-semibold border border-teal-800/60">
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  <span>{report.aiEngineUsed}</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {report.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {report.reportDate && (
              <span className="flex items-center space-x-1 bg-slate-800/70 px-2.5 py-1 rounded-lg border border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{report.reportDate}</span>
              </span>
            )}
            {report.patientInfo && (
              <span className="flex items-center space-x-1 bg-slate-800/70 px-2.5 py-1 rounded-lg border border-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{report.patientInfo}</span>
              </span>
            )}
          </div>
        </div>

        {/* High-Level Overview Summary */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Plain-Language Overview</span>
          </div>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 font-light">
            {report.summary}
          </p>
        </div>

        {/* Key Findings Bulletins */}
        {report.keyFindings && report.keyFindings.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Highlights at a Glance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.keyFindings.map((finding, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start space-x-2.5 text-xs sm:text-sm text-slate-200 font-light"
                >
                  <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                  <span>{finding}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Parameter Breakdown Section */}
      <div className="bg-slate-900/75 backdrop-blur-xl rounded-3xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Extracted Biomarkers &amp; Reference Values
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare your observed numbers against standard clinical reference intervals.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeFilter === 'ALL'
                  ? 'bg-slate-700 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({report.parameters.length})
            </button>
            <button
              onClick={() => setActiveFilter('ATTENTION')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeFilter === 'ATTENTION'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              Attention ({attentionCount})
            </button>
            <button
              onClick={() => setActiveFilter('NORMAL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeFilter === 'NORMAL'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              Normal ({normalCount})
            </button>
          </div>
        </div>

        {/* Parameter List */}
        <div className="space-y-3">
          {filteredParameters.map((param) => {
            const isExpanded = expandedId === param.id;
            const isNormal = param.status === 'NORMAL';
            const isHigh = param.status === 'HIGH';
            const isLow = param.status === 'LOW';

            return (
              <div
                key={param.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? 'border-sky-500/60 bg-slate-800/90 shadow-lg'
                    : isNormal
                    ? 'border-slate-800 bg-slate-800/50 hover:border-slate-700'
                    : 'border-amber-700/60 bg-amber-950/20 hover:border-amber-600/80'
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(param.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                        isNormal
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                          : isHigh
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                          : 'bg-sky-950/60 text-sky-400 border-sky-800/60'
                      }`}
                    >
                      {isNormal ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isHigh ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm sm:text-base">
                  {param.name}
                </span>
                {param.category && (
                  <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                    &bull; {param.category}
                  </span>
                )}
                {param.sourceExtracted && (
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 hidden md:inline">
                    Source Factual Data
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard Reference:{' '}
                {param.referenceRange ? (
                  <span className="font-medium text-slate-200">{param.referenceRange} {param.unit}</span>
                ) : (
                  <span className="italic text-amber-400/90">Not specified on report</span>
                )}
              </p>
              {param.missingOrUnclearNotes && (
                <p className="text-[10px] text-amber-400/90 mt-1 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400 inline flex-shrink-0" />
                  <span>{param.missingOrUnclearNotes}</span>
                </p>
              )}
            </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 pl-12 sm:pl-0">
                    <div className="text-right">
                      <div className="flex items-baseline space-x-1 sm:justify-end">
                        <span className="text-lg font-extrabold text-white font-mono">
                          {param.value}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {param.unit}
                        </span>
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                          isNormal
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                            : isHigh
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                            : 'bg-sky-950/80 text-sky-300 border-sky-800/60'
                        }`}
                      >
                        {param.status === 'NORMAL' ? 'Normal' : param.status === 'HIGH' ? 'Elevated' : 'Low'}
                      </span>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Plain-Language Explanation */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-700/60 text-xs sm:text-sm space-y-3 animate-in fade-in duration-150">
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-sky-400 font-semibold text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                          <span>AI Educational Interpretation (Layperson Translation):</span>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                          Educational Only
                        </span>
                      </div>
                      <p className="text-slate-200 leading-relaxed font-light">
                        {param.simpleExplanation}
                      </p>
                    </div>

                    {param.missingOrUnclearNotes && (
                      <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs font-light flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-100">Reporting Clarity Note: </strong>
                          {param.missingOrUnclearNotes}. Discuss this marker with your clinician if reference intervals are needed.
                        </div>
                      </div>
                    )}

                    {param.lifestyleContext && (
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs font-light">
                        <strong className="text-white">Educational context: </strong>
                        {param.lifestyleContext}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Questions for Your Doctor Checklist */}
      {report.questionsForDoctor && report.questionsForDoctor.length > 0 && (
        <div className="bg-slate-900/75 backdrop-blur-xl rounded-3xl border border-indigo-900/60 p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-400 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Recommended Questions for Your Doctor
              </h3>
              <p className="text-xs text-slate-300">
                Print or copy these questions to have an empowered consultation with your physician.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {report.questionsForDoctor.map((question, idx) => (
              <div
                key={idx}
                className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/70 flex items-start justify-between space-x-3 text-xs sm:text-sm text-slate-200 shadow-xs group"
              >
                <div className="flex items-start space-x-2.5">
                  <span className="font-bold text-sky-400 mt-0.5">{idx + 1}.</span>
                  <span className="leading-relaxed font-light">{question}</span>
                </div>
                <button
                  onClick={() => handleCopyQuestion(question, idx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-700/60 transition flex-shrink-0"
                  title="Copy question"
                >
                  {copiedQuestionIdx === idx ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Lifestyle & Nutrition Educational Notes */}
      {report.generalAdvice && report.generalAdvice.length > 0 && (
        <div className="bg-slate-900/75 backdrop-blur-xl rounded-3xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl space-y-3">
          <h4 className="text-sm font-bold text-white">General Non-Prescriptive Educational Habits</h4>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 list-disc list-inside font-light">
            {report.generalAdvice.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="text-center pt-4 print:hidden">
        <button
          onClick={onUploadNew}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-sm transition shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400" />
          <span>Explain Another Lab Document</span>
        </button>
      </div>

      {/* Report Chat Widget - floating bottom-right */}
      <ReportChatWidget report={report} />
    </div>
  );
}
