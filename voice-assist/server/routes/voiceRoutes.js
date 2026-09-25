import { Router } from 'express';
import multer from 'multer';
import { transcribeAudio } from '../controllers/voiceController.js';

const router = Router();

// Configure multer memory storage with strict validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'audio/webm',
      'audio/wav',
      'audio/x-wav',
      'audio/wave',
      'audio/ogg',
      'audio/mp3',
      'audio/mpeg',
      'audio/m4a',
      'audio/mp4',
      'audio/aac'
    ];
    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only audio files (audio/webm, wav, mp3, ogg) are allowed.'), false);
    }
  }
});

router.post('/transcribe', upload.single('audio'), transcribeAudio);

export default router;
