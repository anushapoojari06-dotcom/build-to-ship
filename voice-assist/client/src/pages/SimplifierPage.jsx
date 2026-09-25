import React, { useState } from 'react';
import { FileText, Sparkles, Volume2, RotateCcw, Square, CheckCircle, AlertTriangle, ArrowRight, Gauge } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { simplifyDocAPI } from '../utils/api';
import { SAMPLE_DOCUMENTS } from '../utils/constants';

export function SimplifierPage() {
  const { isHighContrast, language, speechRate, setSpeechRate, triggerAudioCue } = useAccessibility();
  const { speak, stop: stopSpeech, replay, isSpeaking } = useSpeechSynthesis();

  const [documentText, setDocumentText] = useState('');
  const [simplifiedResult, setSimplifiedResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(null);

  // Handle document simplification
  const handleSimplify = async (textToProcess = null) => {
    const text = textToProcess || documentText;
    if (!text || text.trim().length < 5) return;

    setIsProcessing(true);
    stopSpeech();

    try {
      const data = await simplifyDocAPI({
        documentText: text,
        language
      });

      if (data) {
        setSimplifiedResult(data);
        triggerAudioCue('success');

        // Automatically read aloud the spoken summary in 3rd grade level
        if (data.spoken_summary) {
          speak(data.spoken_summary);
        }
      }
    } catch (err) {
      console.error('Error simplifying document:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Pick a sample document
  const handleSelectSample = (sample, idx) => {
    setSelectedSampleIndex(idx);
    setDocumentText(sample.text);
    handleSimplify(sample.text);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Page Title */}
      <section className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
          Accessible Document & Message Simplifier
        </h1>
        <p className="mt-3 text-accessible-base sm:text-accessible-lg opacity-85 max-w-2xl mx-auto font-medium">
          Paste any hard-to-read letter, medical bill, or official notice. We turn it into simple, 3rd-grade plain words and read it aloud.
        </p>
      </section>

      {/* Preset Sample Letters */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-black mb-3">
          Try a Difficult Real-World Sample Letter:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_DOCUMENTS.map((doc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(doc, idx)}
              className={`accessible-button p-4 rounded-2xl border-4 text-left flex flex-col items-start justify-between transition-all ${
                selectedSampleIndex === idx
                  ? isHighContrast
                    ? 'bg-yellow-400 text-black border-white'
                    : 'bg-blue-600 text-white border-blue-300'
                  : isHighContrast
                  ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-950'
                  : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {doc.tag}
                </span>
                <span className="text-sm font-bold">Try Sample →</span>
              </div>
              <span className="font-bold text-lg">{doc.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Input Text Box */}
      <section
        className={`p-6 sm:p-8 rounded-3xl border-4 mb-8 ${
          isHighContrast
            ? 'bg-black border-yellow-400 text-yellow-400'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <label htmlFor="doc-input" className="block text-2xl font-black mb-2">
          Paste Letter or Official Text:
        </label>
        <textarea
          id="doc-input"
          rows={5}
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          placeholder="Paste or type complicated text here (e.g., medical notice, legal letter, insurance bill)..."
          className={`w-full p-4 rounded-2xl text-accessible-base font-medium border-2 focus:outline-none ${
            isHighContrast
              ? 'bg-black text-yellow-400 border-yellow-400 focus:ring-4 focus:ring-yellow-400'
              : 'bg-slate-950 text-slate-100 border-slate-700 focus:border-blue-500'
          }`}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => handleSimplify()}
            disabled={!documentText || documentText.trim().length < 5 || isProcessing}
            className={`accessible-button px-8 py-4 rounded-2xl text-accessible-base font-black border-4 ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-black hover:bg-yellow-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-400 shadow-xl shadow-blue-900/30'
            } ${(!documentText || documentText.trim().length < 5) ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <Sparkles className="w-7 h-7 mr-2" />
            {isProcessing ? 'Simplifying Document...' : 'Simplify in Plain Words'}
          </button>

          {documentText && (
            <button
              type="button"
              onClick={() => {
                setDocumentText('');
                setSimplifiedResult(null);
                setSelectedSampleIndex(null);
              }}
              className="text-base font-bold text-slate-400 hover:text-white underline cursor-pointer"
            >
              Clear Text
            </button>
          )}
        </div>
      </section>

      {/* Simplified Output Result */}
      {simplifiedResult && (
        <article
          role="region"
          aria-label="Simplified Document Summary"
          className={`p-6 sm:p-10 rounded-3xl border-4 transition-all shadow-2xl ${
            isHighContrast
              ? 'bg-black border-yellow-400 text-yellow-400'
              : 'bg-slate-900 border-cyan-500 text-slate-100 shadow-cyan-950/30'
          }`}
        >
          {/* Headline */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-700">
            <div>
              <span className="text-xs uppercase font-black tracking-widest text-cyan-400 block mb-1">
                PLAIN-LANGUAGE BREAKDOWN
              </span>
              <h3 className="text-3xl sm:text-4xl font-black">
                {simplifiedResult.headline}
              </h3>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => replay(speechRate)}
                className={`accessible-button px-5 py-2.5 rounded-xl font-black text-accessible-base ${
                  isHighContrast
                    ? 'bg-yellow-400 text-black border-2 border-black'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <RotateCcw className="w-6 h-6 mr-2" />
                Listen Again
              </button>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeech}
                  className={`accessible-button px-4 py-2.5 rounded-xl font-bold ${
                    isHighContrast ? 'bg-black text-yellow-400 border-2 border-yellow-400' : 'bg-red-600 text-white'
                  }`}
                >
                  <Square className="w-6 h-6 mr-1.5" />
                  Stop
                </button>
              )}
            </div>
          </div>

          {/* Spoken Summary (Large Format) */}
          <div className="my-6">
            <h4 className="text-lg font-bold uppercase tracking-wider opacity-70 mb-2">
              Main Summary (Under 30 Words):
            </h4>
            <p className="text-accessible-xl font-black leading-relaxed">
              "{simplifiedResult.spoken_summary}"
            </p>
          </div>

          {/* 3 Key Bullets */}
          {simplifiedResult.key_bullets && simplifiedResult.key_bullets.length > 0 && (
            <div className="my-6">
              <h4 className="text-lg font-bold uppercase tracking-wider opacity-70 mb-3">
                Key Points to Know:
              </h4>
              <ul className="space-y-3">
                {simplifiedResult.key_bullets.map((bullet, i) => (
                  <li
                    key={i}
                    className={`p-4 rounded-2xl border-2 flex items-start gap-3 text-accessible-lg font-bold ${
                      isHighContrast
                        ? 'bg-black border-yellow-400 text-white'
                        : 'bg-slate-800/80 border-slate-700 text-slate-100'
                    }`}
                  >
                    <CheckCircle className="w-7 h-7 text-green-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Clear Action Step */}
          {simplifiedResult.action_required && (
            <div
              className={`mt-6 p-6 rounded-2xl border-4 ${
                isHighContrast
                  ? 'bg-yellow-400 text-black border-white font-black'
                  : 'bg-yellow-950/40 border-yellow-500 text-yellow-100'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <AlertTriangle className="w-7 h-7 text-yellow-400 shrink-0" />
                <span className="text-xl font-black uppercase">
                  Action Required / What You Need to Do:
                </span>
              </div>
              <p className="text-accessible-lg font-bold mt-2">
                {simplifiedResult.action_required}
              </p>
            </div>
          )}
        </article>
      )}
    </div>
  );
}

export default SimplifierPage;
