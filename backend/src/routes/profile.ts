import express from 'express';
import profileController from '@/controllers/profile';
import { upload } from '@/middleware/uploads';
const ProfileRouter = express.Router();

ProfileRouter.post('/deleteAccount', profileController.deleteAccount);
ProfileRouter.get('/user/:id', profileController.getUserDetails);
ProfileRouter.put(
  '/editProfile',
  upload.single('image'),
  profileController.updateProfile
);

export default ProfileRouter;
