import React, { useState, useEffect } from 'react';
import { Sparkles, HelpCircle, ArrowRight, Volume2, ShieldAlert, CheckSquare, FileText, History, Settings, Lock } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { processVoiceAPI } from '../utils/api';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { SpeechVisualizer } from '../components/SpeechVisualizer';
import { AccessibleTextCard } from '../components/AccessibleTextCard';
import { LanguagePicker } from '../components/LanguagePicker';
import { PrivacyBanner } from '../components/PrivacyBanner';
import { GLOBAL_VOICE_COMMANDS } from '../utils/constants';

export function HomePage({ onNavigate }) {
  const { isHighContrast, language, voiceNavEnabled, isEffectivelyOnline } = useAccessibility();
  const { speak, stop: stopSpeech, replay, isSpeaking } = useSpeechSynthesis();

  const [aiResponse, setAiResponse] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePromptText, setActivePromptText] = useState('');

  // Handle incoming speech transcript
  const handleProcessSpeech = async (spokenWords) => {
    if (!spokenWords || !spokenWords.trim()) return;

    const lower = spokenWords.toLowerCase().trim();

    // 1. Hands-Free Voice Navigation Check
    if (voiceNavEnabled) {
      if (GLOBAL_VOICE_COMMANDS.form.some(cmd => lower.includes(cmd))) {
        speak("Opening job application form");
        if (onNavigate) onNavigate('/form-filler');
        return;
      }
      if (GLOBAL_VOICE_COMMANDS.reader.some(cmd => lower.includes(cmd))) {
        speak("Opening document reader");
        if (onNavigate) onNavigate('/simplifier');
        return;
      }
      if (lower.includes('history') || lower.includes('saved')) {
        speak("Opening task history");
        if (onNavigate) onNavigate('/history');
        return;
      }
      if (GLOBAL_VOICE_COMMANDS.settings.some(cmd => lower.includes(cmd))) {
        speak("Opening accessibility settings");
        if (onNavigate) onNavigate('/settings');
        return;
      }
      if (GLOBAL_VOICE_COMMANDS.repeat.some(cmd => lower.includes(cmd))) {
        replay();
        return;
      }
      if (GLOBAL_VOICE_COMMANDS.stop.some(cmd => lower.includes(cmd))) {
        stopSpeech();
        return;
      }
    }

    setActivePromptText(spokenWords);
    setIsProcessing(true);
    stopSpeech();

    try {
      const response = await processVoiceAPI({
        transcript: spokenWords,
        language,
        context: 'VoiceAssist Main Screen'
      });

      if (response) {
        setAiResponse(response);
        // Automatically speak response aloud hands-free
        if (response.spoken_text) {
          speak(response.spoken_text);
        }
      }
    } catch (err) {
      console.error('Error processing voice query:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const {
    isListening,
    transcript,
    interimTranscript,
    volume,
    error: speechError,
    toggleListening
  } = useSpeechRecognition({
    onResult: (finalText, isFinal) => {
      if (isFinal && finalText.trim()) {
        handleProcessSpeech(finalText);
      }
    }
  });

  // Handle suggested action selection
  const handleActionClick = (actionText) => {
    const lower = actionText.toLowerCase();
    if (lower.includes('form') || lower.includes('job') || lower.includes('apply')) {
      if (onNavigate) onNavigate('/form-filler');
    } else if (lower.includes('document') || lower.includes('letter') || lower.includes('reader')) {
      if (onNavigate) onNavigate('/simplifier');
    } else if (lower.includes('911') || lower.includes('emergency')) {
      speak("Please call 911 immediately if you are in an emergency.");
    } else {
      handleProcessSpeech(actionText);
    }
  };

  // Keyboard shortcut: Spacebar toggles microphone if not inside an input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleListening]);

  const samplePrompts = [
    { label: "Help me fill out a job application", query: "I need help filling out a job application", emoji: "📋" },
    { label: "Explain an official government notice", query: "Can you simplify an official notice for me?", emoji: "📄" },
    { label: "What does deductible mean?", query: "What does insurance deductible mean in simple words?", emoji: "💡" },
    { label: "Emergency assistance numbers", query: "I need emergency help right now", emoji: "🚨" }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Trust & Privacy Guarantee Banner (Top for Judges & Users) */}
      <PrivacyBanner />

      {/* Hero Welcome Banner */}
      <section className="text-center my-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
          Speak Naturally. We Help Simply.
        </h1>
        <p className="mt-3 text-accessible-base sm:text-accessible-lg opacity-85 max-w-2xl mx-auto font-bold">
          Zero typing required. Tap the big microphone or press Spacebar to speak.
        </p>

        {/* Hands-Free Voice Commands Prompt */}
        <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-700/60 text-sm font-bold">
          <span>🗣️ Voice-only control: Say "Form", "Reader", "Repeat", or "Next" anytime!</span>
        </div>
      </section>

      {/* Main Big Voice Microphone Target (Min 140px target) */}
      <section aria-label="Microphone Voice Input" className="my-6">
        <VoiceMicButton
          isListening={isListening}
          onToggle={toggleListening}
          volume={volume}
          label="Tap or Press Space to Speak"
          activeLabel="Listening... Tap to Stop"
        />

        {/* Audio Visualizer Wave */}
        <SpeechVisualizer
          isListening={isListening}
          isSpeaking={isSpeaking}
          volume={volume}
        />

        {/* Error notification if mic was blocked */}
        {speechError && (
          <div
            role="alert"
            className="w-full max-w-xl mx-auto mt-4 p-4 rounded-2xl bg-red-950/80 border-2 border-red-500 text-red-200 font-bold text-center"
          >
            <ShieldAlert className="w-6 h-6 inline mr-2 text-red-400" />
            {speechError}
          </div>
        )}

        {/* Real-time transcript display */}
        {(isListening || transcript || interimTranscript) && (
          <div
            className={`w-full max-w-2xl mx-auto mt-4 p-5 rounded-2xl border-4 text-center font-bold text-accessible-base ${
              isHighContrast
                ? 'bg-black border-yellow-400 text-yellow-300'
                : 'bg-slate-900/90 border-slate-700 text-white shadow-xl'
            }`}
          >
            <span className="text-xs uppercase tracking-widest block opacity-70 mb-1">
              Live Speech Capture:
            </span>
            <p className="text-accessible-lg font-black">
              "{transcript || interimTranscript || 'Listening to your words...'}"
            </p>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-3 my-6 font-black text-accessible-base text-yellow-400 animate-pulse">
            <Sparkles className="w-7 h-7 animate-spin" />
            <span>VoiceAssist is preparing your plain-speech response...</span>
          </div>
        )}
      </section>

      {/* AI Structured Response Card */}
      {aiResponse && (
        <section aria-label="VoiceAssist Answer">
          <AccessibleTextCard
            response={aiResponse}
            isSpeaking={isSpeaking}
            onReplay={(speed) => replay(speed)}
            onStop={stopSpeech}
            onSelectAction={handleActionClick}
          />
        </section>
      )}

      {/* ICON-BASED QUICK TASK CARDS (For Low-Literacy / Uneducated Users) */}
      <section className="mt-10 pt-8 border-t-4 border-slate-800">
        <h2 className="text-2xl sm:text-3xl font-black mb-2 text-center">
          What Would You Like Help With?
        </h2>
        <p className="text-center text-accessible-base opacity-80 mb-6 font-semibold">
          Tap any picture card or speak its name aloud:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {/* Card 1: Job Application Form */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/form-filler')}
            className={`accessible-button min-h-[100px] p-6 rounded-3xl border-4 text-left flex items-center gap-5 transition-all ${
              isHighContrast
                ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700 hover:border-blue-400 shadow-xl'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-blue-600 text-white shrink-0">
              📋
            </div>
            <div>
              <span className="block font-black text-2xl">Fill Job Application</span>
              <span className="block text-base font-bold opacity-80 mt-1">
                Say your answers, we fill the boxes
              </span>
            </div>
          </button>

          {/* Card 2: Read Letter */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/simplifier')}
            className={`accessible-button min-h-[100px] p-6 rounded-3xl border-4 text-left flex items-center gap-5 transition-all ${
              isHighContrast
                ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700 hover:border-cyan-400 shadow-xl'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-cyan-600 text-white shrink-0">
              📄
            </div>
            <div>
              <span className="block font-black text-2xl">Read Difficult Letter</span>
              <span className="block text-base font-bold opacity-80 mt-1">
                Medical bills & legal letters made simple
              </span>
            </div>
          </button>

          {/* Card 3: Saved History */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/history')}
            className={`accessible-button min-h-[100px] p-6 rounded-3xl border-4 text-left flex items-center gap-5 transition-all ${
              isHighContrast
                ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700 hover:border-green-400 shadow-xl'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-green-600 text-white shrink-0">
              🕒
            </div>
            <div>
              <span className="block font-black text-2xl">Saved Answers & Forms</span>
              <span className="block text-base font-bold opacity-80 mt-1">
                Listen back to past completed tasks
              </span>
            </div>
          </button>

          {/* Card 4: Accessibility Settings */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/settings')}
            className={`accessible-button min-h-[100px] p-6 rounded-3xl border-4 text-left flex items-center gap-5 transition-all ${
              isHighContrast
                ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700 hover:border-yellow-400 shadow-xl'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-yellow-500 text-black shrink-0">
              ⚙️
            </div>
            <div>
              <span className="block font-black text-2xl">Change Voice & Text</span>
              <span className="block text-base font-bold opacity-80 mt-1">
                Extra-large text, speed, and contrast
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Sample Voice Quick Buttons */}
      <section className="mt-10 pt-8 border-t-4 border-slate-800">
        <h2 className="text-2xl sm:text-3xl font-black mb-4 text-center">
          Or Tap an Example Question:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleProcessSpeech(p.query)}
              className={`accessible-button min-h-[72px] p-5 rounded-2xl border-4 text-left flex items-center justify-between transition-all ${
                isHighContrast
                  ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-100 border-slate-700 hover:border-blue-400 shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{p.emoji}</span>
                <span className="font-black text-accessible-base leading-snug">
                  {p.label}
                </span>
              </div>
              <ArrowRight className="w-6 h-6 shrink-0 opacity-60" />
            </button>
          ))}
        </div>
      </section>

      {/* Multilingual Selector Section */}
      <section className="mt-12">
        <LanguagePicker />
      </section>
    </div>
  );
}

export default HomePage;
