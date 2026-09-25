import React from 'react';
import { Volume2, RotateCcw, Square, Gauge, AlertCircle, FileText, CheckCircle2, HelpCircle } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

// Format text with bold words rendered as high-contrast highlighted tags
function renderFormattedVisualText(text, isHighContrast) {
  if (!text) return null;
  // Splits on **word**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const clean = part.slice(2, -2);
      return (
        <span
          key={i}
          className={`font-black px-1.5 py-0.5 rounded-md ${
            isHighContrast
              ? 'bg-yellow-400 text-black mx-1 inline-block'
              : 'bg-yellow-400/20 text-yellow-300 font-extrabold mx-1 inline-block border border-yellow-500/40'
          }`}
        >
          {clean}
        </span>
      );
    }
    return part;
  });
}

export function AccessibleTextCard({
  response,
  isSpeaking,
  onReplay,
  onStop,
  onSelectAction,
  customSpeed,
  onChangeSpeed
}) {
  const { isHighContrast, speechRate, setSpeechRate } = useAccessibility();

  if (!response) return null;

  const { spoken_text, visual_text, intent, suggested_actions } = response;

  // Determine intent category styling & icon
  const getIntentDetails = (intentName) => {
    switch (intentName) {
      case 'EMERGENCY_SUPPORT':
        return {
          label: 'EMERGENCY ALERT',
          icon: <AlertCircle className="w-8 h-8 text-red-500 animate-pulse" />,
          color: 'border-red-600 bg-red-950/40 text-red-200'
        };
      case 'FORM_FILLING':
        return {
          label: 'FORM ASSISTANT',
          icon: <CheckCircle2 className="w-8 h-8 text-green-400" />,
          color: 'border-green-600 bg-green-950/40 text-green-200'
        };
      case 'DOCUMENT_SIMPLIFICATION':
        return {
          label: 'DOCUMENT SIMPLIFIER',
          icon: <FileText className="w-8 h-8 text-cyan-400" />,
          color: 'border-cyan-600 bg-cyan-950/40 text-cyan-200'
        };
      case 'DEFINITION_LOOKUP':
        return {
          label: 'WORD EXPLANATION',
          icon: <HelpCircle className="w-8 h-8 text-purple-400" />,
          color: 'border-purple-600 bg-purple-950/40 text-purple-200'
        };
      default:
        return {
          label: 'VOICE ASSISTANCE',
          icon: <Volume2 className="w-8 h-8 text-blue-400" />,
          color: 'border-blue-600 bg-blue-950/40 text-blue-200'
        };
    }
  };

  const intentDetails = getIntentDetails(intent);

  return (
    <article
      aria-label="VoiceAssist Answer Card"
      className={`w-full max-w-3xl mx-auto my-6 p-6 sm:p-8 rounded-3xl border-4 transition-all duration-200 ${
        isHighContrast
          ? 'bg-black border-yellow-400 text-yellow-400'
          : 'bg-slate-900/90 border-slate-700 shadow-2xl text-slate-100'
      }`}
    >
      {/* Category Intent Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-slate-700">
        <div className="flex items-center gap-3">
          {intentDetails.icon}
          <span className="text-xl sm:text-2xl font-black uppercase tracking-wider">
            {intentDetails.label}
          </span>
        </div>

        {/* Live Speaking Indicator */}
        {isSpeaking && (
          <span
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-lg animate-pulse ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-2 border-yellow-400'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
            }`}
          >
            <Volume2 className="w-6 h-6 animate-bounce" />
            Playing Aloud
          </span>
        )}
      </div>

      {/* Main Large Visual Text (28px - 34px) */}
      <div className="my-6">
        <p className="text-accessible-lg sm:text-accessible-xl font-bold leading-relaxed">
          {renderFormattedVisualText(visual_text || spoken_text, isHighContrast)}
        </p>
      </div>

      {/* Spoken plain words preview if visual text was formatted */}
      {spoken_text && spoken_text !== visual_text && (
        <div
          className={`p-4 rounded-2xl mb-6 text-accessible-base font-semibold ${
            isHighContrast
              ? 'bg-black border-2 border-yellow-400 text-white'
              : 'bg-slate-800/80 border border-slate-700 text-slate-300'
          }`}
        >
          <span className="text-sm uppercase tracking-wider block opacity-70 mb-1">
            Plain Spoken Words:
          </span>
          "{spoken_text}"
        </div>
      )}

      {/* Audio Playback Controls Bar */}
      <div className="pt-4 border-t-2 border-slate-700 flex flex-wrap items-center justify-between gap-4">
        {/* Playback Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onReplay && onReplay(speechRate)}
            className={`accessible-button px-6 py-3 text-accessible-base font-black ${
              isHighContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300 border-2 border-black'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-900/30'
            }`}
          >
            <RotateCcw className="w-7 h-7 mr-2" />
            Listen Again
          </button>

          {isSpeaking && (
            <button
              type="button"
              onClick={onStop}
              className={`accessible-button px-5 py-3 text-accessible-base font-black ${
                isHighContrast
                  ? 'bg-black text-yellow-400 border-4 border-yellow-400 hover:bg-yellow-950'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              <Square className="w-7 h-7 mr-2" />
              Stop Voice
            </button>
          )}
        </div>

        {/* Speed Adjustment Controls (0.75x, 1.0x, 1.25x) */}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold flex items-center gap-1 opacity-80">
            <Gauge className="w-5 h-5" />
            Speed:
          </span>
          {[
            { label: '0.75x (Slow)', rate: 0.75 },
            { label: '1.0x (Normal)', rate: 1.0 },
            { label: '1.25x (Fast)', rate: 1.25 }
          ].map(speed => (
            <button
              key={speed.rate}
              type="button"
              onClick={() => {
                setSpeechRate(speed.rate);
                if (onReplay) onReplay(speed.rate);
              }}
              className={`px-3 py-2 rounded-xl text-base font-bold border-2 transition-all ${
                speechRate === speed.rate
                  ? isHighContrast
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : 'bg-blue-500 text-white border-blue-400'
                  : isHighContrast
                  ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-950'
                  : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
              }`}
            >
              {speed.rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Follow-up Actions */}
      {suggested_actions && suggested_actions.length > 0 && (
        <div className="mt-6 pt-4 border-t-2 border-slate-700">
          <p className="text-base font-bold uppercase tracking-wider mb-3 opacity-80">
            Next steps you can tap or say aloud:
          </p>
          <div className="flex flex-wrap gap-3">
            {suggested_actions.map((act, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelectAction && onSelectAction(act)}
                className={`accessible-button px-6 py-4 text-accessible-base font-bold rounded-2xl border-4 ${
                  isHighContrast
                    ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600 hover:border-blue-400'
                }`}
              >
                👉 {act}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export default AccessibleTextCard;
