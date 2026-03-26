import express from 'express';
import { generateInterview, submitAnswer, finalizeInterview, getMyInterviews } from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateInterview);
router.post('/submit-answer', protect, submitAnswer);
router.post('/finalize/:interviewId', protect, finalizeInterview);
router.get('/my-interviews', protect, getMyInterviews);

export default router;
