import { Request, Response } from 'express';
import { db } from '@/db';
import { followers, users } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const followSchema = z.object({
  followerId: z.number(),
  followedId: z.number(),
});

export const followUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const params = followSchema.safeParse(req.body);

  if (params.error) {
    res.status(400).json({ message: params.error.errors });
    return;
  }

  const { followerId, followedId } = params.data;

  if (followerId === followedId) {
    res.status(400).json({ message: 'Users cannot follow themselves' });
    return;
  }

  const [follower, followed] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, followerId) }),
    db.query.users.findFirst({ where: eq(users.id, followedId) }),
  ]);

  if (!follower || !followed) {
    res.status(404).json({ message: 'User(s) not found' });
    return;
  }

  const existingFollow = await db.query.followers.findFirst({
    where: and(
      eq(followers.followerId, followerId),
      eq(followers.followedId, followedId)
    ),
  });

  if (existingFollow) {
    res.status(409).json({ message: 'Already following this user' });
    return;
  }

  await db.insert(followers).values({ followerId, followedId });

  res.status(201).json({ message: 'Successfully followed the user' });
};

export const unfollowUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const params = followSchema.safeParse(req.body);

  if (params.error) {
    res.status(400).json({ message: params.error.errors });
    return;
  }

  const { followerId, followedId } = params.data;

  if (followerId === followedId) {
    res.status(400).json({ message: 'Users cannot unfollow themselves' });
    return;
  }

  const existingFollow = await db.query.followers.findFirst({
    where: and(
      eq(followers.followerId, followerId),
      eq(followers.followedId, followedId)
    ),
  });

  if (!existingFollow) {
    res.status(404).json({ message: 'Follow relationship not found' });
    return;
  }

  await db
    .delete(followers)
    .where(
      and(
        eq(followers.followerId, followerId),
        eq(followers.followedId, followedId)
      )
    );

  res.status(200).json({ message: 'Successfully unfollowed the user' });
};
