import { Request, Response } from 'express';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { playlists, sessions, musicsPlaylists } from '@/db/schema';
import { db } from '@/db';

const getList = async (req: Request, res: Response): Promise<void> => {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.session_id, req.sessionID),
  });

  if (!session) {
    res.status(304).json({ message: 'Unauthorized' });
    return;
  }

  const playlistList = await db.query.playlists.findMany({
    where: eq(playlists.userId, session.user_id),
    with: {
      user: {
        columns: {
          id: true,
          username: true,
        },
      },
    },
  });

  res.status(200).json({ playlistList });
};

const getPlaylistInfo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ message: 'Playlist Id is required' });
    return;
  }

  const playlist = await db.query.playlists.findFirst({
    where: eq(playlists.id, Number(id)),
    with: {
      user: {
        columns: {
          email: true,
          username: true,
          image: true,
        },
      },
    },
  });

  if (!playlist) {
    res.status(404).json({ message: 'Playlist not found' });
    return;
  }

  res.status(200).json({ playlist });
};

const uploadPlaylistBodySchema = z.object({
  title: z.string(),
});

const uploadPlaylist = async (req: Request, res: Response): Promise<void> => {
  const params = uploadPlaylistBodySchema.safeParse(req.body);

  if (params.error) {
    res.status(400).json({ message: params.error.errors });
    return;
  }

  const { title } = params.data;

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

  await db
    .insert(playlists)
    .values({
      title: title,
      userId: session.user.id,
    })
    .returning();

  res.status(200).json({ message: 'Playlist uploaded successfully' });
};

const deletePlaylist = async (req: Request, res: Response): Promise<void> => {
  await db.delete(playlists).where(eq(playlists.id, Number(req.params.id)));
  res.status(200).json({ message: 'Playlist deleted' });
};

const listMusicsFromPlaylist = async (
  req: Request,
  res: Response
): Promise<void> => {
  const musics = await db.query.musicsPlaylists.findMany({
    where: eq(musicsPlaylists.playlistId, Number(req.params.id)),
    with: {
      music: {
        with: {
          artist: true,
        },
      },
    },
  });
  res.status(200).json({ musics });
};

const deleteMusicFromPlaylist = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { playlistId, musicId } = req.params;
  if (!playlistId || !musicId) {
    res.status(400).json({ message: 'Playlist ID and Music ID are required' });
    return;
  }
  try {
    await db
      .delete(musicsPlaylists)
      .where(
        and(
          eq(musicsPlaylists.musicId, Number(musicId)),
          eq(musicsPlaylists.playlistId, Number(playlistId))
        )
      );
    res.status(200).json({ message: 'Music deleted from playlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An error occurred while deleting music from playlist',
    });
  }
};

const addMusicToPlaylist = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { playlistId, musicId } = req.params;
  if (!playlistId || !musicId) {
    res.status(400).json({ message: 'Playlist ID and Music ID are required' });
    return;
  }
  try {
    await db
      .insert(musicsPlaylists)
      .values({
        musicId: Number(musicId),
        playlistId: Number(playlistId),
      })
      .returning();
    res.status(200).json({ message: 'Music added to playlist' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while adding music to playlist' });
  }
};

const bookmarkMusic = async (req: Request, res: Response): Promise<void> => {
  const { musicId } = req.params;
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
  const playlist = await db.query.playlists.findFirst({
    where: and(
      eq(playlists.title, 'Liked Songs'),
      eq(playlists.userId, session.user.id)
    ),
  });
  if (!playlist || !playlist.id || !musicId) {
    res.status(400).json({ message: 'Playlist ID and Music ID are required' });
    return;
  }

  try {
    await db
      .insert(musicsPlaylists)
      .values({
        musicId: Number(musicId),
        playlistId: Number(playlist.id),
      })
      .returning();
    res.status(200).json({ message: 'Music bookmarked' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'This music is already in your playlist!' });
  }
};

export default {
  uploadPlaylist,
  getPlaylistInfo,
  getList,
  deletePlaylist,
  listMusicsFromPlaylist,
  deleteMusicFromPlaylist,
  addMusicToPlaylist,
  bookmarkMusic,
};
