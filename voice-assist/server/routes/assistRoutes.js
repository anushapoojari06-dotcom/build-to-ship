import { Router } from 'express';
import {
  processVoice,
  extractForm,
  simplifyDoc,
  saveCompletedForm,
  getHistory
} from '../controllers/assistController.js';

const router = Router();

router.post('/process-voice', processVoice);
router.post('/extract-form', extractForm);
router.post('/simplify-doc', simplifyDoc);
router.post('/save-form', saveCompletedForm);
router.get('/history', getHistory);

export default router;
