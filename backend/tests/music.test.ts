import request from 'supertest';
import { server } from '@/index';
import { db } from '@/db';
import { musics } from '@/models/music';
import { eq } from 'drizzle-orm';
import { users } from '@/models/user';
import { sessions } from '@/models/session';
import express, { Request, Response, NextFunction } from 'express';
import router from '@/routes/music';

interface MockRequest extends Request {
  sessionID: string;
}

const mockAuthMiddleware = (
  req: MockRequest,
  res: Response,
  next: NextFunction
) => {
  req.sessionID = '1234';
  next();
};

const app = express();
app.use(express.json());
app.use(mockAuthMiddleware);
app.use('/', router);

describe('Music API', () => {
  let musicId: number;

  beforeAll(async () => {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.session_id, 'test'),
    });

    if (!session) {
      throw new Error('Session not found');
    }

    db.query.sessions.findFirst = jest.fn().mockResolvedValue({
      ...session,
      user: {
        id: session.user_id,
        username: 'test',
        email: 'test@email.com',
      },
    });

    const user = await db.query.users.findFirst({
      where: eq(users.email, 'test@email.com'),
    });

    if (!user) {
      throw new Error('User not found');
    }

    const music = await db
      .insert(musics)
      .values({
        title: 'Test Music',
        cover: 'test.jpg',
        path: 'test.mp3',
        public: true,
        duration: '180',
        artistId: user.id,
      })
      .returning();
    musicId = music[0].id;
  });

  afterAll(async () => {
    await db.delete(musics).where(eq(musics.id, musicId));
    server.close();
  });

  it('should get music info', async () => {
    const res = await request(app).get(`/info/${musicId}`);
    expect(res.status).toBe(200);
    expect(res.body.music).toHaveProperty('title', 'Test Music');
  });

  it('should stream music', async () => {
    const res = await request(app)
      .get(`/stream/${musicId}`)
      .set('Range', 'bytes=0-1000');

    expect(res.status).toBe(206);
  });

  it('should get music list', async () => {
    const res = await request(app).get('/list');
    expect(res.status).toBe(200);
    expect(res.body.musicList).toBeInstanceOf(Array);
  });

  // it('should upload music', async () => {
  //     const res = await request(app)
  //         .post('/upload')
  //         .field('name', 'New Music')
  //         .field('public', 'true')
  //         .field('duration', '200')
  //         .attach('music', '../src/uploads/music/test.mp3')
  //         .attach('image', '../src/uploads/music/test.jpg');
  //     expect(res.status).toBe(200);
  // });

  it('should get next IDs', async () => {
    const res = await request(app).get('/next');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nextMusicIds');
  });
});
