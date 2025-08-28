import express from 'express';
import playlistController from '@/controllers/playlist';

const router = express.Router();

router.get('/list', playlistController.getList);
router.post('/upload', playlistController.uploadPlaylist);
router.delete('/delete/:id', playlistController.deletePlaylist);
router.get('/:id/musics', playlistController.listMusicsFromPlaylist);
router.delete(
  '/:playlistId/musics/:musicId',
  playlistController.deleteMusicFromPlaylist
);
router.post(
  '/:playlistId/musics/:musicId',
  playlistController.addMusicToPlaylist
);
router.post('/bookmark/:musicId', playlistController.bookmarkMusic);

export default router;
