import express from 'express';
import authController from '@/controllers/auth';
const router = express.Router();

router.post('/signIn', authController.signIn);
router.post('/signUp', authController.signUp);
router.post('/signOut', authController.signOut);

router.get('/session', authController.getSession);

export default router;
