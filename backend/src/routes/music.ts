import express from 'express';
import musicController from '@/controllers/music';
import { upload } from '@/middleware/uploads';

const router = express.Router();

router.get('/stream/:id', musicController.streamMusic);
router.get('/info/:id', musicController.getMusicInfo);
router.get('/list', musicController.getMusicList);
router.post(
  '/upload',
  upload.fields([
    { name: 'music', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  musicController.uploadMusic
);
router.get('/next', musicController.getNextIds);

export default router;
