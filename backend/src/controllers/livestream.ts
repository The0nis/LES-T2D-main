// import { Server as HttpServer } from 'http';
// import { Socket, Server as SocketIOServer } from 'socket.io';
// import corsOptions from '@/config/cors';
import { db } from '@/db';
import { livestream } from '@/models/livestream';
import { sessions } from '@/models/session';
// import session from 'express-session';
import { and, asc, desc, eq, ilike, SQLWrapper } from 'drizzle-orm';
import { Request, Response } from 'express';
import z from 'zod';

// type sessionMiddleware = typeof session;

// const initializeSocketIO = (
//   server: HttpServer
//   // sessionMiddleware: sessionMiddleware
// ) => {
//   const io = new SocketIOServer(server, {
//     cors: corsOptions,
//   });

//   // Use the session middleware for socket.io
//   // io.engine.use(sessionMiddleware);

//   const livestreamNamespace = io.of('/api/livestream');

//   livestreamNamespace.on('connection', (socket: Socket) => {
//     console.log(socket.id + ' connected to the livestream namespace');

//     // console.log('Socket Request: ', socket.request);

//     socket.on('disconnect', () => {
//       console.log(socket.id + ' disconnected from the livestream namespace');
//     });

//     socket.on('start-livestream', async (title: string, userId: string) => {
//       if (!title) {
//         socket.emit(
//           'error-start-livestream',
//           'Missing required livestream title'
//         );
//         return;
//       }

//       if (!userId) {
//         socket.emit(
//           'error-start-livestream',
//           'Missing required user to start livestream'
//         );
//         return;
//       }

//       const live = await db
//         .insert(livestream)
//         .values({
//           userId: Number(userId),
//           title: title,
//           createdAt: new Date(),
//           createdBy: socket.id,
//         })
//         .returning();

//       if (!live.length) {
//         socket.emit('error-start-livestream', 'Could not start livestream');
//         return;
//       }

//       socket.join(live[0].id.toString());
//       socket.emit('success-start-livestream', live[0].id.toString());

//       console.log(`Livestream ${live[0].id} started by ${socket.id}`);
//     });

//     socket.on('end-livestream', async (livestreamId: string) => {
//       if (!livestreamId) {
//         socket.emit('error-end-livestream', 'Missing Livestream ID');
//         return;
//       }

//       const endedLivestream = await db
//         .delete(livestream)
//         .where(eq(livestream.id, Number(livestreamId)))
//         .returning();

//       if (!endedLivestream.length) {
//         socket.emit('error-end-livestream', 'Invalid Livestream ID');
//         return;
//       }

//       socket.to(livestreamId.toString()).emit('end-livestream');
//       socket.leave(livestreamId.toString());
//       socket.emit('success-end-livestream');

//       console.log(`User ended livestream ${livestreamId}`);
//     });

//     socket.on('join-livestream', async (livestreamId: string) => {
//       if (!livestreamId) {
//         socket.emit('error-join-livestream', 'Missing Livestream ID');
//         return;
//       }

//       const live = await db.query.livestream.findFirst({
//         where: eq(livestream.id, Number(livestreamId)),
//       });

//       if (!live) {
//         socket.emit('error-join-livestream', 'Livestream not found');
//         return;
//       }

//       socket.join(livestreamId.toString());
//       socket.emit('success-join-livestream', live.id, live.title);

//       console.log(`User ${socket.id} joined livestream ${livestreamId}`);
//     });

//     socket.on('leave-livestream', (livestreamId: string) => {
//       if (!livestreamId) {
//         socket.emit('error-leave-livestream', 'Missing Livestream ID');
//         return;
//       }

//       socket.leave(livestreamId.toString());
//       socket.emit('success-leave-livestream');

//       console.log(`User ${socket.id} left livestream ${livestreamId}`);
//     });

//     socket.on(
//       'audio-data-to-server',
//       (livestreamId: string, audioData: ArrayBuffer) => {
//         if (!audioData) {
//           socket.emit('error-audio-data', 'Missing audio data');
//           return;
//         }

//         if (!livestreamId) {
//           socket.emit('error-audio-data', 'Missing Livestream ID');
//           return;
//         }

//         socket.to(livestreamId.toString()).emit('audio-data', audioData);
//         socket.emit('success-audio-data');
//       }
//     );
//   });
// };

const filtersSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'channel']).optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
});

const getLivestreamsList = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    order = 'ASC',
  } = filtersSchema.parse(req.query);

  const offset = (Number(page) - 1) * Number(limit);

  const whereClauses: (SQLWrapper | undefined)[] = [
    ilike(livestream.channel, `%${search}%`),
  ];

  const livestreamList = await db.query.livestream.findMany({
    orderBy: [
      order === 'ASC' ? asc(livestream[sortBy]) : desc(livestream[sortBy]),
    ],
    limit: Number(limit),
    offset: offset,
    where: and(...whereClauses),
    with: {
      artist: {
        columns: {
          email: true,
          username: true,
          image: true,
        },
      },
    },
  });

  res.status(200).json({ livestreamList });
};

const createLivestream = async (req: Request, res: Response): Promise<void> => {
  const { channel } = req.body;

  if (!channel) {
    res.status(400).json({ message: 'Missing required channel' });
    return;
  }

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.session_id, req.sessionID),
    with: {
      user: {
        columns: {
          id: true,
        },
      },
    },
  });

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const live = await db
    .insert(livestream)
    .values({
      userId: session.user_id,
      channel,
    })
    .returning();

  if (!live.length) {
    res.status(500).json({ message: 'Internal server error' });
    return;
  }

  res.status(201).json({ livestream: live[0] });
};

const getLivestream = async (req: Request, res: Response): Promise<void> => {
  const { channel } = req.params;

  if (!channel) {
    res.status(400).json({ message: 'Missing required channel' });
    return;
  }

  const live = await db.query.livestream.findFirst({
    where: eq(livestream.channel, channel),
    with: {
      artist: {
        columns: {
          email: true,
          username: true,
          image: true,
        },
      },
    },
  });

  if (!live) {
    res.status(404).json({ message: 'Livestream not found' });
    return;
  }

  res.status(200).json({ livestream: live });
};

const deleteLivestream = async (req: Request, res: Response): Promise<void> => {
  const { channel } = req.params;

  if (!channel) {
    res.status(400).json({ message: 'Missing required channel' });
    return;
  }

  const deletedLivestream = await db
    .delete(livestream)
    .where(eq(livestream.channel, channel))
    .returning();

  if (!deletedLivestream.length) {
    res.status(404).json({ message: 'Livestream not found' });
    return;
  }

  res.status(200).json({ message: 'Livestream deleted' });
};

export default {
  getLivestreamsList,
  createLivestream,
  getLivestream,
  deleteLivestream,
};
