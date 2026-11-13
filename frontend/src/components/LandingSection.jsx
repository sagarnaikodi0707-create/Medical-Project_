import React from 'react';
import { 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle, 
  CheckCircle2, 
  HeartPulse, 
  BookOpen, 
  Activity,
  Eye,
  Microscope,
  FileSearch,
  MessageSquare
} from 'lucide-react';

export default function LandingSection({ onStartUpload, onLoadSampleReport }) {
  return (
    <div className="space-y-16 py-6 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 sm:p-14 shadow-2xl">
        <div className="max-w-3xl space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-950/70 text-sky-300 text-xs font-semibold tracking-wider uppercase border border-sky-800/60">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Setting New Standards in Patient Understanding</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Medical lab reports, explained in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-cyan-200">
              clear plain language.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light max-w-2xl">
            ReportSaathi translates complex clinical pathology abbreviations, numeric indicators, and reference ranges into structured, patient-friendly insights so you can have informed, confident discussions with your physician.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <button
              onClick={onStartUpload}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-teal-400 transition active:scale-95"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>Upload Lab Report (PDF / Image)</span>
            </button>

            <button
              onClick={() => onLoadSampleReport('cbc-demo-01')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800/80 text-slate-100 font-semibold text-sm border border-slate-700 hover:bg-slate-700/80 transition shadow-sm"
            >
              <Eye className="w-4 h-4 text-sky-400" />
              <span>Explore Demo (CBC Report)</span>
            </button>
          </div>

          {/* Quick Demo selector */}
          <div className="pt-2 flex items-center space-x-2 text-xs text-slate-400">
            <span>Or test with:</span>
            <button
              onClick={() => onLoadSampleReport('lipid-demo-02')}
              className="underline text-sky-400 hover:text-sky-300 font-medium"
            >
              Lipid &amp; Glucose Profile Demo &rarr;
            </button>
          </div>

          {/* Clinical safety note */}
          <div className="pt-4 flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Strictly educational &bull; Zero medical diagnosis &bull; Always consult your healthcare provider</span>
          </div>
        </div>
      </section>

      {/* 3 Step Meridian-Style Process Cards (Inspired by Reference Design) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">Clinical Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">How ReportSaathi Works</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Three simple steps from complex pathology printouts to actionable patient clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div 
            onClick={onStartUpload}
            className="group relative bg-slate-900/75 backdrop-blur-md rounded-2xl border border-slate-700/60 p-6 hover:border-sky-500/50 hover:bg-slate-800/80 transition-all cursor-pointer shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                <FileSearch className="w-6 h-6" />
              </div>
              <span className="text-2xl font-light text-slate-500 font-mono">1</span>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition">
                Document Ingestion
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Upload digital pathology PDFs or clear camera photos of your blood tests, metabolic panels, or urine exams.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => onLoadSampleReport('cbc-demo-01')}
            className="group relative bg-slate-900/75 backdrop-blur-md rounded-2xl border border-slate-700/60 p-6 hover:border-teal-500/50 hover:bg-slate-800/80 transition-all cursor-pointer shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <Microscope className="w-6 h-6" />
              </div>
              <span className="text-2xl font-light text-slate-500 font-mono">2</span>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition">
                Biomarker Extraction
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Key lab parameters, measurement units, and reference ranges are cross-referenced against standard intervals.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => onLoadSampleReport('lipid-demo-02')}
            className="group relative bg-slate-900/75 backdrop-blur-md rounded-2xl border border-slate-700/60 p-6 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all cursor-pointer shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-2xl font-light text-slate-500 font-mono">3</span>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                Doctor Consultation Guide
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Receive plain-language summaries and 3 to 5 targeted questions to ask your physician during your visit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 sm:p-12 space-y-8 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">Educational Architecture</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Designed for patient comprehension &amp; clinical responsibility
          </h2>
          <p className="text-sm text-slate-300">
            Bridging the gap between medical test data and patient peace-of-mind.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-950 text-sky-400 border border-sky-800/60 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Jargon Demystified</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Clear translations of clinical terminology like MCV, MCH, SGPT, and eGFR into plain, digestible terms.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-950 text-teal-400 border border-teal-800/60 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Reference Ranges Decoded</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Visual status badges for normal, elevated, or low parameters without inducing premature anxiety.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Doctor Consultation Prep</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Personalized questions tailored to your exact findings so you maximize your time with your doctor.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
