import { users } from '@/models/user';
import { relations } from 'drizzle-orm';
import { integer, timestamp } from 'drizzle-orm/pg-core';
import { createTable } from '@/db/utils';

export const followers = createTable('followers', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  followerId: integer()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  followedId: integer()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp().notNull().defaultNow(),
});

export const followerRelations = relations(followers, ({ one }) => ({
  follower: one(users, {
    fields: [followers.followerId],
    references: [users.id],
  }),
  followed: one(users, {
    fields: [followers.followedId],
    references: [users.id],
  }),
}));
