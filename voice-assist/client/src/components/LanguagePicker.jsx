import React from 'react';
import { Globe, Check, Volume2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { SUPPORTED_LANGUAGES } from '../utils/constants';

// Localized welcome greetings for audio preview upon selection
const GREETINGS = {
  'kn-IN': 'ನಮಸ್ಕಾರ! ವಾಯ್ಸ್ ಅಸಿಸ್ಟ್ ಗೆ ಸ್ವಾಗತ.',
  'te-IN': 'నమస్కారం! వాయిస్ అసిస్ట్‌కి స్వాగతం.',
  'ta-IN': 'வணக்கம்! வாய்ஸ் அசிஸ்ட்டிற்கு வரவேற்கிறோம்.',
  'bn-IN': 'নমস্কার! ভয়েস অ্যাসিস্টে স্বাগতম।',
  'mr-IN': 'नमस्कार! व्हॉइस असिस्टमध्ये आपले स्वागत आहे.',
  'ml-IN': 'നമസ്കാരം! വോയ്‌സ് അസിസ്റ്റിലേക്ക് സ്വാഗതം.',
  'ur-IN': 'خوش آمدید! وائس اسسٹ میں خوش آمدید۔',
  'hi-IN': 'नमस्ते! वॉयस असिस्ट में आपका स्वागत है।',
  'en-US': 'Hello! VoiceAssist is ready in English.',
  'es-ES': '¡Hola! VoiceAssist está listo en Español.',
  'fr-FR': 'Bonjour! VoiceAssist est prêt en Français.',
  'tl-PH': 'Kamusta! Handa na ang VoiceAssist sa Tagalog.',
  'ar-SA': 'مرحبًا! فويس أссиست جاهز بالعربية.'
};

export function LanguagePicker({ compact = false }) {
  const { language, setLanguage, isHighContrast, triggerAudioCue } = useAccessibility();
  const { speak } = useSpeechSynthesis();

  const handleSelectLanguage = (langCode) => {
    setLanguage(langCode);
    triggerAudioCue('confirm');
    const greeting = GREETINGS[langCode] || 'Language selected.';
    speak(greeting);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Globe className="w-6 h-6 text-slate-400" />
        <select
          value={language}
          onChange={(e) => handleSelectLanguage(e.target.value)}
          aria-label="Select VoiceAssist Language"
          className={`accessible-button px-4 py-2 text-accessible-base font-bold rounded-xl border-4 ${
            isHighContrast
              ? 'bg-black text-yellow-400 border-yellow-400'
              : 'bg-slate-800 text-slate-100 border-slate-600'
          }`}
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
              {lang.flag} {lang.name} ({lang.native})
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Group languages: Indian Regional & Global
  const indianLanguages = SUPPORTED_LANGUAGES.filter(l => l.code.endsWith('-IN'));
  const globalLanguages = SUPPORTED_LANGUAGES.filter(l => !l.code.endsWith('-IN'));

  return (
    <div className="w-full max-w-4xl mx-auto my-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-600/20 text-blue-400 border-2 border-blue-500">
          <Globe className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Choose Your Language / ನಿಮ್ಮ ಭಾಷೆ / మీ భాష / உங்கள் மொழி
          </h2>
          <p className="text-base font-semibold opacity-80">
            Tap your native language to hear VoiceAssist speak and listen in your language.
          </p>
        </div>
      </div>

      {/* Indian Regional Languages Section */}
      <div className="mb-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
          <span>🇮🇳 Indian Regional Languages (ಕನ್ನಡ, తెలుగు, தமிழ், বাংলা, मराठी, മലയാളം, اردو)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {indianLanguages.map(lang => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                aria-pressed={isSelected}
                className={`accessible-button min-h-[76px] p-4 rounded-2xl border-4 flex items-center justify-between transition-all ${
                  isSelected
                    ? isHighContrast
                      ? 'bg-yellow-400 text-black border-white ring-4 ring-yellow-300 shadow-xl'
                      : 'bg-blue-600 text-white border-blue-300 ring-4 ring-blue-500/50 shadow-lg'
                    : isHighContrast
                    ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-950'
                    : 'bg-slate-800/90 text-slate-100 border-slate-700 hover:bg-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="text-left">
                  <span className="block font-black text-2xl leading-snug">
                    {lang.native}
                  </span>
                  <span className="block text-sm font-bold opacity-80">
                    {lang.name} • {lang.region}
                  </span>
                </div>
                {isSelected && <Check className="w-7 h-7 stroke-[3] text-white shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Languages Section */}
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3">
          <span>🌐 Global Languages</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {globalLanguages.map(lang => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                aria-pressed={isSelected}
                className={`accessible-button min-h-[64px] p-3 rounded-2xl border-3 flex items-center justify-between transition-all ${
                  isSelected
                    ? isHighContrast
                      ? 'bg-yellow-400 text-black border-white ring-4 ring-yellow-300'
                      : 'bg-blue-600 text-white border-blue-300'
                    : isHighContrast
                    ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-950'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <div className="text-left">
                  <span className="block font-extrabold text-lg leading-tight">
                    {lang.name}
                  </span>
                  <span className="block text-xs font-semibold opacity-75">
                    {lang.native}
                  </span>
                </div>
                {isSelected && <Check className="w-5 h-5 stroke-[3] ml-1 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LanguagePicker;
