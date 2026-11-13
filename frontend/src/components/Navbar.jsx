import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  ShieldCheck, 
  FileText, 
  Upload, 
  Sparkles, 
  Menu, 
  X, 
  ArrowUpRight,
  Clock,
  User,
  LogOut
} from 'lucide-react';

export default function Navbar({ activeTab, onNavigate, onOpenDisclaimer, onOpenHistory, onOpenAuth }) {
  const { user, isConfigured, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 text-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo - Meridian / Medical Center Inspired */}
          <div 
            onClick={() => handleNav('landing')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform font-bold">
              <Activity className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl text-white tracking-wider uppercase text-sm sm:text-base font-sans">
                  ReportSaathi
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-950/80 text-sky-300 border border-sky-800/60">
                  <Sparkles className="w-3 h-3 mr-1 text-sky-400" /> Educational
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide uppercase hidden sm:block">
                Clinical Lab Report Companion
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 sm:space-x-3 text-xs tracking-wider uppercase font-medium">
            <button
              onClick={() => handleNav('landing')}
              className={`px-3 py-2 rounded-lg transition ${
                activeTab === 'landing'
                  ? 'text-sky-400 font-bold bg-white/5 border border-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => handleNav('upload')}
              className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'upload'
                  ? 'text-sky-400 font-bold bg-white/5 border border-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Upload Report</span>
            </button>

            <button
              onClick={() => handleNav('results')}
              className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'results'
                  ? 'text-sky-400 font-bold bg-white/5 border border-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Report Analysis</span>
            </button>

            <button
              onClick={onOpenHistory}
              className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center space-x-1.5"
              title="Saved Reports"
            >
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>History</span>
            </button>

            <button
              onClick={onOpenDisclaimer}
              className="text-slate-400 hover:text-sky-400 p-2 rounded-lg hover:bg-white/5 transition"
              title="Medical Disclaimer & Safety Info"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>

          {/* Account / CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-300 font-mono hidden lg:inline">
                  {user.email?.split('@')[0]}
                </span>
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition"
              >
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>{isConfigured ? "Sign In" : "Account (Demo)"}</span>
              </button>
            )}

            <button
              onClick={() => handleNav('upload')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-400/30 font-medium text-xs tracking-wider uppercase shadow-xs transition active:scale-95"
            >
              <span>Explain Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2 shadow-2xl">
          <button
            onClick={() => handleNav('landing')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            Overview
          </button>
          <button
            onClick={() => handleNav('upload')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 flex items-center space-x-2"
          >
            <Upload className="w-4 h-4 text-sky-400" />
            <span>Upload Report</span>
          </button>
          <button
            onClick={() => handleNav('results')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Report Analysis</span>
          </button>
          <button
            onClick={() => {
              onOpenHistory();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 flex items-center space-x-2"
          >
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Saved History</span>
          </button>
          <button
            onClick={() => {
              onOpenAuth();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 flex items-center space-x-2"
          >
            <User className="w-4 h-4 text-sky-400" />
            <span>{user ? `Account (${user.email})` : "Sign In / Register"}</span>
          </button>
          <button
            onClick={() => {
              onOpenDisclaimer();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 flex items-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Safety Disclaimer</span>
          </button>
        </div>
      )}
    </nav>
  );
}
