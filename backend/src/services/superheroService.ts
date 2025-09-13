import { db } from "../db/db";
import { superheroes, superheroImages, type Superhero, type NewSuperhero } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";

export class SuperheroService {
    async getAll(page: number = 1, limit: number = 5) {
        try {
            page = Math.max(1, page);
            limit = Math.max(1, Math.min(50, limit));

            const offset = (page - 1) * limit;

            const heroes = await db
                .select()
                .from(superheroes)
                .limit(limit)
                .offset(offset);

            const totalResult = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(superheroes);

            const total = Number(totalResult[0]?.count) || 0;
            const totalPages = Math.ceil(total / limit);

            const heroesWithImages = await Promise.all(
                heroes.map(async (hero) => {
                    const images = await db
                        .select()
                        .from(superheroImages)
                        .where(eq(superheroImages.superheroId, hero.id));

                    return {
                        ...hero,
                        images: images.map(img => img.imageUrl)
                    };
                })
            );

            return {
                superheroes: heroesWithImages,
                total,
                totalPages,
                currentPage: page,
                limit
            };
        } catch (error) {
            console.error('Error in SuperheroService.getAll:', error);
            throw error;
        }
    }

    async getById(id: number) {
        try {
            const hero = await db.query.superheroes.findFirst({
                where: eq(superheroes.id, id),
                with: {
                    images: true,
                },
            });

            if (!hero) {
                return null;
            }

            return {
                ...hero,
                images: hero.images.map(img => img.imageUrl),
            };
        } catch (error) {
            console.error("Error in getById:", error);
            throw new Error("Failed to fetch superhero");
        }
    }

    async create(superheroData: Omit<NewSuperhero, 'id' | 'createdAt' | 'updatedAt'>, images: string[] = []) {
        try {
            return await db.transaction(async (tx) => {
                const [newHero] = await tx
                    .insert(superheroes)
                    .values({
                        ...superheroData,
                    })
                    .returning();

                if (images.length > 0) {
                    await tx
                        .insert(superheroImages)
                        .values(
                            images.map(imageUrl => ({
                                superheroId: newHero.id,
                                imageUrl,
                                altText: `Image of ${newHero.nickname}`,
                            }))
                        );
                }

                return {
                    ...newHero,
                    images,
                };
            });
        } catch (error) {
            console.error("Error in create:", error);
            throw new Error("Failed to create superhero");
        }
    }

    async update(id: number, superheroData: Partial<Omit<NewSuperhero, 'id' | 'createdAt'>>, images?: string[]) {
        try {
            return await db.transaction(async (tx) => {
                const [updatedHero] = await tx
                    .update(superheroes)
                    .set({
                        ...superheroData,
                        updatedAt: new Date(),
                    })
                    .where(eq(superheroes.id, id))
                    .returning();

                if (!updatedHero) {
                    return null;
                }

                if (images !== undefined) {
                    await tx
                        .delete(superheroImages)
                        .where(eq(superheroImages.superheroId, id));

                    if (images.length > 0) {
                        await tx
                            .insert(superheroImages)
                            .values(
                                images.map(imageUrl => ({
                                    superheroId: id,
                                    imageUrl,
                                    altText: `Image of ${updatedHero.nickname}`,
                                }))
                            );
                    }
                }

                const currentImages = await tx
                    .select()
                    .from(superheroImages)
                    .where(eq(superheroImages.superheroId, id));

                return {
                    ...updatedHero,
                    images: currentImages.map(img => img.imageUrl),
                };
            });
        } catch (error) {
            console.error("Error in update:", error);
            throw new Error("Failed to update superhero");
        }
    }

    async delete(id: number) {
        try {
            const [deletedHero] = await db
                .delete(superheroes)
                .where(eq(superheroes.id, id))
                .returning();

            return deletedHero || null;
        } catch (error) {
            console.error("Error in delete:", error);
            throw new Error("Failed to delete superhero");
        }
    }

    async search(query: string, page: number = 1, limit: number = 5) {
        const offset = (page - 1) * limit;
        const searchPattern = `%${query}%`;

        try {
            const heroes = await db.query.superheroes.findMany({
                where: sql`${superheroes.nickname} ILIKE ${searchPattern} OR ${superheroes.realName} ILIKE ${searchPattern}`,
                limit,
                offset,
                orderBy: [desc(superheroes.createdAt)],
                with: {
                    images: true,
                },
            });

            return heroes.map(hero => ({
                ...hero,
                images: hero.images.map(img => img.imageUrl),
            }));
        } catch (error) {
            console.error("Error in search:", error);
            throw new Error("Failed to search superheroes");
        }
    }

    async addImage(superheroId: number, imageUrl: string, altText?: string) {
        try {
            const [newImage] = await db
                .insert(superheroImages)
                .values({
                    superheroId,
                    imageUrl,
                    altText: altText || `Image of superhero ${superheroId}`,
                })
                .returning();

            return newImage;
        } catch (error) {
            console.error("Error in addImage:", error);
            throw new Error("Failed to add image");
        }
    }

    async removeImage(imageId: number) {
        try {
            const [deletedImage] = await db
                .delete(superheroImages)
                .where(eq(superheroImages.id, imageId))
                .returning();

            return deletedImage || null;
        } catch (error) {
            console.error("Error in removeImage:", error);
            throw new Error("Failed to remove image");
        }
    }

    async removeImageByIndex(superheroId: number, imageIndex: number) {
        try {
            const images = await db
                .select()
                .from(superheroImages)
                .where(eq(superheroImages.superheroId, superheroId))
                .orderBy(superheroImages.id);

            if (imageIndex < 0 || imageIndex >= images.length) {
                throw new Error('Invalid image index');
            }

            const imageToDelete = images[imageIndex];
            const [deletedImage] = await db
                .delete(superheroImages)
                .where(eq(superheroImages.id, imageToDelete.id))
                .returning();

            return deletedImage;
        } catch (error) {
            console.error("Error in removeImageByIndex:", error);
            throw new Error("Failed to remove image by index");
        }
    }

    async clearAllImages(superheroId: number) {
        try {
            const deletedImages = await db
                .delete(superheroImages)
                .where(eq(superheroImages.superheroId, superheroId))
                .returning();

            return deletedImages;
        } catch (error) {
            console.error("Error in clearAllImages:", error);
            throw new Error("Failed to clear all images");
        }
    }

    async addMultipleImages(superheroId: number, imageUrls: string[], altText?: string) {
        try {
            if (imageUrls.length === 0) return [];

            const imageRecords = imageUrls.map(imageUrl => ({
                superheroId,
                imageUrl,
                altText: altText || `Image of superhero ${superheroId}`,
            }));

            const newImages = await db
                .insert(superheroImages)
                .values(imageRecords)
                .returning();

            return newImages;
        } catch (error) {
            console.error("Error in addMultipleImages:", error);
            throw new Error("Failed to add multiple images");
        }
    }


    async getStats() {
        try {
            const [heroCount, imageCount] = await Promise.all([
                db
                    .select({ count: sql<number>`count(*)` })
                    .from(superheroes)
                    .then(result => Number(result[0].count)),

                db
                    .select({ count: sql<number>`count(*)` })
                    .from(superheroImages)
                    .then(result => Number(result[0].count))
            ]);

            return {
                totalHeroes: heroCount,
                totalImages: imageCount,
                averageImagesPerHero: heroCount > 0 ? Math.round((imageCount / heroCount) * 100) / 100 : 0,
            };
        } catch (error) {
            console.error("Error in getStats:", error);
            throw new Error("Failed to fetch statistics");
        }
    }
}
