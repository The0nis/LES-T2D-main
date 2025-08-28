import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { sessions, users, playlists } from '@/db/schema';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }

    const { email, password } = result.data;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      res.status(400).json({ message: 'Email not found.' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(400).json({ message: 'Password is incorrect.' });
      return;
    }

    // Delete any existing sessions for the user
    await db.delete(sessions).where(eq(sessions.user_id, user.id));

    // Create a session for the user
    await db.insert(sessions).values({
      user_id: user.id,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
      session_id: req.sessionID,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _unused, ...userWithoutPassword } = user;

    res.status(200).json({ message: 'Sign in', user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        new RegExp(/[A-Z]/),
        'Password must contain at least one uppercase letter'
      )
      .regex(
        new RegExp(/[a-z]/),
        'Password must contain at least one lowercase letter'
      )
      .regex(new RegExp(/[0-9]/), 'Password must contain at least one number')
      .regex(
        new RegExp(/[^a-zA-Z0-9]/),
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
    image: z.string(),
    gender: z.string(),
    username: z.string(),
    phone: z.string(),
    country: z.string(),
    state: z.string(),
    date_of_birth: z.string(),
    city: z.string(),
    street: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = signUpSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }

    const { email, password } = result.data;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (user) {
      res.status(400).json({ message: 'Email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      email: email,
      password: hashedPassword,
    });

    const newUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!newUser) {
      res.status(500).json({ message: 'User creation failed.' });
      return;
    }
    await db.insert(playlists).values({
      title: 'Liked Songs',
      userId: newUser.id,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _unused, ...userWithoutPassword } = newUser;

    res
      .status(201)
      .json({ message: 'User created', user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const signOut = async (req: Request, res: Response): Promise<void> => {
  await db.delete(sessions).where(eq(sessions.session_id, req.sessionID));
  res.status(200).json({ message: 'Sign out' });
};

const getSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.session_id, req.sessionID),
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            image: true,
            gender: true,
            username: true,
            phone: true,
            country: true,
            state: true,
            date_of_birth: true,
            city: true,
            street: true,
            completionPercentage: true,
            checklist: true,
          },
        },
      },
    });

    if (!session) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    res.status(200).json({ user: session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  signIn,
  signUp,
  signOut,
  getSession,
};
