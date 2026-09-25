import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

// Clean text specifically for TTS so speech engines never read aloud markdown symbols
function cleanTextForSpeech(text) {
  if (!text) return '';
  return text
    .replace(/[*#_~`>[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function useSpeechSynthesis() {
  const { language, speechRate, speechPitch } = useAccessibility();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [lastSpokenText, setLastSpokenText] = useState('');

  const utteranceRef = useRef(null);

  // Load available system voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Find best matching voice for selected language
  const getMatchingVoice = useCallback((langCode) => {
    if (!voices.length) return null;
    const prefix = langCode.split('-')[0].toLowerCase();
    // Exact match first
    let match = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    if (match) return match;
    // Prefix match (e.g. 'es' for 'es-ES')
    match = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    return match || voices[0];
  }, [voices]);

  // Speak text
  const speak = useCallback((text, customRate = null) => {
    if (!('speechSynthesis' in window) || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    setIsPaused(false);

    const clean = cleanTextForSpeech(text);
    if (!clean) return;

    setLastSpokenText(clean);

    const utterance = new SpeechSynthesisUtterance(clean);
    utteranceRef.current = utterance;

    utterance.lang = language;
    utterance.rate = customRate || speechRate;
    utterance.pitch = speechPitch;

    const matchedVoice = getMatchingVoice(language);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e.error);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [language, speechRate, speechPitch, getMatchingVoice]);

  // Stop speaking
  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  // Pause / Resume
  const pause = useCallback(() => {
    if ('speechSynthesis' in window && isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if ('speechSynthesis' in window && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  // Replay last spoken text
  const replay = useCallback((customRate = null) => {
    if (lastSpokenText) {
      speak(lastSpokenText, customRate);
    }
  }, [lastSpokenText, speak]);

  return {
    isSpeaking,
    isPaused,
    speak,
    stop,
    pause,
    resume,
    replay,
    lastSpokenText,
    voices
  };
}

export default useSpeechSynthesis;
