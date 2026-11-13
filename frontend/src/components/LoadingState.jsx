import React, { useState, useEffect } from 'react';
import { Activity, Sparkles, FileSearch, CheckCircle2 } from 'lucide-react';

const STEPS = [
  "Inspecting document quality and extracting text parameters...",
  "Parsing test names, measured values, and reference ranges...",
  "Translating complex medical acronyms into plain language...",
  "Assembling educational insights and questions for your doctor..."
];

export default function LoadingState({ fileName, onCancel }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 700);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + 12;
      });
    }, 280);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-8 text-slate-100">
      {/* Animated Pulse Icon */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-3xl bg-sky-500/20 animate-ping" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-sky-500/30 font-bold">
          <Activity className="w-10 h-10 animate-pulse text-slate-950" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Processing Lab Report</span>
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight">
          Translating Your Medical Report
        </h3>
        {fileName && (
          <p className="text-xs text-slate-400 font-mono">
            Document: {fileName}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
        <div
          className="bg-gradient-to-r from-sky-500 to-teal-400 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stepper info */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/60 p-5 shadow-xl text-left space-y-3">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={idx}
              className={`flex items-center space-x-3 text-xs transition-opacity duration-200 ${
                isCurrent
                  ? "text-sky-300 font-semibold"
                  : isDone
                  ? "text-teal-400"
                  : "text-slate-500"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              ) : isCurrent ? (
                <div className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-200 underline"
        >
          Cancel analysis
        </button>
      )}
    </div>
  );
}
