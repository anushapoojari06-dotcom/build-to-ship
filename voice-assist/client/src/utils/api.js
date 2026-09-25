function getApiBase() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || envUrl.startsWith('eyJ') || (!envUrl.startsWith('http') && !envUrl.startsWith('/'))) {
    return 'http://localhost:5000/api';
  }
  return envUrl;
}
const API_BASE = getApiBase();

// Check if currently operating in offline mode
function isOffline() {
  const isSimulated = localStorage.getItem('voiceassist_simulated_offline') === 'true';
  const realOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  return isSimulated || realOffline;
}

// Local cache keys
const CACHE_KEYS = {
  INTERACTIONS: 'voiceassist_cached_interactions',
  FORMS: 'voiceassist_cached_forms',
  DOCUMENTS: 'voiceassist_cached_docs'
};

function getLocalCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function addToLocalCache(key, item) {
  try {
    const list = getLocalCache(key);
    list.unshift(item);
    localStorage.setItem(key, JSON.stringify(list.slice(0, 50)));
  } catch (e) {}
}

// Multilingual offline fallback responses
function getOfflineSpokenResponse(transcript, language) {
  const langPrefix = language ? language.split('-')[0].toLowerCase() : 'en';

  if (langPrefix === 'kn') {
    return {
      spoken_text: `ನಾನು ಕೇಳಿದೆ: ${transcript}. ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ.`,
      visual_text: `ನೀವು ಹೇಳಿದ್ದು: **"${transcript}"**. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`,
      intent: 'GENERAL_ASSISTANCE',
      suggested_actions: ['ಉದ್ಯೋಗ ಅರ್ಜಿ ಭರ್ತಿ', 'ಪತ್ರ ಸರಳಗೊಳಿಸಿ']
    };
  }
  if (langPrefix === 'te') {
    return {
      spoken_text: `నేను విన్నాను: ${transcript}. నేను మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను.`,
      visual_text: `మీరు చెప్పారు: **"${transcript}"**. నేను మీకు ఎలా సహాయపడగలను?`,
      intent: 'GENERAL_ASSISTANCE',
      suggested_actions: ['ఉద్యోగ దరఖాస్తు', 'పత్రం సులభతరం చేయండి']
    };
  }
  if (langPrefix === 'ta') {
    return {
      spoken_text: `நான் கேட்டேன்: ${transcript}. நான் உங்களுக்கு உதவ இங்கே இருக்கிறேன்.`,
      visual_text: `நீங்கள் சொன்னது: **"${transcript}"**. நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?`,
      intent: 'GENERAL_ASSISTANCE',
      suggested_actions: ['வேலை விண்ணப்பம்', 'ஆவணத்தை சுருக்கவும்']
    };
  }
  if (langPrefix === 'bn') {
    return {
      spoken_text: `আমি শুনেছি: ${transcript}। আমি আপনাকে সাহায্য করতে এখানে আছি।`,
      visual_text: `আপনি বলেছেন: **"${transcript}"**। আমি কীভাবে আপনাকে সাহায্য করতে পারি?`,
      intent: 'GENERAL_ASSISTANCE',
      suggested_actions: ['চাকরির ফর্ম পূরণ', 'চিঠি সহজ করুন']
    };
  }
  if (langPrefix === 'mr') {
    return {
      spoken_text: `मी ऐकले: ${transcript}. मी तुम्हाला मदत करण्यासाठी येथे आहे.`,
      visual_text: `तुम्ही म्हणालात: **"${transcript}"**. मी कशी मदत करू?`,
      intent: 'GENERAL_ASSISTANCE',
      suggested_actions: ['नोकरी अर्ज भरा', 'दस्तऐवज सोपे करा']
    };
  }
  if (langPrefix === 'ml') {
    return {
      spoken_text: `ഞാൻ കേട്ടു: ${transcript}. ഞാൻ നിങ്ങളെ സഹായിക്കാൻ ഇവിടെയുണ്ട്.`,
      visual_text: `നിങ്ങൾ പറഞ്ഞു: **"${transcript}"**. ഞാൻ എങ്ങനെ സഹായിക്കണം?`,
      intent: 'GENERAL_ASSISTANCE',
      suggested_actions: ['തൊഴിൽ അപേക്ഷ', 'രേഖ ലളിതമാക്കുക']
    };
  }
  if (langPrefix === 'ur') {
    return {
      spoken_text: `میں نے سنا: ${transcript}۔ میں آپ کی مدد کے لیے حاضر ہوں۔`,
      visual_text: `آپ نے کہا: **"${transcript}"**۔ میں آپ کی کیا مدد کر سکتا ہوں؟`,
      intent: 'GENERAL_ASSISTANCE',
      suggested_actions: ['ملازمت فارم پُر کریں', 'دستاویز آسان بنائیں']
    };
  }
  if (langPrefix === 'hi') {
    return {
      spoken_text: `मैंने सुना: ${transcript}। मैं आपकी मदद के लिए यहाँ हूँ।`,
      visual_text: `आपने कहा: **"${transcript}"**। मैं आपकी कैसे मदद करूँ?`,
      intent: 'GENERAL_ASSISTANCE',
      suggested_actions: ['नौकरी का फॉर्म भरें', 'पत्र सरल करें']
    };
  }

  // Default English fallback
  return {
    spoken_text: `I heard: ${transcript}. I am here to help you.`,
    visual_text: `You said: **"${transcript}"**. How would you like me to help?`,
    intent: 'GENERAL_ASSISTANCE',
    suggested_actions: ['Fill Job Form', 'Simplify Document']
  };
}

