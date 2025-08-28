import { users } from '@/models/user';
import { relations } from 'drizzle-orm';
import { integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createTable } from '@/db/utils';

export const livestream = createTable('livestream', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  channel: varchar().notNull().unique(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const livestreamRelations = relations(livestream, ({ one }) => ({
  artist: one(users, {
    fields: [livestream.userId],
    references: [users.id],
  }),
}));
