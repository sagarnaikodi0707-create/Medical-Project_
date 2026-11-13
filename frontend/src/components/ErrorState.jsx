import React from 'react';
import { AlertOctagon, RotateCcw, Upload, FileText } from 'lucide-react';

export default function ErrorState({ errorMessage, onRetry, onUploadNew }) {
  return (
    <div className="max-w-md mx-auto py-14 px-4 text-center space-y-6 text-slate-100">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 shadow-xl">
        <AlertOctagon className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">Unable to Process Report</h3>
        <p className="text-sm text-slate-300 leading-relaxed font-light">
          {errorMessage || "We encountered an issue reading the uploaded document. The file may be password protected, blurry, or missing legible lab text."}
        </p>
      </div>

      <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 text-left text-xs text-amber-200 space-y-1.5 font-light">
        <p className="font-semibold text-amber-100">Quick Tips for Clean Scans:</p>
        <ul className="list-disc list-inside space-y-1 text-amber-200/90">
          <li>Ensure document is right-side up with adequate lighting.</li>
          <li>Make sure test names and numbers are not cropped or folded.</li>
          <li>PDF exports directly from diagnostic lab portals work best.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs transition shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span>Try Again</span>
          </button>
        )}

        <button
          onClick={onUploadNew}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900/80 text-slate-200 font-medium text-xs border border-slate-700 hover:bg-slate-800 transition"
        >
          <Upload className="w-4 h-4 text-teal-400" />
          <span>Select Another File</span>
        </button>
      </div>
    </div>
  );
}
