import request from 'supertest';
import { app, server } from '@/index';
import { db } from '@/db';
import bcrypt from 'bcryptjs';
import { users } from '@/models/user';
import { eq } from 'drizzle-orm';
import { sessions } from '@/models/session';

describe('POST /api/auth/signIn', () => {
  beforeAll(async () => {
    // Setup: Create a user in the database
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    await db.insert(users).values({
      email: 'test@example.com',
      password: hashedPassword,
    });
  });

  afterAll(async () => {
    server.close();
    // Cleanup: Remove the user from the database
    await db.delete(users).where(eq(users.email, 'test@example.com'));
  });

  it('should return 200 and user data on successful sign in', async () => {
    const response = await request(app)
      .post('/api/auth/signIn')
      .send({ email: 'test@example.com', password: 'Password123!' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Sign in');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).not.toHaveProperty('password');
  });

  it('should return 400 if email is not found', async () => {
    const response = await request(app)
      .post('/api/auth/signIn')
      .send({ email: 'nonexistent@example.com', password: 'Password123!' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Email not found.');
  });

  it('should return 400 if password is incorrect', async () => {
    const response = await request(app)
      .post('/api/auth/signIn')
      .send({ email: 'test@example.com', password: 'WrongPassword!' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Password is incorrect.');
  });

  it('should return 400 if request body is invalid', async () => {
    const response = await request(app)
      .post('/api/auth/signIn')
      .send({ email: 'invalid-email', password: 'short' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  it('should return 500 on internal server error', async () => {
    // Simulate an internal server error by mocking the database query
    jest.spyOn(db.query.users, 'findFirst').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .post('/api/auth/signIn')
      .send({ email: 'test@example.com', password: 'Password123!' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
  });
});

describe('POST /api/auth/signUp', () => {
  afterEach(async () => {
    // Cleanup: Remove the user from the database
    await db.delete(users).where(eq(users.email, 'newuser@example.com'));
  });

  it('should return 201 and user data on successful sign up', async () => {
    const response = await request(app).post('/api/auth/signUp').send({
      email: 'newuser@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      image: 'image_url',
      gender: 'male',
      username: 'newuser',
      phone: '1234567890',
      country: 'Country',
      state: 'State',
      date_of_birth: '2000-01-01',
      city: 'City',
      street: 'Street',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User created');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).not.toHaveProperty('password');
  });

  it('should return 400 if email already exists', async () => {
    // Setup: Create a user in the database
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    await db.insert(users).values({
      email: 'existinguser@example.com',
      password: hashedPassword,
    });

    const response = await request(app).post('/api/auth/signUp').send({
      email: 'existinguser@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      image: 'image_url',
      gender: 'male',
      username: 'existinguser',
      phone: '1234567890',
      country: 'Country',
      state: 'State',
      date_of_birth: '2000-01-01',
      city: 'City',
      street: 'Street',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Email already exists.');

    // Cleanup: Remove the user from the database
    await db.delete(users).where(eq(users.email, 'existinguser@example.com'));
  });

  it('should return 400 if passwords do not match', async () => {
    const response = await request(app).post('/api/auth/signUp').send({
      email: 'newuser@example.com',
      password: 'Password123!',
      confirmPassword: 'Password1234!',
      image: 'image_url',
      gender: 'male',
      username: 'newuser',
      phone: '1234567890',
      country: 'Country',
      state: 'State',
      date_of_birth: '2000-01-01',
      city: 'City',
      street: 'Street',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message.issues[0].message).toContain(
      'Passwords do not match'
    );
  });

  it('should return 400 if request body is invalid', async () => {
    const response = await request(app).post('/api/auth/signUp').send({
      email: 'invalid-email',
      password: 'short',
      confirmPassword: 'short',
      image: 'image_url',
      gender: 'male',
      username: 'newuser',
      phone: '1234567890',
      country: 'Country',
      state: 'State',
      date_of_birth: '2000-01-01',
      city: 'City',
      street: 'Street',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  it('should return 500 on internal server error', async () => {
    // Simulate an internal server error by mocking the database query
    jest.spyOn(db.query.users, 'findFirst').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app).post('/api/auth/signUp').send({
      email: 'newuser@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      image: 'image_url',
      gender: 'male',
      username: 'newuser',
      phone: '1234567890',
      country: 'Country',
      state: 'State',
      date_of_birth: '2000-01-01',
      city: 'City',
      street: 'Street',
    });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
  });
});

describe('GET /api/auth/session', () => {
  let sessionId: string;

  beforeAll(async () => {
    // Setup: Create a user and a session in the database
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    await db.insert(users).values({
      email: 'sessionuser@example.com',
      password: hashedPassword,
    });

    const user = await db.query.users.findFirst({
      where: eq(users.email, 'sessionuser@example.com'),
    });

    if (user) {
      sessionId = 'test-session-id';
      await db.insert(sessions).values({
        user_id: user.id,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
        session_id: sessionId,
      });
    }
  });

  afterAll(async () => {
    server.close();
    // Cleanup: Remove the user and session from the database
    await db.delete(sessions).where(eq(sessions.session_id, sessionId));
    await db.delete(users).where(eq(users.email, 'sessionuser@example.com'));
  });

  it('should return 200 and user data if session exists', async () => {
    db.query.sessions.findFirst = jest.fn().mockResolvedValueOnce({
      user_id: 1,
      session_id: sessionId,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      user: {
        id: 1,
        email: 'sessionuser@example.com',
      },
    });

    const response = await request(app).get('/api/auth/session');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty(
      'email',
      'sessionuser@example.com'
    );
    expect(response.body.user).not.toHaveProperty('password');
  });

  it('should redirect to /login if session does not exist', async () => {
    const response = await request(app).get('/api/auth/session');

    expect(response.status).toBe(401);
  });

  it('should return 500 on internal server error', async () => {
    // Simulate an internal server error by mocking the database query
    jest.spyOn(db.query.sessions, 'findFirst').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .get('/api/auth/session')
      .set('Cookie', [`session_id=${sessionId}`]);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
  });
});
