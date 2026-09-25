import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AccessibilityContext = createContext(null);

// Audio Cue generator using Web Audio API for zero network dependency
function playAccessibleTone(type = 'start') {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'start') {
      // Pleasant rising double chime for mic open
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'stop') {
      // Gentle descending chime for mic stop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'success') {
      // Happy major triad completion chime
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    } else if (type === 'confirm') {
      // Question prompt chime (two friendly pings)
      [440, 554.37].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.2);
      });
    }
  } catch (err) {
    // Ignore audio context limitations
  }
}

export function AccessibilityProvider({ children }) {
  // Theme: 'dark' | 'light' | 'high-contrast'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('voiceassist_theme') || 'dark';
  });

  // Font Scale: 'normal' (20px), 'large' (24px default), 'extralarge' (30px)
  const [fontScale, setFontScale] = useState(() => {
    return localStorage.getItem('voiceassist_font_scale') || 'large';
  });

  // Language: Default to en-US or Indian languages
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('voiceassist_language') || 'en-US';
  });

  // Speech Rate: 0.75, 1.0 (default), 1.25
  const [speechRate, setSpeechRate] = useState(() => {
    const saved = localStorage.getItem('voiceassist_speech_rate');
    return saved ? parseFloat(saved) : 1.0;
  });

  // Speech Pitch: 0.85, 1.0, 1.2
  const [speechPitch, setSpeechPitch] = useState(() => {
    const saved = localStorage.getItem('voiceassist_speech_pitch');
    return saved ? parseFloat(saved) : 1.0;
  });

  // Sound Feedback
  const [soundFeedback, setSoundFeedback] = useState(() => {
    return localStorage.getItem('voiceassist_sound') !== 'false';
  });

  // Real Network Status
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  // Simulated Offline Mode (for demonstrations & rural resilience testing)
  const [simulatedOffline, setSimulatedOffline] = useState(() => {
    return localStorage.getItem('voiceassist_simulated_offline') === 'true';
  });

  // Low Bandwidth Mode (for 2G/weak connectivity in rural areas)
  const [lowBandwidthMode, setLowBandwidthMode] = useState(() => {
    return localStorage.getItem('voiceassist_low_bandwidth') === 'true';
  });

  // Hands-free Voice Navigation (say 'next', 'repeat', 'home', etc.)
  const [voiceNavEnabled, setVoiceNavEnabled] = useState(() => {
    return localStorage.getItem('voiceassist_voice_nav') !== 'false';
  });

  // Privacy Notice Visibility
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(() => {
    return localStorage.getItem('voiceassist_privacy_banner') !== 'false';
  });

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Apply theme and font scaling classes directly to document.body
  useEffect(() => {
    const body = document.body;
    body.classList.remove('theme-dark', 'theme-light', 'theme-high-contrast');
    body.classList.add(`theme-${theme}`);
    localStorage.setItem('voiceassist_theme', theme);
  }, [theme]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-extralarge');
    body.classList.add(`font-scale-${fontScale}`);
    localStorage.setItem('voiceassist_font_scale', fontScale);
  }, [fontScale]);

  useEffect(() => {
    localStorage.setItem('voiceassist_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('voiceassist_speech_rate', speechRate.toString());
  }, [speechRate]);

  useEffect(() => {
    localStorage.setItem('voiceassist_speech_pitch', speechPitch.toString());
  }, [speechPitch]);

  useEffect(() => {
    localStorage.setItem('voiceassist_sound', soundFeedback.toString());
  }, [soundFeedback]);

  useEffect(() => {
    localStorage.setItem('voiceassist_simulated_offline', simulatedOffline.toString());
  }, [simulatedOffline]);

  useEffect(() => {
    localStorage.setItem('voiceassist_low_bandwidth', lowBandwidthMode.toString());
  }, [lowBandwidthMode]);

  useEffect(() => {
    localStorage.setItem('voiceassist_voice_nav', voiceNavEnabled.toString());
  }, [voiceNavEnabled]);

  useEffect(() => {
    localStorage.setItem('voiceassist_privacy_banner', showPrivacyNotice.toString());
  }, [showPrivacyNotice]);

  // Audio Cue Trigger
  const triggerAudioCue = useCallback((type) => {
    if (soundFeedback) {
      playAccessibleTone(type);
    }
  }, [soundFeedback]);

  // Quick toggle between high-contrast and normal
  const toggleContrast = useCallback(() => {
    setTheme(prev => (prev === 'high-contrast' ? 'dark' : 'high-contrast'));
  }, []);

  // Effective connectivity (offline if real offline OR simulated offline)
  const isEffectivelyOnline = isOnline && !simulatedOffline;

  const value = {
    theme,
    setTheme,
    toggleContrast,
    isHighContrast: theme === 'high-contrast',
    fontScale,
    setFontScale,
    language,
    setLanguage,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    soundFeedback,
    setSoundFeedback,
    triggerAudioCue,
    isOnline,
    simulatedOffline,
    setSimulatedOffline,
    isEffectivelyOnline,
    lowBandwidthMode,
    setLowBandwidthMode,
    voiceNavEnabled,
    setVoiceNavEnabled,
    showPrivacyNotice,
    setShowPrivacyNotice
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
