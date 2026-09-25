import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  CheckCircle2,
  Mic,
  ArrowRight,
  RotateCcw,
  Send,
  Sparkles,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  User,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { extractFormAPI, saveFormAPI } from '../utils/api';
import { JOB_APPLICATION_FIELDS, VOICE_CONFIRMATION_KEYWORDS, GLOBAL_VOICE_COMMANDS } from '../utils/constants';

// Helper to get field icon component
function getFieldIcon(fieldId) {
  switch (fieldId) {
    case 'full_name':
      return <User className="w-8 h-8" />;
    case 'phone_number':
      return <Phone className="w-8 h-8" />;
    case 'city':
      return <MapPin className="w-8 h-8" />;
    case 'work_history':
      return <Briefcase className="w-8 h-8" />;
    case 'availability':
      return <Calendar className="w-8 h-8" />;
    default:
      return <CheckCircle2 className="w-8 h-8" />;
  }
}

function getFieldEmoji(fieldId) {
  switch (fieldId) {
    case 'full_name': return '👤';
    case 'phone_number': return '📞';
    case 'city': return '📍';
    case 'work_history': return '💼';
    case 'availability': return '📅';
    default: return '📝';
  }
}

export function AutoFormFiller() {
  const { isHighContrast, language, triggerAudioCue, voiceNavEnabled } = useAccessibility();
  const { speak, stop: stopSpeech, isSpeaking } = useSpeechSynthesis();

  // Form values state
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    city: '',
    work_history: '',
    availability: ''
  });

  const [activeFieldIndex, setActiveFieldIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [autoPromptEnabled, setAutoPromptEnabled] = useState(true);

  // Voice confirmation state: { fieldId, value, confirmationText }
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  const activeField = JOB_APPLICATION_FIELDS[activeFieldIndex] || JOB_APPLICATION_FIELDS[0];

  // Affirmative or negative voice detector
  const checkVoiceConfirmationIntent = (transcriptText) => {
    const lower = transcriptText.toLowerCase().trim();

    // Check affirmative
    for (const kw of VOICE_CONFIRMATION_KEYWORDS.affirmative) {
      if (lower === kw || lower.startsWith(kw + ' ') || lower.endsWith(' ' + kw) || lower.includes(` ${kw} `)) {
        return 'YES';
      }
    }

    // Check negative
    for (const kw of VOICE_CONFIRMATION_KEYWORDS.negative) {
      if (lower === kw || lower.startsWith(kw + ' ') || lower.endsWith(' ' + kw) || lower.includes(` ${kw} `)) {
        return 'NO';
      }
    }

    return null;
  };

  // Check global voice navigation commands
  const checkGlobalCommands = (transcriptText) => {
    if (!voiceNavEnabled) return null;
    const lower = transcriptText.toLowerCase().trim();

    for (const kw of GLOBAL_VOICE_COMMANDS.next) {
      if (lower.includes(kw)) return 'NEXT';
    }
    for (const kw of GLOBAL_VOICE_COMMANDS.repeat) {
      if (lower.includes(kw)) return 'REPEAT';
    }
    for (const kw of GLOBAL_VOICE_COMMANDS.stop) {
      if (lower.includes(kw)) return 'STOP';
    }
    return null;
  };

  // User confirms the spoken field value
  const handleConfirmValue = (confirmedValue) => {
    if (!activeField) return;

    triggerAudioCue('success');
    setFormData(prev => ({
      ...prev,
      [activeField.id]: confirmedValue
    }));
    setPendingConfirmation(null);

    // Speak quick confirmation
    speak(`Saved. Moving to next question.`);

    // Auto-advance to next empty field
    const nextIncompleteIndex = JOB_APPLICATION_FIELDS.findIndex(
      (f, idx) => idx > activeFieldIndex && !formData[f.id]
    );

    if (nextIncompleteIndex !== -1) {
      setTimeout(() => {
        setActiveFieldIndex(nextIncompleteIndex);
      }, 1500);
    } else {
      const anyEmpty = JOB_APPLICATION_FIELDS.findIndex(
        (f) => f.id !== activeField.id && !formData[f.id]
      );
      if (anyEmpty !== -1) {
        setTimeout(() => {
          setActiveFieldIndex(anyEmpty);
        }, 1500);
      }
    }
  };

  // User rejects the spoken field value (says "No" or clicks No)
  const handleRejectValue = () => {
    triggerAudioCue('stop');
    setPendingConfirmation(null);
    speak(`No problem. Please say your ${activeField.label} again.`);
  };

  // Handle incoming speech transcript
  const handleVoiceInput = async (spokenWords) => {
    if (!spokenWords || !activeField) return;

    // 1. Check global navigation commands
    const globalCmd = checkGlobalCommands(spokenWords);
    if (globalCmd === 'NEXT') {
      const nextIdx = (activeFieldIndex + 1) % JOB_APPLICATION_FIELDS.length;
      setActiveFieldIndex(nextIdx);
      speak(`Moving to ${JOB_APPLICATION_FIELDS[nextIdx].label}`);
      return;
    }
    if (globalCmd === 'REPEAT') {
      speak(activeField.audio_prompt);
      return;
    }
    if (globalCmd === 'STOP') {
      stopSpeech();
      return;
    }

    // 2. If in Confirmation State, check if user said YES or NO
    if (pendingConfirmation) {
      const intent = checkVoiceConfirmationIntent(spokenWords);
      if (intent === 'YES') {
        handleConfirmValue(pendingConfirmation.value);
        return;
      } else if (intent === 'NO') {
        handleRejectValue();
        return;
      }
    }

    // 3. Normal Field Slot Extraction
    setIsProcessing(true);
    try {
      const extracted = await extractFormAPI({
        fieldLabel: activeField.label,
        audioTranscript: spokenWords,
        fieldType: activeField.type,
        language
      });

      if (extracted && extracted.extracted_value) {
        triggerAudioCue('confirm');

        // Set pending confirmation for zero-reading confirmation flow
        const cleanValue = extracted.extracted_value;
        setPendingConfirmation({
          fieldId: activeField.id,
          value: cleanValue,
          confirmationText: `You said: ${cleanValue}. Is this correct? Say yes or no.`
        });

        // Voice prompt: "You said: [answer]. Correct?"
        speak(`You said: ${cleanValue}. Correct? Say yes or tap the green checkmark.`);
      }
    } catch (err) {
      console.error('Form extraction error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const {
    isListening,
    transcript,
    interimTranscript,
    volume,
    startListening,
    stopListening,
    toggleListening
  } = useSpeechRecognition({
    onResult: (result, isFinal) => {
      if (isFinal && result.trim()) {
        handleVoiceInput(result);
      }
    }
  });

  // Prompt the active field aloud when active field changes
  useEffect(() => {
    if (autoPromptEnabled && activeField && !isSubmitted && !pendingConfirmation) {
      const timer = setTimeout(() => {
        speak(activeField.audio_prompt);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeFieldIndex, autoPromptEnabled, isSubmitted, speak]);

  // Check completion percentage
  const completedCount = JOB_APPLICATION_FIELDS.filter(f => Boolean(formData[f.id])).length;
  const isAllComplete = completedCount === JOB_APPLICATION_FIELDS.length;

  // Handle Form Submission
  const handleSubmitForm = async () => {
    stopSpeech();
    triggerAudioCue('success');

    // Trigger Confetti celebration
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 }
    });

    setIsSubmitted(true);
    speak("Congratulations! Your job application is completely filled and saved.");

    await saveFormAPI({
      formTitle: 'Job Application & Assistance Form',
      formData,
      isCompleted: true
    });
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      full_name: '',
      phone_number: '',
      city: '',
      work_history: '',
      availability: ''
    });
    setActiveFieldIndex(0);
    setIsSubmitted(false);
    setPendingConfirmation(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-6 sm:p-10 rounded-3xl border-4 transition-all">
      {/* Form Title & Icon Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl border-3 ${
                isHighContrast ? 'bg-yellow-400 text-black border-white' : 'bg-blue-600 text-white'
              }`}
            >
              📋
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-black">
                Job Application Form
              </h2>
              <p className="text-accessible-base opacity-85 font-semibold">
                Voice-guided with spoken confirmation • Zero typing needed
              </p>
            </div>
          </div>

          {/* Progress Badge */}
          <div
            className={`px-6 py-3 rounded-2xl border-4 font-black text-2xl ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-white'
                : 'bg-blue-600 text-white border-blue-300'
            }`}
          >
            {completedCount} of {JOB_APPLICATION_FIELDS.length} Done
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-slate-800 rounded-full mt-4 overflow-hidden border-2 border-slate-700">
          <div
            className={`h-full transition-all duration-300 ${
              isHighContrast ? 'bg-yellow-400' : 'bg-gradient-to-r from-blue-500 to-green-400'
            }`}
            style={{ width: `${(completedCount / JOB_APPLICATION_FIELDS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Completion Banner */}
      {isSubmitted ? (
        <div
          role="alert"
          className={`p-8 rounded-3xl border-4 text-center my-6 ${
            isHighContrast
              ? 'bg-black border-yellow-400 text-yellow-400'
              : 'bg-green-950/70 border-green-500 text-green-100 shadow-2xl shadow-green-900/40'
          }`}
        >
          <div className="text-6xl mb-3">🎉</div>
          <h3 className="text-3xl sm:text-4xl font-black mb-2">
            Application Completed Successfully!
          </h3>
          <p className="text-accessible-base mb-6 max-w-xl mx-auto font-bold">
            All fields were confirmed by voice and saved. You can listen back or restart anytime.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() =>
                speak(
                  `Here is your application: Name: ${formData.full_name}. Phone: ${formData.phone_number}. City: ${formData.city}. Work experience: ${formData.work_history}. Availability: ${formData.availability}.`
                )
              }
              className={`accessible-button px-8 py-5 text-accessible-lg font-black rounded-2xl border-4 ${
                isHighContrast
                  ? 'bg-yellow-400 text-black border-black'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Volume2 className="w-8 h-8 mr-3" />
              Listen to Completed Form
            </button>

            <button
              type="button"
              onClick={handleReset}
              className={`accessible-button px-8 py-5 text-accessible-lg font-black rounded-2xl border-4 ${
                isHighContrast
                  ? 'bg-black text-yellow-400 border-yellow-400'
                  : 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700'
              }`}
            >
              <RotateCcw className="w-8 h-8 mr-3" />
              Fill Again / Reset
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Active Field Voice Guide Card */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border-4 mb-8 transition-all ${
              isHighContrast
                ? 'bg-black border-yellow-400 text-yellow-400'
                : 'bg-slate-900/90 border-blue-500 shadow-2xl shadow-blue-900/30'
            }`}
          >
            {/* Field Header & Icon */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="flex items-center gap-2 text-sm uppercase font-black tracking-widest text-blue-400">
                <span className="text-2xl">{getFieldEmoji(activeField.id)}</span>
                QUESTION {activeFieldIndex + 1} OF {JOB_APPLICATION_FIELDS.length}: {activeField.label}
              </span>

              <button
                type="button"
                onClick={() => speak(activeField.audio_prompt)}
                className={`accessible-button px-4 py-2 text-base font-black rounded-xl border-2 ${
                  isHighContrast
                    ? 'bg-yellow-400 text-black border-black'
                    : 'bg-blue-600/30 text-blue-300 border-blue-400 hover:bg-blue-600/50'
                }`}
              >
                <Volume2 className="w-5 h-5 mr-1.5" />
                Read Aloud
              </button>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black leading-tight my-2">
              "{activeField.audio_prompt}"
            </h3>
            <p className="text-accessible-base opacity-80 italic mb-6">
              💡 {activeField.example}
            </p>

            {/* CONFIRMATION BY VOICE PROMPT (When a value was just spoken) */}
            {pendingConfirmation ? (
              <div
                role="alert"
                aria-live="assertive"
                className={`p-6 rounded-2xl border-4 my-4 animate-pulse ${
                  isHighContrast
                    ? 'bg-black border-yellow-400 text-yellow-300'
                    : 'bg-slate-950 border-yellow-500 text-white'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🔊</span>
                  <p className="text-2xl sm:text-3xl font-black">
                    You said: <span className="underline font-black">"{pendingConfirmation.value}"</span>
                  </p>
                </div>
                <p className="text-accessible-base font-bold mb-4 opacity-90">
                  Is this correct? Say <strong>"Yes"</strong> or <strong>"No"</strong>, or tap a button below:
                </p>

                {/* Big Touch Targets for Yes / No Confirmation (80px target) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Big Green YES Button */}
                  <button
                    type="button"
                    onClick={() => handleConfirmValue(pendingConfirmation.value)}
                    className={`accessible-button h-24 p-4 rounded-2xl text-2xl font-black border-4 flex items-center justify-center gap-3 transition-all ${
                      isHighContrast
                        ? 'bg-yellow-400 text-black border-white hover:bg-yellow-300 shadow-xl'
                        : 'bg-green-600 hover:bg-green-700 text-white border-green-300 shadow-lg shadow-green-900/40'
                    }`}
                  >
                    <Check className="w-10 h-10 stroke-[3]" />
                    <span>YES, CORRECT 👍</span>
                  </button>

                  {/* Big Red NO Button */}
                  <button
                    type="button"
                    onClick={handleRejectValue}
                    className={`accessible-button h-24 p-4 rounded-2xl text-2xl font-black border-4 flex items-center justify-center gap-3 transition-all ${
                      isHighContrast
                        ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-950'
                        : 'bg-red-600 hover:bg-red-700 text-white border-red-300 shadow-lg shadow-red-900/40'
                    }`}
                  >
                    <X className="w-10 h-10 stroke-[3]" />
                    <span>NO, TRY AGAIN 👎</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Voice Input Trigger Controls */
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950/70 border-3 border-slate-700">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* Huge Microphone Button for Elderly / Motor Accessibility */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`accessible-button min-h-[80px] px-8 py-5 rounded-2xl font-black text-2xl flex items-center justify-center gap-4 transition-all shadow-xl ${
                      isListening
                        ? isHighContrast
                          ? 'bg-black text-yellow-400 border-4 border-yellow-400 animate-pulse'
                          : 'bg-red-600 text-white animate-pulse'
                        : isHighContrast
                        ? 'bg-yellow-400 text-black border-4 border-black hover:bg-yellow-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/40'
                    }`}
                  >
                    <Mic className="w-10 h-10 stroke-[2.5]" />
                    <span>{isListening ? 'Listening... Tap to Stop' : `Speak Answer`}</span>
                  </button>

                  {isListening && (
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-red-500 animate-ping" />
                      <span className="text-red-400 font-black text-xl">Listening</span>
                    </div>
                  )}
                </div>

                {isProcessing && (
                  <div className="flex items-center gap-2 font-black text-xl text-yellow-400 animate-pulse">
                    <Sparkles className="w-7 h-7 animate-spin" />
                    <span>Extracting Answer...</span>
                  </div>
                )}
              </div>
            )}

            {/* Live Words Feedback */}
            {(isListening || transcript || interimTranscript) && !pendingConfirmation && (
              <div className="mt-4 p-4 rounded-xl bg-slate-800/90 border border-slate-600 text-accessible-base font-semibold">
                <span className="text-xs uppercase tracking-wider block opacity-70 mb-1">
                  You are saying:
                </span>
                "{transcript || interimTranscript || 'Listening for speech...'}"
              </div>
            )}
          </div>

          {/* Form Fields List with Icon Representation */}
          <div className="space-y-4">
            {JOB_APPLICATION_FIELDS.map((field, idx) => {
              const isCurrent = idx === activeFieldIndex;
              const isFilled = Boolean(formData[field.id]);

              return (
                <div
                  key={field.id}
                  onClick={() => {
                    setActiveFieldIndex(idx);
                    setPendingConfirmation(null);
                  }}
                  className={`p-5 rounded-2xl border-4 transition-all cursor-pointer ${
                    isCurrent
                      ? isHighContrast
                        ? 'bg-black border-yellow-400 ring-4 ring-yellow-400'
                        : 'bg-slate-900 border-blue-500 ring-4 ring-blue-500/30 shadow-xl'
                      : isHighContrast
                      ? 'bg-black border-slate-700 opacity-90'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {/* Pictorial Icon */}
                      <span className="text-3xl" role="img" aria-hidden="true">
                        {getFieldEmoji(field.id)}
                      </span>

                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-lg border-2 ${
                          isFilled
                            ? 'bg-green-500 text-black border-green-300'
                            : isCurrent
                            ? isHighContrast
                              ? 'bg-yellow-400 text-black border-white'
                              : 'bg-blue-600 text-white border-blue-300'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isFilled ? '✓' : idx + 1}
                      </span>

                      <label className="text-xl sm:text-2xl font-bold cursor-pointer">
                        {field.label}
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      {isFilled && (
                        <span className="flex items-center gap-1 text-green-400 font-extrabold text-base">
                          <CheckCircle2 className="w-6 h-6" /> Confirmed
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(formData[field.id] ? `Saved value for ${field.label} is ${formData[field.id]}` : field.audio_prompt);
                        }}
                        aria-label={`Read ${field.label} aloud`}
                        className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600"
                      >
                        <Volume2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Input Display Area */}
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={2}
                      value={formData[field.id]}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      placeholder={field.placeholder}
                      className={`w-full p-4 rounded-xl text-accessible-base font-medium border-2 focus:outline-none transition-colors ${
                        isHighContrast
                          ? 'bg-black text-yellow-400 border-yellow-400 focus:ring-4 focus:ring-yellow-400'
                          : 'bg-slate-950 text-slate-100 border-slate-700 focus:border-blue-500'
                      }`}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.id]}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      placeholder={field.placeholder}
                      className={`w-full p-4 rounded-xl text-accessible-base font-medium border-2 focus:outline-none transition-colors ${
                        isHighContrast
                          ? 'bg-black text-yellow-400 border-yellow-400 focus:ring-4 focus:ring-yellow-400'
                          : 'bg-slate-950 text-slate-100 border-slate-700 focus:border-blue-500'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Actions Footer */}
          <div className="mt-8 pt-6 border-t-4 border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleReset}
              className={`accessible-button min-h-[64px] px-6 py-4 text-accessible-base font-bold rounded-2xl border-2 ${
                isHighContrast
                  ? 'bg-black text-yellow-400 border-yellow-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              Clear Fields
            </button>

            <button
              type="button"
              onClick={handleSubmitForm}
              disabled={completedCount === 0}
              className={`accessible-button min-h-[72px] px-10 py-5 text-accessible-xl font-black rounded-2xl border-4 transition-all ${
                isAllComplete
                  ? isHighContrast
                    ? 'bg-yellow-400 text-black border-black hover:bg-yellow-300 shadow-xl'
                    : 'bg-green-600 hover:bg-green-700 text-white border-green-300 shadow-xl shadow-green-600/30'
                  : isHighContrast
                  ? 'bg-yellow-400/80 text-black border-yellow-400'
                  : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-400'
              } ${completedCount === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Send className="w-8 h-8 mr-3" />
              {isAllComplete ? 'Submit Complete Application' : 'Save Partial Form'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AutoFormFiller;
