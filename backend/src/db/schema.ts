import {pgTable, serial, varchar, text, timestamp, integer} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Таблица супергероев
export const superheroes = pgTable('superheroes', {
    id: serial('id').primaryKey(),
    nickname: varchar('nickname', { length: 100 }).notNull(),
    realName: varchar('real_name', { length: 100 }).notNull(),
    originDescription: text('origin_description').notNull(),
    superpowers: text('superpowers').notNull(), // JSON строка или разделенный запятыми список
    catchPhrase: text('catch_phrase').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица изображений супергероев
export const superheroImages = pgTable('superhero_images', {
    id: serial('id').primaryKey(),
    superheroId: integer('superhero_id').references(() => superheroes.id, {
        onDelete: 'cascade'
    }).notNull(),
    imageUrl: varchar('image_url', { length: 500 }).notNull(),
    altText: varchar('alt_text', { length: 200 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Определение связей
export const superheroesRelations = relations(superheroes, ({ many }) => ({
    images: many(superheroImages),
}));

export const superheroImagesRelations = relations(superheroImages, ({ one }) => ({
    superhero: one(superheroes, {
        fields: [superheroImages.superheroId],
        references: [superheroes.id],
    }),
}));

// Типы TypeScript (инferred от схемы)
export type Superhero = typeof superheroes.$inferSelect;
export type NewSuperhero = typeof superheroes.$inferInsert;
export type SuperheroImage = typeof superheroImages.$inferSelect;
export type NewSuperheroImage = typeof superheroImages.$inferInsert;

// Пример использования
/*
// Создание нового супергероя
const newSuperhero: NewSuperhero = {
  nickname: "Superman",
  realName: "Clark Kent",
  originDescription: "he was born Kal-El on the planet Krypton, before being rocketed to Earth as an infant by his scientist father Jor-El, moments before Krypton's destruction…",
  superpowers: "solar energy absorption and healing factor, solar flare and heat vision, solar invulverability, flight",
  catchPhrase: "Look, up in the sky, it's a bird, it's a plane, it's Superman!"
};

// Запросы с изображениями
const superheroWithImages = await db
  .select()
  .from(superheroes)
  .leftJoin(superheroImages, eq(superheroes.id, superheroImages.superheroId))
  .where(eq(superheroes.id, 1));

// Или используя relations
const superheroWithImages = await db.query.superheroes.findFirst({
  where: eq(superheroes.id, 1),
  with: {
    images: true,
  },
});
*/
