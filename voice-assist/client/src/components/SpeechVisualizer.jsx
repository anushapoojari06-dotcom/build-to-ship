import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Volume2, Mic, Activity } from 'lucide-react';

export function SpeechVisualizer({
  isListening = false,
  isSpeaking = false,
  volume = 0
}) {
  const { isHighContrast } = useAccessibility();

  // If neither listening nor speaking, show idle bar
  const isActive = isListening || isSpeaking;

  return (
    <div
      aria-live="polite"
      className={`w-full max-w-xl mx-auto my-4 p-4 rounded-2xl border-4 transition-all duration-200 flex flex-col items-center justify-center ${
        isHighContrast
          ? 'bg-black border-yellow-400 text-yellow-400'
          : isActive
          ? isListening
            ? 'bg-slate-900/90 border-red-500/80 shadow-lg shadow-red-900/20'
            : 'bg-slate-900/90 border-cyan-500/80 shadow-lg shadow-cyan-900/20'
          : 'bg-slate-800/50 border-slate-700/60'
      }`}
    >
      {/* Visual Wave Animation Bars */}
      <div className="flex items-center justify-center gap-2 h-16 w-full px-4">
        {[40, 75, 95, 60, 85, 100, 70, 50].map((heightPct, idx) => {
          // Calculate dynamic height based on volume or speaking state
          let currentHeight = 12;
          if (isListening) {
            currentHeight = Math.max(14, Math.min(60, (heightPct * volume) / 80 + 10));
          } else if (isSpeaking) {
            currentHeight = Math.max(16, Math.min(56, heightPct * 0.55));
          }

          return (
            <div
              key={idx}
              className={`w-3 rounded-full transition-all duration-100 ${
                isHighContrast
                  ? 'bg-yellow-400'
                  : isListening
                  ? 'bg-red-500'
                  : isSpeaking
                  ? 'bg-cyan-400'
                  : 'bg-slate-600'
              } ${isActive ? 'wave-bar' : ''}`}
              style={{
                height: `${currentHeight}px`,
                animationDelay: `${idx * 0.12}s`,
                animationPlayState: isActive ? 'running' : 'paused'
              }}
            />
          );
        })}
      </div>

      {/* State Feedback Text */}
      <div className="flex items-center gap-3 mt-2 font-bold text-accessible-base">
        {isListening ? (
          <>
            <Mic className="w-7 h-7 text-red-400 animate-pulse" />
            <span className="text-red-400 font-extrabold uppercase">
              Listening to your voice... Speak clearly
            </span>
          </>
        ) : isSpeaking ? (
          <>
            <Volume2 className="w-7 h-7 text-cyan-400 animate-bounce" />
            <span className="text-cyan-400 font-extrabold uppercase">
              VoiceAssist is speaking aloud...
            </span>
          </>
        ) : (
          <>
            <Activity className="w-6 h-6 text-slate-400" />
            <span className="text-slate-400 font-medium">
              Microphone is ready. Press Speak to start.
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default SpeechVisualizer;
