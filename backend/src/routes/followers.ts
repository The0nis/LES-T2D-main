import { followUser, unfollowUser } from '@/controllers/followers';
import express from 'express';

const followersRouter = express.Router();

followersRouter.post('/follow', followUser);
followersRouter.post('/unfollow', unfollowUser);

export default followersRouter;
