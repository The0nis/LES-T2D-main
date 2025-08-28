import express, { Express } from 'express';
import env from '../env';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import cors from 'cors';
import corsOptions from '@/config/cors';
import authRoutes from '@/routes/auth';
import isAuthenticated from '@/middleware/auth';
import profileRouter from '@/routes/profile';
import musicRoutes from '@/routes/music';
import livestreamRoutes from '@/routes/livestream';

import playlistRoutes from '@/routes/playlist';
import albumRouter from '@/routes/album';

import FileStore from 'session-file-store';
import followersRouter from './routes/followers';
import notificationsRouter from './routes/notifications';
const fileStoreOptions = {};

const app: Express = express();
const port = env.BACKEND_API_PORT ?? 3001;

app.use(cors(corsOptions));
app.options('*', cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

const sessionMiddleware = session({
  secret: env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: new (FileStore(session))(fileStoreOptions),
});

app.use(sessionMiddleware);

app.use('/api/auth', authRoutes);

// Static images folder
app.use('/api/uploads/image', express.static('src/uploads/image'));

// Everything below this line will require authentication
app.use(isAuthenticated);

app.use('/api/auth', profileRouter);
app.use('/api/music', musicRoutes);
app.use('/api/livestream', livestreamRoutes);
app.use('/api/user', followersRouter);
app.use('/api/nofitication', notificationsRouter);
app.use('/api/album', albumRouter);

app.use('/api/playlist', playlistRoutes);

const server = app.listen(port, async () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export { app, server };
