import React from 'react';
import { Mic, Square, Volume2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export function VoiceMicButton({
  isListening,
  onToggle,
  volume = 0,
  disabled = false,
  label = 'Tap or Press Space to Speak',
  activeLabel = 'Listening... Tap to Stop'
}) {
  const { isHighContrast } = useAccessibility();

  // Volume scale for animated halo ring (1.0 to 1.35)
  const scaleEffect = 1 + (volume / 100) * 0.35;

  return (
    <div className="flex flex-col items-center justify-center my-6">
      <div className="relative flex items-center justify-center">
        {/* Dynamic reactive volume aura ring */}
        {isListening && (
          <div
            className={`absolute rounded-full pointer-events-none transition-transform duration-75 ${
              isHighContrast
                ? 'bg-yellow-400 opacity-30 border-4 border-yellow-300'
                : 'bg-red-500 opacity-25'
            }`}
            style={{
              width: '180px',
              height: '180px',
              transform: `scale(${scaleEffect})`,
            }}
          />
        )}

        {/* Pulse animation ring */}
        {isListening && (
          <div
            className={`absolute rounded-full pointer-events-none ${
              isHighContrast
                ? 'w-44 h-44 border-4 border-yellow-400 animate-mic-pulse-hc'
                : 'w-44 h-44 bg-red-500 animate-mic-pulse opacity-40'
            }`}
          />
        )}

        {/* Main Microphone Button - Min 130px target */}
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={isListening ? activeLabel : label}
          aria-pressed={isListening}
          className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer shadow-2xl focus:outline-none ${
            isHighContrast
              ? isListening
                ? 'bg-black text-yellow-300 border-8 border-yellow-400 focus:ring-8 focus:ring-yellow-300'
                : 'bg-yellow-400 text-black border-8 border-black hover:bg-yellow-300 focus:ring-8 focus:ring-yellow-400'
              : isListening
              ? 'bg-red-600 text-white border-4 border-red-300 hover:bg-red-700 focus:ring-4 focus:ring-red-400 shadow-red-500/50'
              : 'bg-blue-600 text-white border-4 border-blue-400 hover:bg-blue-700 hover:scale-105 focus:ring-4 focus:ring-blue-300 shadow-blue-500/40'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <>
              <Square className="w-14 h-14 stroke-[2.5] mb-1 animate-pulse" />
              <span className="text-sm font-black uppercase tracking-wider">STOP</span>
            </>
          ) : (
            <>
              <Mic className="w-14 h-14 stroke-[2.5] mb-1" />
              <span className="text-sm font-black uppercase tracking-wider">SPEAK</span>
            </>
          )}
        </button>
      </div>

      {/* Primary Accessible Instruction Label */}
      <p
        className={`mt-4 text-center font-bold text-accessible-base px-4 py-1 rounded-full ${
          isHighContrast
            ? 'text-yellow-400 bg-black border-2 border-yellow-400'
            : isListening
            ? 'text-red-400 bg-red-950/40 border border-red-800'
            : 'text-slate-300 bg-slate-800/60 border border-slate-700'
        }`}
      >
        {isListening ? activeLabel : label}
      </p>

      {/* Live Volume Feedback Bar */}
      {isListening && (
        <div className="w-48 h-3 mt-3 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
          <div
            className={`h-full transition-all duration-100 ${
              isHighContrast ? 'bg-yellow-400' : 'bg-gradient-to-r from-green-400 via-yellow-400 to-red-500'
            }`}
            style={{ width: `${Math.max(5, volume)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default VoiceMicButton;
