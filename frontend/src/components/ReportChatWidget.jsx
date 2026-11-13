import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertTriangle, Loader2, ChevronDown, Sparkles } from 'lucide-react';
import { chatReport } from '../lib/api';

const DISCLAIMER_SHORT = "Educational use only — not medical advice.";

const STARTER_QUESTIONS = [
  "What does my hemoglobin level mean?",
  "Are any of my results outside the normal range?",
  "What is this test measuring?",
  "Should I be worried about any of these results?",
  "What questions should I ask my doctor?",
];

function ChatBubble({ role, text, isLoading }) {
  const isUser = role === 'user';
  return (
    <div className={`flex gap-2 items-start ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md
        ${isUser ? 'bg-sky-600 text-white' : 'bg-gradient-to-br from-indigo-600 to-sky-600 text-white'}`}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>
      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm
        ${isUser
          ? 'bg-sky-600 text-white rounded-tr-sm'
          : 'bg-slate-700/90 text-slate-100 rounded-tl-sm border border-slate-600/50'
        }`}>
        {isLoading ? (
          <div className="flex items-center gap-1.5 text-slate-300">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-xs">Checking your report…</span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{text}</div>
        )}
        {!isUser && !isLoading && (
          <div className="mt-1.5 pt-1.5 border-t border-slate-600/40 text-[10px] text-slate-400 flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
            {DISCLAIMER_SHORT}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportChatWidget({ report }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi! I can answer questions about *${report?.title || 'your report'}* using only the information it contains. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [showStarters, setShowStarters] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Build a safe, minimal report context (no PII)
  const buildReportContext = () => ({
    report_title: report?.title || 'Lab Report',
    key_findings: report?.keyFindings || [],
    parameters: (report?.parameters || []).map((p) => ({
      name: p.name,
      value: p.value,
      unit: p.unit || '',
      reference_range: p.referenceRange || '',
      status: p.status || '',
      simple_explanation: p.simpleExplanation || '',
    })),
  });

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendQuestion = async (question) => {
    if (!question.trim() || isTyping) return;

    setShowStarters(false);
    setError('');
    setMessages((prev) => [...prev, { role: 'user', text: question.trim() }]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await chatReport(question.trim(), buildReportContext());
      setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      const errMsg = err?.response?.data?.detail || 'Unable to get a response. Please try again.';
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `I couldn't answer right now. ${errMsg}\n\n${DISCLAIMER_SHORT}`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuestion(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion(input);
    }
  };

  if (!report) return null;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white rounded-full px-4 py-3 shadow-xl shadow-indigo-900/40 transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Open report chat"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold hidden sm:inline">Ask about this report</span>
          <Sparkles className="w-3.5 h-3.5 opacity-70" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl shadow-slate-900/60 border border-slate-700/70 bg-slate-800/95 backdrop-blur-xl flex flex-col overflow-hidden"
          style={{ maxHeight: '70vh', minHeight: '420px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-700/80 to-sky-700/80 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Report Assistant</p>
                <p className="text-[10px] text-sky-200 opacity-80">Answers only from your report</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-600">
            {messages.map((msg, i) => (
              <ChatBubble key={i} role={msg.role} text={msg.text} />
            ))}
            {isTyping && <ChatBubble role="assistant" text="" isLoading={true} />}
            <div ref={messagesEndRef} />
          </div>

          {/* Starter Questions */}
          {showStarters && messages.length <= 1 && (
            <div className="px-3 pb-2">
              <p className="text-[10px] text-slate-400 mb-1.5 font-medium uppercase tracking-wide">Try asking:</p>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_QUESTIONS.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendQuestion(q)}
                    className="text-xs text-sky-300 bg-sky-900/40 hover:bg-sky-900/70 border border-sky-800/50 hover:border-sky-700 rounded-full px-2.5 py-1 transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-2.5 border-t border-slate-700/50 bg-slate-800/80"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your report…"
              maxLength={400}
              disabled={isTyping}
              className="flex-1 bg-slate-700/60 text-slate-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm border border-slate-600/50 focus:outline-none focus:border-sky-500/70 focus:ring-1 focus:ring-sky-500/30 disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0 w-9 h-9 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95"
              aria-label="Send"
            >
              {isTyping
                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                : <Send className="w-4 h-4 text-white" />
              }
            </button>
          </form>
        </div>
      )}
    </>
  );
}
