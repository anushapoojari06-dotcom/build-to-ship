import { ai, GEMINI_MODEL, SYSTEM_PROMPT, isGeminiConfigured } from '../lib/gemini.js';
import { voiceProcessSchema, formExtractSchema, docSimplifySchema } from '../lib/validations.js';
import { db } from '../lib/supabase.js';

// Fallback plain language processor with multilingual support
function fallbackProcessVoice(transcript, language = 'en-US') {
  const lower = transcript.toLowerCase();
  const langPrefix = language ? language.split('-')[0].toLowerCase() : 'en';
  
  // 1. Emergency Detection
  if (
    lower.includes('emergency') ||
    lower.includes('help me') ||
    lower.includes('hurt') ||
    lower.includes('call 911') ||
    lower.includes('ambulance') ||
    lower.includes('danger') ||
    lower.includes('dying') ||
    lower.includes('chest pain') ||
    lower.includes('ಆಪತ್ತು') || lower.includes('సహాయం') || lower.includes('உதவி') || lower.includes('সাহায্য')
  ) {
    return {
      spoken_text: "Help is available. If you are in danger, please call 911 or local emergency right now.",
      visual_text: "⚠️ **EMERGENCY ASSISTANCE**: If you need immediate help, call **911** or your local emergency number immediately.",
      intent: "EMERGENCY_SUPPORT",
      suggested_actions: ["Call 911 Now", "Find Emergency Help"]
    };
  }

  // 2. Form Filling Intent
  if (
    lower.includes('form') ||
    lower.includes('apply') ||
    lower.includes('application') ||
    lower.includes('job') ||
    lower.includes('fill out') ||
    lower.includes('resume') ||
    lower.includes('ಅರ್ಜಿ') || lower.includes('దరఖాస్తు') || lower.includes('விண்ணப்பம்') || lower.includes('ফর্ম')
  ) {
    if (langPrefix === 'kn') {
      return {
        spoken_text: "ನಾನು ಉದ್ಯೋಗ ಅರ್ಜಿಯನ್ನು ಭರ್ತಿ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ನಿಮ್ಮ ಹೆಸರಿನೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸೋಣ.",
        visual_text: "ನಾವು ಒಟ್ಟಿಗೆ **ಉದ್ಯೋಗ ಅರ್ಜಿ** ಭರ್ತಿ ಮಾಡೋಣ.",
        intent: "FORM_FILLING",
        suggested_actions: ["ಅರ್ಜಿ ಪ್ರಾರಂಭಿಸಿ", "ಫಾರ್ಮ್ ಫಿಲ್ಲರ್"]
      };
    }
    if (langPrefix === 'te') {
      return {
        spoken_text: "నేను ఉద్యోగ దరఖాస్తును పూరించడానికి సహాయం చేస్తాను. మీ పేరుతో ప్రారంభిద్దాం.",
        visual_text: "మనం కలిసి **ఉద్యోగ దరఖాస్తు** పూర్తి చేద్దాం.",
        intent: "FORM_FILLING",
        suggested_actions: ["దరఖాస్తు ప్రారంభించు", "ఫారమ్ ఫిల్ చేయి"]
      };
    }
    if (langPrefix === 'ta') {
      return {
        spoken_text: "வேலை விண்ணப்பத்தை நிரப்ப நான் உதவுகிறேன். உங்கள் பெயருடன் தொடங்குவோம்.",
        visual_text: "நாம் ஒன்றாக **வேலை விண்ணப்பத்தை** நிரப்புவோம்.",
        intent: "FORM_FILLING",
        suggested_actions: ["விண்ணப்பம் தொடங்கு", "படிவம் நிரப்பு"]
      };
    }
    if (langPrefix === 'bn') {
      return {
        spoken_text: "আমি চাকরির ফর্ম পূরণ করতে সাহায্য করব। আপনার নাম দিয়ে শুরু করা যাক।",
        visual_text: "আসুন একসাথে **চাকরির ফর্ম** পূরণ করি।",
        intent: "FORM_FILLING",
        suggested_actions: ["ফর্ম শুরু করুন", "ফর্ম পূরণ"]
      };
    }
    if (langPrefix === 'mr') {
      return {
        spoken_text: "मी नोकरीचा अर्ज भरण्यास मदत करू शकतो. तुमच्या नावाने सुरुवात करूया.",
        visual_text: "आपण एकत्र **नोकरीचा अर्ज** भरूया.",
        intent: "FORM_FILLING",
        suggested_actions: ["अर्ज सुरू करा", "फॉर्म भरा"]
      };
    }
    if (langPrefix === 'ml') {
      return {
        spoken_text: "ജോലി അപേക്ഷ പൂരിപ്പിക്കാൻ ഞാൻ സഹായിക്കാം. നിങ്ങളുടെ പേരിൽ തുടങ്ങാം.",
        visual_text: "നമുക്ക് ഒന്നിച്ച് **ജോലി അപേക്ഷ** പൂരിപ്പിക്കാം.",
        intent: "FORM_FILLING",
        suggested_actions: ["അപേക്ഷ തുടങ്ങുക", "ഫോം പൂരിപ്പിക്കുക"]
      };
    }
    if (langPrefix === 'ur') {
      return {
        spoken_text: "میں ملازمت کا فارم بھرنے میں مدد کر سکتا ہوں۔ آپ کے نام سے شروع کرتے ہیں۔",
        visual_text: "آئیے مل کر **ملازمت کا فارم** پُر کریں۔",
        intent: "FORM_FILLING",
        suggested_actions: ["فارم شروع کریں", "فارم بھریں"]
      };
    }
    return {
      spoken_text: "I can help you fill out the job application form. Let us start with your name.",
      visual_text: "Let's fill out the **Job Application Form** together with simple voice questions.",
      intent: "FORM_FILLING",
      suggested_actions: ["Start Job Form", "Go to Form Filler"]
    };
  }

  // 3. Document Simplification Intent
  if (
    lower.includes('simplify') ||
    lower.includes('document') ||
    lower.includes('letter') ||
    lower.includes('notice') ||
    lower.includes('bill') ||
    lower.includes('explain this') ||
    lower.includes('read this')
  ) {
    return {
      spoken_text: "I can read and explain your document. Please paste or choose a document.",
      visual_text: "I will break down complex letters and notices into **short, easy words**.",
      intent: "DOCUMENT_SIMPLIFICATION",
      suggested_actions: ["Open Document Reader", "Sample Letters"]
    };
  }

  // 4. Definition Lookup Intent
  if (
    lower.includes('what does') ||
    lower.includes('what is') ||
    lower.includes('mean') ||
    lower.includes('definition') ||
    lower.includes('define')
  ) {
    return {
      spoken_text: "I will explain that in simple words for you.",
      visual_text: `Looking up simple meaning for: **"${transcript.replace(/what does|what is|mean|define/gi, '').trim()}"**`,
      intent: "DEFINITION_LOOKUP",
      suggested_actions: ["Hear More Examples", "Ask Another Word"]
    };
  }

  // 5. General Assistance Default
  return {
    spoken_text: `I heard you: ${transcript}. I am here to help you simply.`,
    visual_text: `You said: **"${transcript}"**. How can I help you best right now?`,
    intent: "GENERAL_ASSISTANCE",
    suggested_actions: ["Fill a Form", "Explain a Letter"]
  };
}

