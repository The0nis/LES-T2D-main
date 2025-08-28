import { db } from '@/db';
import { users } from '@/models/user';
import { musics } from '@/models/music';
import { sessions } from '@/models/session';

import bcrypt from 'bcryptjs';
import { playlists } from '@/models/playlist';

export const seed = async () => {
  const password = 'aA!123456789';

  const passwordHash = await bcrypt.hash(password, 10);

  const testUser: typeof users.$inferInsert = {
    email: 'test@email.com',
    password: passwordHash,
    username: 'test',
  };

  const insertedUser = await db.insert(users).values(testUser).returning();

  if (insertedUser.length === 0) {
    throw new Error('Failed to insert user');
  }

  const insertedSession = await db
    .insert(sessions)
    .values({
      user_id: insertedUser[0].id,
      session_id: 'test',
      data: 'test',
      expires_at: new Date(),
    })
    .returning();

  if (insertedSession.length === 0) {
    throw new Error('Failed to insert session');
  }

  const testMusic: typeof musics.$inferInsert = {
    title: 'Test Song',
    path: 'test.mp3',
    artistId: insertedUser[0].id,
    cover: 'test.jpg',
    duration: '100',
    public: true,
  };

  const insertedMusic = await db.insert(musics).values(testMusic).returning();

  if (insertedMusic.length === 0) {
    throw new Error('Failed to insert music');
  }

  const likedSongs = await db
    .insert(playlists)
    .values({
      title: 'Liked Songs',
      userId: insertedUser[0].id,
    })
    .returning();

  if (likedSongs.length === 0) {
    throw new Error('Failed to insert liked songs playlist');
  }
};

seed()
  .then(() => {
    console.log('Seed success');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
