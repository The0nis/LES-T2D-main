import express from 'express';
import albumController from '@/controllers/album';
import { upload } from '@/middleware/uploads';

const router = express.Router();

router.get('/list', albumController.getAlbumList);
router.post('/upload', upload.single('image'), albumController.uploadAlbum);

export default router;
