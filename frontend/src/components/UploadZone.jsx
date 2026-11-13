import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Sparkles,
  Shield,
  FileCheck2
} from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export default function UploadZone({ onProcessFile, onLoadSampleReport }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndSetFile = (file) => {
    setValidationError(null);

    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setValidationError("Unsupported file format. Please upload a PDF, JPG, or PNG file.");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError("File is too large. Maximum allowed file size is 10 MB.");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError("Please select or drop a file first.");
      return;
    }
    onProcessFile(selectedFile);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 text-slate-100">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">
          Document Intake
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Upload Your Medical Laboratory Report
        </h2>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Upload your blood test, lipid panel, thyroid, or metabolic report in PDF or image format.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="bg-slate-900/75 backdrop-blur-xl rounded-3xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl space-y-6">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            dragActive
              ? "border-sky-400 bg-sky-950/40 scale-[1.01]"
              : selectedFile
              ? "border-teal-500/60 bg-teal-950/20"
              : "border-slate-700 hover:border-sky-500/60 hover:bg-slate-800/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={handleChange}
          />

          {!selectedFile ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 shadow-inner">
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-white">
                  Click to select or drag and drop your report here
                </p>
                <p className="text-xs text-slate-400">
                  Supported formats: <strong className="font-medium text-slate-200">PDF, JPG, PNG</strong> (Max 10 MB)
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium text-xs transition"
                >
                  Browse Files
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-left">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-12 h-12 rounded-lg bg-teal-950 border border-teal-800/60 flex items-center justify-center text-teal-400 flex-shrink-0">
                    {selectedFile.type.includes('pdf') ? (
                      <FileText className="w-6 h-6" />
                    ) : (
                      <ImageIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB &bull; {selectedFile.type.toUpperCase() || 'DOCUMENT'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={removeFile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition ml-2 flex-shrink-0"
                  title="Remove selected file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {previewUrl && (
                <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-700 max-h-48 flex justify-center bg-slate-950">
                  <img src={previewUrl} alt="Report preview" className="object-contain max-h-48" />
                </div>
              )}

              <div className="flex items-center justify-center space-x-2 text-xs text-teal-400 font-medium">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Document validated and ready for educational interpretation</span>
              </div>
            </div>
          )}
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="flex items-start space-x-3 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Validation Alert:</span> {validationError}
            </div>
            <button onClick={() => setValidationError(null)} className="text-red-400 hover:text-red-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={!selectedFile}
            className={`w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl font-bold text-sm transition shadow-lg ${
              selectedFile
                ? "bg-gradient-to-r from-sky-500 to-teal-500 text-slate-950 hover:from-sky-400 hover:to-teal-400 shadow-sky-500/20 cursor-pointer active:scale-[0.99]"
                : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Explain Lab Report in Plain Language</span>
          </button>
        </div>

        {/* Privacy Note & One-Click PDF Tester */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Educational demonstration only. Private names or addresses are not retained.</span>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch('/sample_lab_report.pdf');
                const blob = await res.blob();
                const testFile = new File([blob], 'Sample_Clinical_CBC_Report.pdf', { type: 'application/pdf' });
                onProcessFile(testFile);
              } catch (e) {
                console.error(e);
              }
            }}
            className="text-xs text-sky-400 hover:text-sky-300 underline font-medium"
          >
            Test Real Backend Upload with Sample PDF &rarr;
          </button>
        </div>
      </div>

      {/* Alternative: Instant Demo Reports */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/60 p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Instant Exploration
          </span>
          <span className="text-xs text-slate-400">No file required to test</span>
        </div>
        <p className="text-xs text-slate-300">
          Explore how ReportSaathi interprets lab values with realistic clinical samples:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => onLoadSampleReport('cbc-demo-01')}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-sky-400 hover:bg-slate-800 text-left transition group"
          >
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-sky-300">
                Sample 1: Complete Blood Count (CBC)
              </p>
              <p className="text-[11px] text-slate-400">Hemoglobin, Platelets, MCV &amp; White Blood Cells</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-400 group-hover:translate-x-0.5 transition" />
          </button>

          <button
            onClick={() => onLoadSampleReport('lipid-demo-02')}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-teal-400 hover:bg-slate-800 text-left transition group"
          >
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-teal-300">
                Sample 2: Lipid &amp; Fasting Glucose
              </p>
              <p className="text-[11px] text-slate-400">Cholesterol, LDL, HDL, Triglycerides &amp; Blood Sugar</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>
    </div>
  );
}