export async function processVoiceAPI({ transcript, language = 'en-US', context }) {
  if (isOffline()) {
    const offlineResult = getOfflineSpokenResponse(transcript, language);
    addToLocalCache(CACHE_KEYS.INTERACTIONS, {
      id: 'offline-' + Date.now(),
      raw_transcript: transcript,
      ai_response_text: offlineResult.spoken_text,
      intent_category: offlineResult.intent,
      created_at: new Date().toISOString()
    });
    return offlineResult;
  }

  try {
    const res = await fetch(`${API_BASE}/assist/process-voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, language, context })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to process voice command');
    }
    return json.data;
  } catch (error) {
    console.warn('API error, using local offline fallback:', error.message);
    const offlineResult = getOfflineSpokenResponse(transcript, language);
    addToLocalCache(CACHE_KEYS.INTERACTIONS, {
      id: 'local-' + Date.now(),
      raw_transcript: transcript,
      ai_response_text: offlineResult.spoken_text,
      intent_category: offlineResult.intent,
      created_at: new Date().toISOString()
    });
    return offlineResult;
  }
}

export async function extractFormAPI({ fieldLabel, audioTranscript, fieldType = 'text', language = 'en-US' }) {
  // Intelligent client-side slot extractor for offline & real-time zero-friction use
  const cleanTranscript = (text) => {
    return text
      .replace(/^(my name is|i am called|it is|it's|this is|my phone number is|i live in|i worked as|my past job was|my city is|i can work)\s+/i, '')
      .replace(/^(ನನ್ನ ಹೆಸರು|ನನ್ನ ಫೋನ್|ನಾನು ವಾಸಿಸುತ್ತಿರುವುದು)\s+/i, '')
      .replace(/^(నా పేరు|నా ఫోన్|నేను నివసిస్తున్నది)\s+/i, '')
      .replace(/^(என் பெயர்|என் தொலைபேசி|நான் வசிப்பது)\s+/i, '')
      .replace(/^(আমার নাম|আমার ফোন|আমি থাকি)\s+/i, '')
      .replace(/^(माझे नाव|माझा फोन|मी राहतो)\s+/i, '')
      .replace(/^(എന്റെ പേര്|എന്റെ ഫോൺ|ഞാൻ താമസിക്കുന്നത്)\s+/i, '')
      .replace(/^(میرا نام|میرا فون نمبر|میں رہتا ہوں)\s+/i, '')
      .replace(/^(मेरा नाम|मेरा फ़ोन|मैं रहता हूँ)\s+/i, '')
      .replace(/[.?!]+$/g, '')
      .trim();
  };

  if (isOffline()) {
    const cleaned = cleanTranscript(audioTranscript) || audioTranscript;
    return {
      extracted_value: cleaned,
      confidence: 0.95,
      spoken_confirmation: `You said: ${cleaned}. Is this correct?`,
      needs_clarification: false
    };
  }

  try {
    const res = await fetch(`${API_BASE}/assist/extract-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fieldLabel, audioTranscript, fieldType, language })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to extract form field');
    }
    return json.data;
  } catch (error) {
    console.warn('API error, using local fallback extractor:', error.message);
    const cleaned = cleanTranscript(audioTranscript) || audioTranscript;
    return {
      extracted_value: cleaned,
      confidence: 0.9,
      spoken_confirmation: `You said: ${cleaned}. Is this correct?`,
      needs_clarification: false
    };
  }
}

