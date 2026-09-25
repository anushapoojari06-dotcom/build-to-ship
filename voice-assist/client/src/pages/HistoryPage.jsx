import React, { useState, useEffect } from 'react';
import { History, Volume2, CheckSquare, FileText, MessageSquare, RotateCcw, Calendar } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { getHistoryAPI } from '../utils/api';

export function HistoryPage() {
  const { isHighContrast, speechRate } = useAccessibility();
  const { speak, isSpeaking, stop } = useSpeechSynthesis();

  const [historyData, setHistoryData] = useState({
    interactions: [],
    forms: [],
    documents: []
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'interactions' | 'forms' | 'documents'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getHistoryAPI();
      setHistoryData(data);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Page Header */}
      <section className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight flex items-center justify-center gap-3">
          <History className="w-10 h-10 text-blue-400" />
          Task & Voice History
        </h1>
        <p className="mt-3 text-accessible-base sm:text-accessible-lg opacity-85 max-w-2xl mx-auto font-medium">
          Review your past spoken questions, saved job forms, and simplified letters anytime.
        </p>
      </section>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        {[
          { id: 'all', label: 'All Tasks' },
          { id: 'interactions', label: `Spoken Questions (${historyData.interactions.length})` },
          { id: 'forms', label: `Forms (${historyData.forms.length})` },
          { id: 'documents', label: `Documents (${historyData.documents.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={`accessible-button px-5 py-3 rounded-2xl font-black text-accessible-base border-4 transition-all ${
              activeTab === tab.id
                ? isHighContrast
                  ? 'bg-yellow-400 text-black border-white'
                  : 'bg-blue-600 text-white border-blue-300'
                : isHighContrast
                ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-950'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Feed */}
      {loading ? (
        <div className="text-center py-16 font-bold text-accessible-lg text-slate-400 animate-pulse">
          Loading your voice records...
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Spoken Interactions */}
          {(activeTab === 'all' || activeTab === 'interactions') &&
            historyData.interactions.map((item) => (
              <article
                key={item.id}
                className={`p-6 sm:p-8 rounded-3xl border-4 transition-all ${
                  isHighContrast
                    ? 'bg-black border-yellow-400 text-yellow-400'
                    : 'bg-slate-900 border-slate-800 text-slate-100 shadow-xl'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b-2 border-slate-800">
                  <span className="flex items-center gap-2 font-black text-sm uppercase px-3 py-1 rounded-full bg-blue-900/40 text-blue-300 border border-blue-700">
                    <MessageSquare className="w-4 h-4" /> Spoken Query ({item.intent_category || 'ASSISTANCE'})
                  </span>
                  <span className="text-sm font-semibold opacity-70 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-xs uppercase font-black opacity-70 block mb-1">
                    You Said:
                  </span>
                  <p className="text-2xl font-bold">"{item.raw_transcript}"</p>
                </div>

                <div
                  className={`p-4 rounded-2xl mb-4 text-accessible-base font-semibold ${
                    isHighContrast ? 'bg-black border-2 border-yellow-400' : 'bg-slate-800/80 border border-slate-700'
                  }`}
                >
                  <span className="text-xs uppercase font-black opacity-70 block mb-1">
                    VoiceAssist Answered:
                  </span>
                  <p>"{item.ai_response_text}"</p>
                </div>

                <button
                  type="button"
                  onClick={() => speak(item.ai_response_text, speechRate)}
                  className={`accessible-button px-5 py-2.5 rounded-xl font-black text-base border-2 ${
                    isHighContrast
                      ? 'bg-yellow-400 text-black border-black hover:bg-yellow-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Volume2 className="w-5 h-5 mr-2" />
                  Listen Again
                </button>
              </article>
            ))}

          {/* 2. Saved Forms */}
          {(activeTab === 'all' || activeTab === 'forms') &&
            historyData.forms.map((item) => (
              <article
                key={item.id}
                className={`p-6 sm:p-8 rounded-3xl border-4 transition-all ${
                  isHighContrast
                    ? 'bg-black border-yellow-400 text-yellow-400'
                    : 'bg-slate-900 border-green-700/60 text-slate-100 shadow-xl'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b-2 border-slate-800">
                  <span className="flex items-center gap-2 font-black text-sm uppercase px-3 py-1 rounded-full bg-green-900/40 text-green-300 border border-green-700">
                    <CheckSquare className="w-4 h-4" /> {item.form_title}
                  </span>
                  <span className="text-sm font-semibold opacity-70">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                  {Object.entries(item.form_data || {}).map(([k, v]) => (
                    <div
                      key={k}
                      className={`p-3 rounded-xl border ${
                        isHighContrast ? 'border-yellow-400' : 'bg-slate-800/60 border-slate-700'
                      }`}
                    >
                      <span className="text-xs uppercase font-black opacity-70 block capitalize">
                        {k.replace('_', ' ')}
                      </span>
                      <span className="text-lg font-bold">{v || '—'}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    speak(
                      `Form submitted for ${item.form_title}. Name: ${item.form_data?.full_name || 'Recorded'}. Phone: ${item.form_data?.phone_number || 'Recorded'}.`
                    )
                  }
                  className={`accessible-button px-5 py-2.5 rounded-xl font-black text-base border-2 ${
                    isHighContrast
                      ? 'bg-yellow-400 text-black border-black'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <Volume2 className="w-5 h-5 mr-2" />
                  Read Form Summary
                </button>
              </article>
            ))}

          {/* 3. Simplified Documents */}
          {(activeTab === 'all' || activeTab === 'documents') &&
            historyData.documents.map((item) => (
              <article
                key={item.id}
                className={`p-6 sm:p-8 rounded-3xl border-4 transition-all ${
                  isHighContrast
                    ? 'bg-black border-yellow-400 text-yellow-400'
                    : 'bg-slate-900 border-cyan-800 text-slate-100 shadow-xl'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b-2 border-slate-800">
                  <span className="flex items-center gap-2 font-black text-sm uppercase px-3 py-1 rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-700">
                    <FileText className="w-4 h-4" /> Simplified Document
                  </span>
                  <span className="text-sm font-semibold opacity-70">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-2xl font-bold my-4">
                  "{item.simplified_summary}"
                </p>

                <button
                  type="button"
                  onClick={() => speak(item.simplified_summary, speechRate)}
                  className={`accessible-button px-5 py-2.5 rounded-xl font-black text-base border-2 ${
                    isHighContrast
                      ? 'bg-yellow-400 text-black border-black'
                      : 'bg-cyan-600 text-white hover:bg-cyan-700'
                  }`}
                >
                  <Volume2 className="w-5 h-5 mr-2" />
                  Listen to Summary
                </button>
              </article>
            ))}

          {/* Empty state */}
          {historyData.interactions.length === 0 &&
            historyData.forms.length === 0 &&
            historyData.documents.length === 0 && (
              <div className="text-center py-16">
                <p className="text-accessible-lg font-bold opacity-75">
                  No saved tasks yet. Speak to VoiceAssist or complete a form to see it here!
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
