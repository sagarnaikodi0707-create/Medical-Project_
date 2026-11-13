import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStoredReports, deleteReportRecord } from '../lib/historyService';
import { 
  X, 
  Clock, 
  Trash2, 
  FileText, 
  ShieldCheck, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Database,
  CloudOff,
  Cloud
} from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, onSelectReport }) {
  const { user, isConfigured } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStoredReports(user);
      setReports(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load report history. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen, user]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this educational report summary? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteReportRecord(id, user);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete report. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-white text-base">Saved Report History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="px-5 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {isConfigured && user ? (
              <>
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Supabase Cloud Sync (RLS Active)</span>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300">
                  {isConfigured ? "Guest Session (Local Storage)" : "Demo Mode (Supabase Not Configured)"}
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
            className="text-sky-400 hover:text-sky-300 underline font-medium"
          >
            What is stored?
          </button>
        </div>

        {/* Privacy Disclosure Notice */}
        {showPrivacyInfo && (
          <div className="p-4 bg-sky-950/40 border-b border-sky-800/60 text-xs text-slate-300 space-y-2">
            <div className="flex items-center space-x-1.5 text-sky-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>ReportSaathi Privacy Architecture:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 leading-relaxed font-light">
              <li><strong className="text-slate-200">We store:</strong> Report title, test names, observed numbers, reference intervals, and generated doctor questions.</li>
              <li><strong className="text-emerald-300">We NEVER store:</strong> Original lab scans, raw PDF documents, patient names, or contact addresses.</li>
              <li>Row Level Security (RLS) ensures only your authenticated user ID can read or delete your entries.</li>
            </ul>
          </div>
        )}

        {/* List of Reports */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Loading report history...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-20 text-center space-y-3 text-slate-500">
              <Database className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">No Saved Reports Found</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                When analyzing a lab report, you can optionally choose to save its summary here for future reference.
              </p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                onClick={() => {
                  onSelectReport(report);
                  onClose();
                }}
                className="group relative bg-slate-800/70 border border-slate-700/80 hover:border-sky-500/50 rounded-2xl p-4 cursor-pointer transition shadow-sm space-y-2 hover:bg-slate-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800/60 flex items-center justify-center text-sky-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition line-clamp-1">
                        {report.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {report.reportDate || (report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Archived')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(report.id, e)}
                    disabled={deletingId === report.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition"
                    title="Delete record"
                  >
                    {deletingId === report.id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 font-light">
                  {report.summary}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-[11px] text-slate-400">
                  <span>{report.parameters?.length || 0} extracted biomarkers</span>
                  <span className="text-sky-400 font-medium group-hover:underline flex items-center space-x-1">
                    <span>View Breakdown</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center text-xs text-slate-400">
          <span>{reports.length} saved records</span>
          <button
            onClick={fetchReports}
            className="text-sky-400 hover:text-sky-300 underline"
          >
            Refresh List
          </button>
        </div>
      </div>
    </div>
  );
}
