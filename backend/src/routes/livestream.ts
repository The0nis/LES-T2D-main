import express from 'express';
import livestreamController from '@/controllers/livestream';

const router = express.Router();

router.get('/', livestreamController.getLivestreamsList);
router.post('/', livestreamController.createLivestream);
router.get('/:channel', livestreamController.getLivestream);
router.delete('/:channel', livestreamController.deleteLivestream);

export default router;
