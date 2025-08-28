import { users } from '@/models/user';
import { relations } from 'drizzle-orm';
import { musics } from '@/models/music';
import {
  boolean,
  integer,
  timestamp,
  varchar,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { createTable } from '@/db/utils';

export const albums = createTable('albums', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar().notNull(),
  cover: varchar().notNull(),
  public: boolean().default(false),
  artistId: integer()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp().notNull().defaultNow(),
});

export const albumRelations = relations(albums, ({ one, many }) => ({
  musicToAlbums: many(musicToAlbums),
  artist: one(users, {
    fields: [albums.artistId],
    references: [users.id],
  }),
}));

export const musicToAlbums = createTable(
  'music_to_albums',
  {
    musicId: integer('music_id')
      .notNull()
      .references(() => musics.id),
    albumId: integer('album_id')
      .notNull()
      .references(() => albums.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.musicId, t.albumId] }),
  })
);

export const musicToAlbumsRelations = relations(musicToAlbums, ({ one }) => ({
  music: one(musics, {
    fields: [musicToAlbums.musicId],
    references: [musics.id],
  }),
  album: one(albums, {
    fields: [musicToAlbums.albumId],
    references: [albums.id],
  }),
}));
