import { users } from '@/models/user';
import { relations } from 'drizzle-orm';
import { boolean, integer, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createTable } from '@/db/utils';

export const notifications = createTable('notifications', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  message: varchar().notNull(), // Notification message
  read: boolean().default(false), // To track if the notification is read
  createdAt: timestamp().notNull().defaultNow(),
});

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