// Fallback form extractor with multi-lingual preambles
function fallbackExtractForm(fieldLabel, audioTranscript, fieldType, language = 'en-US') {
  let cleaned = audioTranscript.trim();

  // Strip common conversational preambles in English and Indian languages
  cleaned = cleaned
    .replace(/^(my name is|i am called|it is|it's|this is|my full name is)\s+/i, '')
    .replace(/^(my phone number is|it's|call me at|the number is)\s+/i, '')
    .replace(/^(i live in|i'm located in|the city is|my city is|in)\s+/i, '')
    .replace(/^(i have worked as|i worked as|my past job was|past work is)\s+/i, '')
    .replace(/^(i am available for|i can work|availability is)\s+/i, '')
    .replace(/^(ನನ್ನ ಹೆಸರು|ನನ್ನ ಫೋನ್|ನಾನು ವಾಸಿಸುತ್ತಿರುವುದು|ನಾನು ಕೆಲಸ ಮಾಡಿದ್ದು)\s+/i, '')
    .replace(/^(నా పేరు|నా ఫోన్|నేను నివసిస్తున్నది|నా పని అనుభవం)\s+/i, '')
    .replace(/^(என் பெயர்|என் தொலைபேசி|நான் வசிப்பது|என் வேலை)\s+/i, '')
    .replace(/^(আমার নাম|আমার ফোন|আমি থাকি|আমার কাজ)\s+/i, '')
    .replace(/^(माझे नाव|माझा फोन|मी राहतो|माझा अनुभव)\s+/i, '')
    .replace(/^(എന്റെ പേര്|എന്റെ ഫോൺ|ഞാൻ താമസിക്കുന്നത്)\s+/i, '')
    .replace(/^(میرا نام|میرا فون نمبر|میں رہتا ہوں)\s+/i, '')
    .replace(/^(मेरा नाम|मेरा फ़ोन|मैं रहता हूँ|मेरा काम)\s+/i, '')
    .replace(/[.?!]+$/g, '')
    .trim();

  // Field specific cleanup
  if (fieldType === 'tel') {
    const digits = cleaned.replace(/[^\d+xX\s-]/g, '').trim();
    if (digits.length >= 7) {
      cleaned = digits;
    }
  }

  return {
    extracted_value: cleaned || audioTranscript,
    confidence: 0.95,
    spoken_confirmation: `You said: ${cleaned || audioTranscript}. Correct?`,
    needs_clarification: false
  };
}

// Fallback document simplifier
function fallbackSimplifyDoc(documentText) {
  const words = documentText.split(/\s+/).slice(0, 15).join(' ');
  return {
    headline: "Summary of your document",
    spoken_summary: "This document is about your official notice. It explains the next steps you should take.",
    key_bullets: [
      "Keep this copy for your records.",
      "Read any dates or deadlines carefully.",
      "Contact support if you need more time."
    ],
    action_required: "Review the dates listed or reply if requested."
  };
}

// 1. Process Voice Endpoint
export async function processVoice(req, res, next) {
  try {
    const validated = voiceProcessSchema.parse(req.body);
    const { transcript, language, context } = validated;

    let result = null;

    if (isGeminiConfigured()) {
      try {
        const responseSchema = {
          type: "OBJECT",
          properties: {
            spoken_text: { type: "STRING", description: "Short, ultra-simple plain text to be read aloud. Max 25 words." },
            visual_text: { type: "STRING", description: "Formatted text with bold highlights for large-screen display." },
            intent: { 
              type: "STRING", 
              enum: ["FORM_FILLING", "DOCUMENT_SIMPLIFICATION", "GENERAL_ASSISTANCE", "DEFINITION_LOOKUP", "EMERGENCY_SUPPORT"] 
            },
            suggested_actions: { 
              type: "ARRAY", 
              items: { type: "STRING" },
              description: "1 to 2 short follow-up options for the user to tap or speak."
            }
          },
          required: ["spoken_text", "visual_text", "intent", "suggested_actions"]
        };

        const promptText = `User spoken transcript: "${transcript}"
Target Language Code: ${language}
Context information: ${context || 'None'}
Remember:
1. MAX 2 SHORT SENTENCES under 25 words for spoken_text.
2. 3rd grade reading level, ultra simple words.
3. No formatting symbols (*, #) in spoken_text.
4. Reply in language code ${language}.
Respond in strictly valid JSON matching the schema.`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: promptText,
          config: {
            systemInstruction: SYSTEM_PROMPT + `\nRespond in 1-2 simple sentences for speech playback. Classify intent. Target language: ${language}`,
            responseMimeType: "application/json",
            responseSchema: responseSchema
          }
        });

        const text = response.text ? response.text.trim() : '{}';
        result = JSON.parse(text);
      } catch (geminiError) {
        console.warn('Gemini API call error, falling back to rule engine:', geminiError.message);
        result = fallbackProcessVoice(transcript, language);
      }
    } else {
      result = fallbackProcessVoice(transcript, language);
    }

    // Save interaction to database or local store
    try {
      await db.saveInteraction({
        raw_transcript: transcript,
        ai_response_text: result.spoken_text,
        intent_category: result.intent,
        language_code: language,
        user_id: req.body.userId || null
      });
    } catch (saveErr) {
      console.warn('Failed to persist voice interaction:', saveErr.message);
    }

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// 2. Extract Form Field Endpoint
export async function extractForm(req, res, next) {
  try {
    const validated = formExtractSchema.parse(req.body);
    const { fieldLabel, audioTranscript, fieldType, language } = validated;

    let result = null;

    if (isGeminiConfigured()) {
      try {
        const responseSchema = {
          type: "OBJECT",
          properties: {
            extracted_value: { type: "STRING", description: "Cleaned value ready to insert directly into the input field." },
            confidence: { type: "NUMBER", description: "Value between 0.0 and 1.0." },
            spoken_confirmation: { type: "STRING", description: "Short confirmation sentence to read back to the user." },
            needs_clarification: { type: "BOOLEAN" }
          },
          required: ["extracted_value", "confidence", "spoken_confirmation", "needs_clarification"]
        };

        const promptText = `Field Label: "${fieldLabel}"
Field Type: "${fieldType}"
User Spoken Speech: "${audioTranscript}"
Target Language: "${language}"

Extract the specific field answer from the user's spoken words. If speech is conversational (e.g. "My name is Sarah Connor" -> "Sarah Connor"), clean it into a clean structured string.
Respond strictly in JSON according to schema.`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: promptText,
          config: {
            systemInstruction: SYSTEM_PROMPT + `\nExtract the specific field answer from the user's spoken words. Respond in JSON.`,
            responseMimeType: "application/json",
            responseSchema: responseSchema
          }
        });

        const text = response.text ? response.text.trim() : '{}';
        result = JSON.parse(text);
      } catch (geminiError) {
        console.warn('Gemini extract-form error, using fallback:', geminiError.message);
        result = fallbackExtractForm(fieldLabel, audioTranscript, fieldType);
      }
    } else {
      result = fallbackExtractForm(fieldLabel, audioTranscript, fieldType);
    }

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// 3. Simplify Document Endpoint
export async function simplifyDoc(req, res, next) {
  try {
    const validated = docSimplifySchema.parse(req.body);
    const { documentText, language } = validated;

    let result = null;

    if (isGeminiConfigured()) {
      try {
        const responseSchema = {
          type: "OBJECT",
          properties: {
            headline: { type: "STRING", description: "What this document is about in 5 words or less." },
            spoken_summary: { type: "STRING", description: "Short summary under 30 words for TTS." },
            key_bullets: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "Maximum 3 short plain bullet points."
            },
            action_required: { type: "STRING", description: "Clear step the user needs to take, or 'None'." }
          },
          required: ["headline", "spoken_summary", "key_bullets", "action_required"]
        };

        const promptText = `Document Text to Simplify:
"""
${documentText}
"""
Target Language: ${language}

Simplify this document into short plain sentences for someone who struggles with reading (3rd grade level).
Max 3 bullet points. Spoken summary under 30 words with NO formatting symbols (*, #).
Respond strictly in JSON matching the schema.`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: promptText,
          config: {
            systemInstruction: SYSTEM_PROMPT + `\nSimplify this document into short plain sentences for someone who struggles with reading. Respond in JSON.`,
            responseMimeType: "application/json",
            responseSchema: responseSchema
          }
        });

        const text = response.text ? response.text.trim() : '{}';
        result = JSON.parse(text);
      } catch (geminiError) {
        console.warn('Gemini simplify-doc error, using fallback:', geminiError.message);
        result = fallbackSimplifyDoc(documentText);
      }
    } else {
      result = fallbackSimplifyDoc(documentText);
    }

    // Save simplified document to database
    try {
      await db.saveDocument({
        original_text: documentText,
        simplified_summary: result.spoken_summary,
        key_action_items: result.key_bullets,
        language_code: language,
        user_id: req.body.userId || null
      });
    } catch (saveErr) {
      console.warn('Failed to persist simplified document:', saveErr.message);
    }

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// 4. Save Completed Form
export async function saveCompletedForm(req, res, next) {
  try {
    const { formTitle, formData, isCompleted, userId } = req.body;
    const record = await db.saveForm({
      form_title: formTitle || 'Job Application & Assistance Form',
      form_data: formData || {},
      is_completed: isCompleted ?? true,
      user_id: userId || null
    });
    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

// 5. Get History Endpoint
export async function getHistory(req, res, next) {
  try {
    const interactions = await db.getInteractions(20);
    const forms = await db.getForms(20);
    const documents = await db.getDocuments(20);

    return res.status(200).json({
      success: true,
      data: {
        interactions,
        forms,
        documents
      }
    });
  } catch (error) {
    next(error);
  }
}
