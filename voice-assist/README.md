# 🎙️ VoiceAssist — AI for Accessibility & Inclusion

> **Production-ready, zero-friction, voice-first web application designed for low-literacy adults, elderly individuals, visually impaired users, non-native speakers, and people with cognitive disabilities.**

Built with **WCAG 2.1 AAA Compliance**, **Google Gemini 2.5 Flash**, **Web Speech API**, **Node.js/Express**, and **Supabase PostgreSQL**.

---

## 🌟 Key Capabilities

1. **Zero-Click / One-Tap Voice Interface**:
   - Ultra-large microphone target (140px target size) with real-time volume reactivity.
   - High-contrast visual sound wave visualizer.
   - Auto-silence stop detection and automatic hands-free audio playback.
   - Accessible keyboard trigger: press Spacebar anywhere to start/stop speaking.

2. **Plain-Language Conversational Assistant (`/`)**:
   - Strictly enforces a **3rd-grade reading level**.
   - Maximum 2 short sentences (< 25 words total) for spoken responses.
   - Strips jargon, formatting symbols, and complex grammar.
   - Classifies intent: `FORM_FILLING`, `DOCUMENT_SIMPLIFICATION`, `GENERAL_ASSISTANCE`, `DEFINITION_LOOKUP`, `EMERGENCY_SUPPORT`.

3. **Voice-Guided Intelligent Form Filler (`/form-filler`)**:
   - Guided Job Application form demo with automated voice questions.
   - Natural speech slot filling (e.g., user says *"I worked at a bakery for three years making bread"*, AI extracts `job_title: "Baker", experience_years: 3`).
   - Hands-free auto-progression to next empty field.
   - `canvas-confetti` celebration upon form completion.

4. **Accessible Document & Message Simplifier (`/simplifier`)**:
   - Converts complicated letters, eviction notices, and medical bills from Grade 12+ down to Grade 3 plain language.
   - Returns a 5-word headline, short spoken summary, max 3 bullet points, and clear action step.

5. **Task History & Audio Review (`/history`)**:
   - Review past spoken queries, completed forms, and simplified letters.
   - One-tap "Listen Again" button to re-hear any past response.

6. **Full Accessibility Controls (`/settings`)**:
   - **Themes**: High-Contrast Yellow on Black (`#FFFF00` on `#000000`), Dark Mode, and Light Mode.
   - **Font Scaling**: Standard (20px), Large (24px default), Extra-Large (30px).
   - **Speech Playback**: 0.75x (slow), 1.0x (normal), 1.25x (fast), and pitch adjustments.
   - **Multilingual Support**: English (US), Spanish (ES), Hindi (IN), French (FR), Tagalog (PH), Arabic (SA).

---

## 🏗️ Architecture

```
voice-assist/
├── server/
│   ├── index.js                  # Express backend entrypoint (CORS, Rate Limiting)
│   ├── routes/
│   │   ├── assistRoutes.js       # Process-voice, extract-form, simplify-doc, history
│   │   └── voiceRoutes.js        # Fallback audio file transcribe endpoint
│   ├── controllers/
│   │   ├── assistController.js   # Gemini 2.5 Flash prompt schemas & fallback engine
│   │   └── voiceController.js    # Multimodal audio file processing
│   ├── lib/
│   │   ├── gemini.js             # Official @google/genai SDK setup & system prompt
│   │   ├── supabase.js           # Supabase client with local store fallback
│   │   └── validations.js        # Zod validation schemas
│   ├── middleware/
│   │   ├── rateLimiter.js        # Express 100 req/15min IP limiter
│   │   └── errorHandler.js       # Unified accessible error handler
│   └── package.json
├── client/
│   ├── index.html                # Atkinson Hyperlegible accessible font setup
│   ├── src/
│   │   ├── main.jsx              # React 18 DOM root
│   │   ├── App.jsx               # Accessible routing, skip-to-content, footer
│   │   ├── index.css             # WCAG AAA Yellow/Black CSS, 4px focus rings
│   │   ├── components/
│   │   │   ├── VoiceMicButton.jsx
│   │   │   ├── SpeechVisualizer.jsx
│   │   │   ├── AccessibleTextCard.jsx
│   │   │   ├── AutoFormFiller.jsx
│   │   │   ├── ContrastToggle.jsx
│   │   │   ├── LanguagePicker.jsx
│   │   │   └── Header.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── FormFillerPage.jsx
│   │   │   ├── SimplifierPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── hooks/
│   │   │   ├── useSpeechRecognition.js
│   │   │   ├── useSpeechSynthesis.js
│   │   │   └── useAccessibility.js
│   │   ├── context/
│   │   │   └── AccessibilityContext.jsx
│   │   └── utils/
│   │       ├── api.js
│   │       └── constants.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── supabase/
│   └── schema.sql                # Complete PostgreSQL tables, indexes & RLS policies
└── README.md
```

---

## 🚀 Getting Started

### 1. Backend Server Setup

```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_google_gemini_api_key_here
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
CORS_ORIGIN=http://localhost:5173
```

Start the backend:
```bash
npm run dev
# Server runs on http://localhost:5000
```

> **Note**: Even without active `GEMINI_API_KEY` or `SUPABASE` credentials, VoiceAssist automatically runs with an intelligent built-in accessibility rule engine and in-memory store so the app works 100% offline out-of-the-box!

### 2. Frontend Client Setup

```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the Vite dev server:
```bash
npm run dev
# Client runs on http://localhost:5173
```

### 3. Database Schema (Supabase)

Copy the SQL script in `supabase/schema.sql` and run it in your [Supabase SQL Editor](https://app.supabase.com) to create:
- `profiles`
- `voice_interactions`
- `saved_forms`
- `simplified_documents`
- Row-Level Security (RLS) policies and `updated_at` triggers.

---

## ♿ WCAG 2.1 AAA Accessibility Highlights

- **Visual Contrast**: 21:1 contrast ratio in High-Contrast Yellow on Black (`#FFFF00` on `#000000`).
- **Typography**: Minimum 24px body text, 36px+ headers, using the Atkinson Hyperlegible font designed by the Braille Institute.
- **Focus Indicators**: 4px high-contrast solid focus rings on all interactive targets.
- **Audio Feedback**: Web Audio API generated sound chimes for microphone open, close, and form submission.
- **Keyboard Friendly**: Spacebar toggles voice microphone from anywhere on the home page.
