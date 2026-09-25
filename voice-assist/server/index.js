import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import assistRoutes from './routes/assistRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { isGeminiConfigured } from './lib/gemini.js';
import { isSupabaseConfigured } from './lib/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : [CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Apply rate limiting to all /api routes
app.use('/api', apiRateLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'VoiceAssist AI Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: isGeminiConfigured(),
    supabaseConfigured: isSupabaseConfigured()
  });
});

// Mount Routes
app.use('/api/assist', assistRoutes);
app.use('/api/voice', voiceRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🎙️  VoiceAssist Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Gemini Status: ${isGeminiConfigured() ? '✅ Connected' : '⚠️ Offline/Fallback Mode'}`);
  console.log(`   Supabase Status: ${isSupabaseConfigured() ? '✅ Connected' : '⚠️ Local Storage Fallback'}`);
  console.log(`===============================================`);
});
