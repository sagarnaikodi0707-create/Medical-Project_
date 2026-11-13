import React from 'react';
import { ShieldAlert, AlertTriangle, X, CheckCircle, Info } from 'lucide-react';

export default function DisclaimerBanner({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Close disclaimer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 text-amber-400 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Educational Medical Disclaimer</h3>
            <p className="text-xs text-amber-300 font-medium">Important Patient Safety Information</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-300 leading-relaxed font-light">
          <p>
            <strong className="text-white">ReportSaathi is an educational health-literacy tool</strong> designed solely to help patients understand complex medical terminology and reference ranges in simple language.
          </p>

          <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3.5 space-y-2">
            <div className="flex items-start space-x-2 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-100">Not Medical Advice:</strong> The explanations generated are not a medical diagnosis, clinical evaluation, prognosis, or prescription for treatment.
              </span>
            </div>
            <div className="flex items-start space-x-2 text-xs text-amber-200">
              <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-100">Always Consult a Doctor:</strong> Please share your original laboratory report with a certified medical doctor or healthcare provider before making any healthcare decisions.
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Reference intervals vary across pathology laboratories depending on testing equipment, reagent assays, and demographics. Always refer to the reference range printed on your laboratory's original certificate.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-slate-950 font-bold text-sm hover:from-sky-400 hover:to-teal-400 transition shadow-lg"
          >
            I Understand &amp; Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
