import React from 'react';
import { FileQuestion, Upload, Eye, Sparkles } from 'lucide-react';

export default function EmptyState({ onUploadClick, onLoadSample }) {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6 text-slate-100">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-slate-400 shadow-xl">
        <FileQuestion className="w-10 h-10 text-slate-400" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">No Lab Report Loaded Yet</h3>
        <p className="text-sm text-slate-300 leading-relaxed font-light">
          Upload your PDF or image report to generate a plain-language summary, or explore one of our realistic clinical demo reports right now.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onUploadClick}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md hover:from-sky-400 hover:to-teal-400 transition"
        >
          <Upload className="w-4 h-4 text-slate-950" />
          <span>Upload Lab Report</span>
        </button>

        <button
          onClick={() => onLoadSample('cbc-demo-01')}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800/80 text-slate-200 font-medium text-xs border border-slate-700 hover:bg-slate-700 transition"
        >
          <Eye className="w-4 h-4 text-sky-400" />
          <span>Load Demo CBC</span>
        </button>
      </div>
    </div>
  );
}
