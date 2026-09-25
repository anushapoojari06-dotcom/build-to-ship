import React from 'react';
import { Volume2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { AutoFormFiller } from '../components/AutoFormFiller';

export function FormFillerPage() {
  const { isHighContrast } = useAccessibility();
  const { speak } = useSpeechSynthesis();

  const handleReadGuide = () => {
    speak(
      "Welcome to the smart form filler. I will read each question aloud. You just speak your answer naturally. I will fill in the boxes for you automatically."
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Page Header Banner */}
      <section className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold mb-3">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          Zero-Keyboard Form Automation
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
          Voice-Guided Intelligent Form Filler
        </h1>
        <p className="mt-3 text-accessible-base sm:text-accessible-lg opacity-85 max-w-2xl mx-auto font-medium">
          Answer questions naturally using your voice. Our AI maps your words directly into official form parameters.
        </p>

        {/* Read Guide Button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handleReadGuide}
            className={`accessible-button px-6 py-3 rounded-2xl font-black text-accessible-base border-4 ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-white hover:bg-yellow-300'
                : 'bg-blue-600 text-white border-blue-300 hover:bg-blue-700 shadow-lg shadow-blue-900/30'
            }`}
          >
            <Volume2 className="w-7 h-7 mr-2" />
            Listen to How It Works
          </button>
        </div>
      </section>

      {/* Main Interactive Form Module */}
      <AutoFormFiller />

      {/* Accessibility Guidance Card */}
      <section
        className={`mt-12 p-6 sm:p-8 rounded-3xl border-4 ${
          isHighContrast
            ? 'bg-black border-yellow-400 text-yellow-400'
            : 'bg-slate-900/70 border-slate-800 text-slate-300'
        }`}
      >
        <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-green-400" />
          Designed for Total Accessibility (WCAG 2.1 AAA)
        </h2>
        <ul className="space-y-3 font-semibold text-accessible-base">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0 mt-1" />
            <span><strong>No typing required:</strong> Speak conversational answers like "I worked at a grocery store for two years" and the system extracts just the clean role.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0 mt-1" />
            <span><strong>Audio prompt on every field:</strong> The active field is automatically read aloud to you as you advance.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0 mt-1" />
            <span><strong>Clear high-contrast highlight:</strong> Active fields are surrounded by a thick high-visibility border.</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default FormFillerPage;
