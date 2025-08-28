import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { and, asc, desc, eq, ilike, SQLWrapper } from 'drizzle-orm';
import { musics, sessions } from '@/db/schema';
import { db } from '@/db';
import { notifyAllFollowers } from '@/controllers/notifications';

const getMusicInfo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ message: 'Music Id is required' });
    return;
  }

  const music = await db.query.musics.findFirst({
    where: eq(musics.id, Number(id)),
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

  if (!music) {
    res.status(404).json({ message: 'Music not found' });
    return;
  }
  res.status(200).json({ music });
};

const streamSchema = z.object({
  id: z.string(),
});

const streamMusic = async (req: Request, res: Response): Promise<void> => {
  const params = streamSchema.safeParse(req.params);

  if (params.error) {
    res.status(400).json({ message: 'Invalid music Id' });
    return;
  }

  const { id } = params.data;

  if (!id) {
    res.status(400).json({ message: 'Music Id is required' });
    return;
  }

  const music = await db.query.musics.findFirst({
    where: eq(musics.id, Number(id)),
  });

  if (!music) {
    res.status(404).json({ message: 'Music not found' });
    return;
  }

  // Stream music here
  const filePath = path.join(__dirname, `../uploads/music/${music.path}`);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: 'Music file not found' });
    return;
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
    };

    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
};

const filtersSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title']).optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
  private: z.enum(['true', 'false']).optional(),
  personal: z.enum(['true', 'false']).optional(),
});

const getMusicList = async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    order = 'ASC',
    private: isPrivate = 'false',
    personal: isPersonal = 'false',
  } = filtersSchema.parse(req.query);

  const offset = (Number(page) - 1) * Number(limit);

  const whereClauses: (SQLWrapper | undefined)[] = [
    ilike(musics.title, `%${search}%`),
  ];

  if (isPrivate === 'true') {
    whereClauses.push(eq(musics.public, false));
  } else {
    whereClauses.push(eq(musics.public, true));
  }

  if (isPersonal === 'true') {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.session_id, req.sessionID),
      with: {
        user: true,
      },
    });

    if (!session) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // whereClause.artistId = user.id;
    whereClauses.push(eq(musics.artistId, session.user.id));
  }

  const musicList = await db.query.musics.findMany({
    orderBy: [order === 'ASC' ? asc(musics[sortBy]) : desc(musics[sortBy])],
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

  res.status(200).json({ musicList });
};

const uploadMusicBodySchema = z.object({
  name: z.string(),
  public: z.enum(['true', 'false']),
  duration: z.string(),
});

const uploadMusic = async (req: Request, res: Response): Promise<void> => {
  const params = uploadMusicBodySchema.safeParse(req.body);

  if (params.error) {
    res.status(400).json({ message: params.error.errors });
    return;
  }

  const { name, public: isPublic, duration } = params.data;

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.session_id, req.sessionID),
    with: {
      user: true,
    },
  });

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (!session.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files.music || !files.image) {
    res.status(400).json({ message: 'Music and image files are required' });
    return;
  }

  const musicFile = files.music[0];

  const imageFile = files.image[0];

  // const music = await Music.create({
  //   title: name,
  //   public: isPublic === 'true',
  //   artistId: user.id,
  //   cover: imageFile.filename,
  //   path: musicFile.filename,
  //   duration: duration,
  // });

  const music = await db
    .insert(musics)
    .values({
      title: name,
      public: isPublic === 'true',
      artistId: session.user.id,
      cover: imageFile.filename,
      path: musicFile.filename,
      duration: duration,
    })
    .returning();

  if (!music.length) {
    res.status(500).json({ message: 'Failed to upload music' });
    return;
  }
  // Notify followers
  await notifyAllFollowers(session.user.id, name);
  res.status(200).json({ message: 'Music uploaded successfully' });
};

const getNextIds = async (req: Request, res: Response): Promise<void> => {
  const nextMusicIds = await db.query.musics.findMany({
    where: eq(musics.public, true),
    columns: {
      id: true,
    },
    limit: 5,
  });

  res.status(200).json({ nextMusicIds: nextMusicIds.map((music) => music.id) });
};

export default {
  getMusicInfo,
  streamMusic,
  getMusicList,
  uploadMusic,
  getNextIds,
};
