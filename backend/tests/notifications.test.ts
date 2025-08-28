import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { db } from '@/db'; // Adjust the import based on your project structure
import { users, sessions, notifications, followers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import notificationsRouter from '@/routes/notifications'; // Adjust the import based on your project structure

interface MockRequest extends Request {
  sessionID: string;
}

const mockAuthMiddleware = (
  req: MockRequest,
  res: Response,
  next: NextFunction
) => {
  req.sessionID = '1234'; // Mock authenticated session ID
  next();
};

const app = express();
app.use(express.json());
app.use(mockAuthMiddleware); // Use the mock authentication middleware
app.use('/api/notification', notificationsRouter);

describe('Notifications API', () => {
  let notificationId: number;
  let user1Id: number;
  let user2Id: number;
  beforeEach(async () => {
    // Setup: Insert test users and session into the database
    const userList = await db
      .insert(users)
      .values([
        {
          email: 'test@example.com',
          password: 'testpassword',
          username: 'Test User',
        },
        {
          email: 'artist@example.com',
          password: 'artistpassword',
          username: 'Artist User',
        },
      ])
      .returning();

    if (!userList.length) {
      throw new Error('Failed to create test users');
    }

    const session = await db
      .insert(sessions)
      .values([
        {
          user_id: userList[0].id,
          session_id: '1234',
          created_at: new Date(),
          data: 'ioioioiq',
          expires_at: new Date(new Date().getTime() + 1000 * 60 * 60 * 24), // 1 day from now
        },
        {
          user_id: userList[1].id,
          session_id: '5678',
          created_at: new Date(),
          data: 'ioioioiq',
          expires_at: new Date(new Date().getTime() + 1000 * 60 * 60 * 24), // 1 day from now
        },
      ])
      .returning();

    if (!session.length) {
      throw new Error('Failed to create test sessions');
    }

    const [notification] = await db
      .insert(notifications)
      .values({
        userId: userList[0].id,
        message: 'Test notification',
        createdAt: new Date(),
        read: false,
      })
      .returning();

    if (!notification) {
      throw new Error('Failed to create test notification');
    }

    user1Id = userList[0].id;
    user2Id = userList[1].id;
    notificationId = notification.id;

    await db.insert(followers).values({
      followerId: userList[0].id,
      followedId: userList[1].id,
    });
  });

  afterEach(async () => {
    // Cleanup: Remove the test data from the database
    await db.delete(sessions).where(eq(sessions.user_id, user1Id));
    await db.delete(sessions).where(eq(sessions.user_id, user2Id));
    await db.delete(users).where(eq(users.id, user1Id));
    await db.delete(users).where(eq(users.id, user2Id));
    await db.delete(notifications).where(eq(notifications.userId, user1Id));
    await db.delete(followers).where(eq(followers.followerId, user1Id));
  });

  it('should get notifications for the user', async () => {
    const response = await request(app)
      .get('/api/notification')
      .set('Cookie', 'sessionID=1234');

    expect(response.status).toBe(200);
    expect(response.body.notifications).toHaveLength(1);
    expect(response.body.notifications[0].message).toBe('Test notification');
  });

  it('should mark a notification as read', async () => {
    const response = await request(app)
      .put('/api/notification/readNotification')
      .set('Cookie', 'sessionID=1234')
      .send({ id: notificationId });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'Notification marked as read successfully'
    );
    expect(response.body.notification.read).toBe(true);
  });

  it('should delete a notification', async () => {
    const response = await request(app)
      .post('/api/notification/deleteNotification')
      .set('Cookie', 'sessionID=1234')
      .send({ id: notificationId });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Notification deleted successfully');
  });
});
