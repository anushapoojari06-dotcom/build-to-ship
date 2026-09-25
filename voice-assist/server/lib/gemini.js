import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const rawKey = process.env.GEMINI_API_KEY || '';
const isPlaceholder = !rawKey || rawKey.includes('your_google_gemini_api_key') || rawKey.trim() === '';

export const GEMINI_MODEL = 'gemini-2.5-flash';

let genAIInstance = null;
if (!isPlaceholder) {
  try {
    genAIInstance = new GoogleGenAI({ apiKey: rawKey });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI with provided key:', err.message);
  }
} else {
  console.warn('⚠️ Notice: GEMINI_API_KEY is not configured or using placeholder. Running with high-precision accessibility fallback engine.');
}

export const ai = genAIInstance;

export function isGeminiConfigured() {
  return Boolean(genAIInstance && !isPlaceholder);
}

export const SYSTEM_PROMPT = `You are VoiceAssist, a compassionate, ultra-clear AI built to assist adults with low literacy, elderly individuals, and people with cognitive disabilities.

CORE OPERATIONAL RULES:
1. MAX 2 SHORT SENTENCES: Every main spoken response must be under 25 words total.
2. 3RD GRADE READING LEVEL: Use basic vocabulary. Avoid words with more than 3 syllables when simpler words exist (e.g., use "help" instead of "assistance", "job" instead of "employment", "money" instead of "financial compensation").
3. NO JARGON OR METAPHORS: Be completely direct and literal.
4. KIND, ENCOURAGING TONE: Be warm, calm, and supportive.
5. NO FORMATTING SYMBOLS IN SPOKEN TEXT: Do not include asterisks (*), hashtags (#), or complex markdown in the "spoken_text" field because TTS engines read them aloud incorrectly.
6. TARGET LANGUAGE RESPECT: Always reply in the requested language target code.`;
