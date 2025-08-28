import request from 'supertest';
import express from 'express';
import profileRouter from '@/routes/profile';
import { db } from '@/db';
import { sessions } from '@/models/session';
import { eq } from 'drizzle-orm';
import { users } from '@/models/user';

const app = express();
app.use(express.json());
app.use('/profile', profileRouter);

describe('Profile Controller', () => {
  let sessionId: string;
  let session: typeof sessions.$inferSelect;

  beforeAll(async () => {
    const testUser: typeof users.$inferInsert = {
      email: 'test1@email.com',
      password: 'aaaaa',
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
        session_id: 'test1',
        data: 'test',
        expires_at: new Date(),
      })
      .returning();

    if (insertedSession.length === 0) {
      throw new Error('Failed to insert session');
    }

    const query = await db.query.sessions.findFirst({
      where: eq(sessions.session_id, 'test1'),
    });

    if (!query) {
      throw new Error('Session not found');
    }

    session = query;
    sessionId = query.session_id;
  });

  it('should return user details', async () => {
    const response = await request(app)
      .get(`/profile/user/${session.user_id}`)
      .set('Cookie', [`sessionId=${sessionId}`]);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('test1@email.com');
    expect(response.body.username).toBe('test');
  });

  it('should update profile successfully', async () => {
    // Mock db.query.sessions.findFirst
    db.query.sessions.findFirst = jest.fn().mockResolvedValue({
      ...session,
      user: {
        id: session.user_id,
        username: 'test',
        email: 'test1@email.com',
      },
    });

    const response = await request(app)
      .put('/profile/editProfile')
      .set('Cookie', [`sessionId=${sessionId}`])
      .send({
        username: 'updatedTest',
        phone: '1234567890',
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User details updated successfully');
    expect(response.body.user.username).toBe('updatedTest');
    expect(response.body.user.phone).toBe('1234567890');
  });

  it('should return 404 for non-existent user', async () => {
    const response = await request(app)
      .get('/profile/user/999')
      .set('Cookie', [`sessionId=${sessionId}`]);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should return 401 for unauthorized access', async () => {
    db.query.sessions.findFirst = jest.fn().mockResolvedValue(null);

    const response = await request(app).put('/profile/editProfile').send({
      username: 'unauthorizedTest',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should delete account successfully', async () => {
    const response = await request(app)
      .post('/profile/deleteAccount')
      .send({ email: 'test1@email.com' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Account deleted successfully');
  });
});
