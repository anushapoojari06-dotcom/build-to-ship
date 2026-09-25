import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export function PrivacyBanner({ compact = false }) {
  const { isHighContrast, isEffectivelyOnline, lowBandwidthMode } = useAccessibility();

  if (compact) {
    return (
      <div
        role="status"
        aria-label="Privacy and Network Guarantee"
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-black border-2 ${
          isHighContrast
            ? 'bg-black text-yellow-400 border-yellow-400'
            : 'bg-green-950/70 text-green-300 border-green-600/50'
        }`}
      >
        <Lock className="w-4 h-4 text-green-400" />
        <span>Voice Not Stored • 100% Private</span>
      </div>
    );
  }

  return (
    <aside
      role="region"
      aria-label="Security and Privacy Assurance"
      className={`w-full max-w-4xl mx-auto my-4 p-4 rounded-2xl border-4 transition-all ${
        isHighContrast
          ? 'bg-black border-yellow-400 text-yellow-400'
          : 'bg-slate-900/90 border-green-700/60 shadow-lg shadow-green-950/20 text-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 shrink-0 ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-white'
                : 'bg-green-600/20 text-green-400 border-green-500'
            }`}
          >
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black flex items-center gap-2">
              <span>Your Voice Is Never Stored</span>
              <span className="text-xs px-2 py-0.5 rounded-md font-bold uppercase bg-green-500 text-black">
                Private & Ethical AI
              </span>
            </h3>
            <p className="text-base font-semibold opacity-85 mt-0.5">
              Audio is converted into text directly in your browser. We never record, sell, or retain biometric data.
            </p>
          </div>
        </div>

        {/* Connectivity Status Pill */}
        <div className="flex items-center gap-2">
          {isEffectivelyOnline ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm bg-blue-950 text-blue-300 border border-blue-600">
              <Wifi className="w-4 h-4 text-blue-400" /> Cloud + Local AI
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm bg-amber-950 text-amber-300 border border-amber-600 animate-pulse">
              <WifiOff className="w-4 h-4 text-amber-400" /> Offline Mode Active
            </span>
          )}

          {lowBandwidthMode && (
            <span className="px-2.5 py-1 rounded-xl font-bold text-xs bg-slate-800 text-yellow-400 border border-yellow-400/50">
              2G Low-Data
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}

export default PrivacyBanner;
