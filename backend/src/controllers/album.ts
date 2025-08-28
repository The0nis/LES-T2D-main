import { Request, Response } from 'express';
import { z } from 'zod';
import { and, asc, desc, eq, ilike, SQLWrapper } from 'drizzle-orm';
import { sessions, albums, musicToAlbums } from '@/db/schema';
import { db } from '@/db';

const filtersSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title']).optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
  private: z.enum(['true', 'false']).optional(),
  personal: z.enum(['true', 'false']).optional(),
});

const getAlbumList = async (req: Request, res: Response): Promise<void> => {
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
    ilike(albums.title, `%${search}%`),
  ];

  if (isPrivate === 'true') {
    whereClauses.push(eq(albums.public, false));
  } else {
    whereClauses.push(eq(albums.public, true));
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
    whereClauses.push(eq(albums.artistId, session.user.id));
  }

  const albumList = await db.query.albums.findMany({
    orderBy: [order === 'ASC' ? asc(albums[sortBy]) : desc(albums[sortBy])],
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

  res.status(200).json({ albumList });
};

const uploadAlbumBodySchema = z.object({
  name: z.string(),
  public: z.enum(['true', 'false']),
  tracks: z.string().min(1, { message: 'At least one track is required.' }),
});

const uploadAlbum = async (req: Request, res: Response): Promise<void> => {
  const params = uploadAlbumBodySchema.safeParse(req.body);

  if (params.error) {
    res.status(400).json({ message: params.error.errors });
    return;
  }

  const { name, public: isPublic, tracks } = params.data;

  const trackIds = tracks.split(',');

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

  const imageFile = req.file;

  if (!imageFile) {
    res.status(400).json({ message: 'Image file is required' });
    return;
  }

  await db.transaction(async (trx) => {
    const album = await trx
      .insert(albums)
      .values({
        title: name,
        public: isPublic === 'true',
        artistId: session.user.id,
        cover: imageFile.filename,
      })
      .returning();

    if (!album.length) {
      res.status(500).json({ message: 'Failed to upload album' });
      return;
    }

    for (const trackId of trackIds) {
      const musicToAlbum = await trx
        .insert(musicToAlbums)
        .values({
          musicId: Number(trackId),
          albumId: Number(album[0].id),
        })
        .returning();

      if (!musicToAlbum.length) {
        res.status(500).json({ message: 'Failed to attach songs to album' });
        return;
      }
    }

    res.status(200).json({ message: 'Album uploaded successfully' });
  });
};

export default {
  getAlbumList,
  uploadAlbum,
};