export async function simplifyDocAPI({ documentText, language = 'en-US' }) {
  if (isOffline()) {
    const offlineDoc = {
      headline: 'Official Notice Summary (Offline)',
      spoken_summary: 'This is an official document. Check dates and follow any required steps.',
      key_bullets: [
        'Keep this copy safely for your records.',
        'Check any deadline dates carefully.',
        'Contact help if you need more time.'
      ],
      action_required: 'Check any dates or payment amounts mentioned.'
    };
    addToLocalCache(CACHE_KEYS.DOCUMENTS, {
      id: 'offline-doc-' + Date.now(),
      original_text: documentText,
      simplified_summary: offlineDoc.spoken_summary,
      key_action_items: offlineDoc.key_bullets,
      created_at: new Date().toISOString()
    });
    return offlineDoc;
  }

  try {
    const res = await fetch(`${API_BASE}/assist/simplify-doc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentText, language })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to simplify document');
    }
    return json.data;
  } catch (error) {
    console.warn('API error, using client fallback simplifier:', error.message);
    return {
      headline: 'Document Summary',
      spoken_summary: 'This document is an official notice. Please check if any dates or payments are listed.',
      key_bullets: [
        'Keep this copy safely for your records.',
        'Check any deadline dates carefully.',
        'Call for assistance if anything is unclear.'
      ],
      action_required: 'Review dates and follow instructions.'
    };
  }
}

export async function saveFormAPI({ formTitle, formData, isCompleted = true, userId = null }) {
  const localRecord = {
    id: 'form-' + Date.now(),
    form_title: formTitle,
    form_data: formData,
    is_completed: isCompleted,
    created_at: new Date().toISOString()
  };
  addToLocalCache(CACHE_KEYS.FORMS, localRecord);

  if (!isOffline()) {
    try {
      const res = await fetch(`${API_BASE}/assist/save-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formTitle, formData, isCompleted, userId })
      });
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.warn('Server form save failed, cached locally:', error.message);
    }
  }
  return localRecord;
}

export async function getHistoryAPI() {
  const cachedInteractions = getLocalCache(CACHE_KEYS.INTERACTIONS);
  const cachedForms = getLocalCache(CACHE_KEYS.FORMS);
  const cachedDocs = getLocalCache(CACHE_KEYS.DOCUMENTS);

  if (isOffline()) {
    return {
      interactions: cachedInteractions,
      forms: cachedForms,
      documents: cachedDocs
    };
  }

  try {
    const res = await fetch(`${API_BASE}/assist/history`);
    const json = await res.json();
    if (json.success) {
      return {
        interactions: [...(json.data.interactions || []), ...cachedInteractions],
        forms: [...(json.data.forms || []), ...cachedForms],
        documents: [...(json.data.documents || []), ...cachedDocs]
      };
    }
    return {
      interactions: cachedInteractions,
      forms: cachedForms,
      documents: cachedDocs
    };
  } catch (error) {
    return {
      interactions: cachedInteractions,
      forms: cachedForms,
      documents: cachedDocs
    };
  }
}

export async function transcribeAudioBlob(audioBlob) {
  if (isOffline()) return null;
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-recording.webm');

    const res = await fetch(`${API_BASE}/voice/transcribe`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Transcription failed');
    }
    return json.transcript;
  } catch (error) {
    console.warn('Server transcribe error:', error.message);
    return null;
  }
}
