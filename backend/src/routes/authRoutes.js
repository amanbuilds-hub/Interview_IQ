import express from 'express';
import { register, login, logout, refreshToken, getMe, updateMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.put('/update-me', protect, updateMe);

export default router;
