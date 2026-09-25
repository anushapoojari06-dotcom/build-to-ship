import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { transcribeAudioBlob } from '../utils/api';

export function useSpeechRecognition({ onResult, onSilenceStop } = {}) {
  const { language, triggerAudioCue } = useAccessibility();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [volume, setVolume] = useState(0); // 0 to 100 for live visualizer
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Check browser support for Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API is not supported in this browser. Fallback audio recorder will be used.');
      setIsSupported(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (e) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Start real-time audio volume analyser
  const startVolumeAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Normalize 0 - 100
        const norm = Math.min(100, Math.round((average / 128) * 100));
        setVolume(norm);

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();

      // Setup media recorder for fallback audio capture
      try {
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.start();
      } catch (recErr) {
        console.warn('MediaRecorder error:', recErr);
      }
    } catch (micErr) {
      console.warn('Microphone stream access error:', micErr);
    }
  };

  const stopVolumeAnalyser = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setVolume(0);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
  };

  // Reset auto-silence timer
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    // After 2.5 seconds of silence, automatically stop and trigger
    silenceTimerRef.current = setTimeout(() => {
      if (isListening) {
        console.log('Auto-silence detected: stopping speech capture.');
        stopListening();
        if (onSilenceStop) onSilenceStop();
      }
    }, 2800);
  }, [isListening, onSilenceStop]);

  // Start Voice Listening
  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    triggerAudioCue('start');

    await startVolumeAnalyser();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onstart = () => {
          setIsListening(true);
          resetSilenceTimer();
        };

        recognition.onresult = (event) => {
          resetSilenceTimer();
          let finalStr = '';
          let interimStr = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) {
              finalStr += res[0].transcript;
            } else {
              interimStr += res[0].transcript;
            }
          }

          if (finalStr) {
            setTranscript(prev => (prev ? `${prev} ${finalStr}` : finalStr));
            if (onResult) onResult(finalStr, true);
          }

          setInterimTranscript(interimStr);
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition event error:', event.error);
          if (event.error === 'not-allowed') {
            setError('Microphone access was denied. Please allow microphone permissions.');
          } else if (event.error !== 'no-speech') {
            setError(`Speech recognition notice: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          stopVolumeAnalyser();
          triggerAudioCue('stop');
        };

        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error('Error starting SpeechRecognition:', e);
        setIsListening(true);
      }
    } else {
      // Fallback mode without Web Speech API
      setIsListening(true);
    }
  }, [language, triggerAudioCue, onResult, resetSilenceTimer]);

  // Stop Voice Listening
  const stopListening = useCallback(async () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // Process fallback audio recording if Web Speech wasn't active or no words were caught
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = async () => {
        if (audioChunksRef.current.length > 0 && !transcript) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const text = await transcribeAudioBlob(audioBlob);
          if (text) {
            setTranscript(text);
            if (onResult) onResult(text, true);
          }
        }
      };
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    stopVolumeAnalyser();
    setIsListening(false);
    triggerAudioCue('stop');
  }, [transcript, onResult, triggerAudioCue]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    interimTranscript,
    volume,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    setTranscript
  };
}

export default useSpeechRecognition;
