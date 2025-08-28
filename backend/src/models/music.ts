import { users } from '@/models/user';
import { relations } from 'drizzle-orm';
import {
  boolean,
  decimal,
  integer,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { musicToAlbums } from '@/models/albums';
import { createTable } from '@/db/utils';

export const musics = createTable('music', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar().notNull(),
  cover: varchar().notNull(),
  // albumId: integer().nullable(),
  path: varchar().notNull(),
  public: boolean().default(false),
  duration: decimal().notNull(),
  artistId: integer()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp().notNull().defaultNow(),
});

export const musicRelations = relations(musics, ({ one, many }) => ({
  artist: one(users, {
    fields: [musics.artistId],
    references: [users.id],
  }),

  musicToAlbums: many(musicToAlbums),
}));
