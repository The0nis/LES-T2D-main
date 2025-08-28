import { musics } from '@/db/schema';
import { relations } from 'drizzle-orm';
import { date, integer, json, serial, varchar } from 'drizzle-orm/pg-core';
import { createTable } from '@/db/utils';

export const users = createTable('user', {
  id: serial().primaryKey(),
  email: varchar().notNull(),
  password: varchar().notNull(),
  image: varchar().notNull().default('/api/uploads/image/profile.jpg'),
  gender: varchar().default(''),
  username: varchar().default(''),
  phone: varchar().default(''),
  country: varchar().default(''),
  state: varchar().default(''),
  date_of_birth: date().defaultNow(),
  city: varchar().default(''),
  street: varchar().default(''),
  completionPercentage: integer().default(0),
  checklist: json().default({
    setupAccount: false,
    personalInformation: false,
    uploadPhoto: false,
    contactInformation: false,
    workInformation: false,
  }),
});

export const userRelations = relations(users, ({ many }) => ({
  musics: many(musics),
}));

export const updateChecklist = (user: typeof users.$inferSelect): void => {
  user.checklist = {
    setupAccount: !!user.email && !!user.password,
    personalInformation:
      !!user.username &&
      !!user.phone &&
      !!user.country &&
      !!user.state &&
      !!user.city &&
      !!user.street,
    uploadPhoto: !!user.image,
    contactInformation:
      !!user.phone && !!user.country && !!user.state && !!user.city,
    workInformation: !!user.username,
  };
};

export const calculateCompletionPercentage = (
  user: typeof users.$inferSelect
): number => {
  const fields = [
    user.email,
    user.password,
    user.username,
    user.image,
    user.phone,
    user.country,
    user.state,
    user.city,
    user.street,
    user.date_of_birth,
    user.image,
  ];

  let fieldsFilled = 0;

  for (const field of fields) {
    if (field) {
      fieldsFilled++;
    }
  }

  const totalFields = fields.length;
  const percentage = (fieldsFilled / totalFields) * 100;

  return Math.round(percentage);
};
