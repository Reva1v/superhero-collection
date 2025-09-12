import { Router } from "express";
import type { Request, Response } from "express";
import { SuperheroService } from "../../services/superheroService.js";
import { z } from "zod";
import { upload, processAndSaveImage } from '../../middleware/upload.js';

const router = Router();
const superheroService = new SuperheroService();

const superheroSchema = z.object({
    nickname: z.string().min(1, "Nickname is required"),
    realName: z.string().min(1, "Real name is required"),
    originDescription: z.string().min(1, "Origin description is required"),
    superpowers: z.string().min(1, "Superpowers are required"),
    catchPhrase: z.string().min(1, "Catch phrase is required"),
});

const superheroUpdateSchema = superheroSchema.partial();

// GET /api/superhero
router.get("/", async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const search = req.query.search as string;

        let result;
        if (search && search.trim()) {
            const heroes = await superheroService.search(search.trim(), page, limit);
            result = {
                superheroes: heroes,
                total: heroes.length,
                page,
                limit,
                totalPages: Math.ceil(heroes.length / limit),
            };
        } else {
            result = await superheroService.getAll(page, limit);
        }

        res.json(result);
    } catch (error) {
        console.error("Error fetching superheroes:", error);
        res.status(500).json({ error: "Failed to fetch superheroes" });
    }
});

// GET /api/superhero/:id
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid superhero ID" });
        }

        const superhero = await superheroService.getById(id);

        if (!superhero) {
            return res.status(404).json({ error: "Superhero not found" });
        }

        res.json(superhero);
    } catch (error) {
        console.error("Error fetching superhero:", error);
        res.status(500).json({ error: "Failed to fetch superhero" });
    }
});

// POST /api/superhero
router.post("/", upload.array('images', 5), async (req: Request, res: Response) => {
    try {
        const { nickname, realName, originDescription, superpowers, catchPhrase, imageUrls } = req.body;
        const files = req.files as Express.Multer.File[];

        const validationResult = superheroSchema.safeParse({
            nickname,
            realName,
            originDescription,
            superpowers,
            catchPhrase
        });

        if (!validationResult.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: validationResult.error.issues
            });
        }

        const superheroData = validationResult.data;

        const newSuperhero = await superheroService.create(superheroData, []);

        const uploadedImages: string[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    const imagePath = await processAndSaveImage(file, newSuperhero.id);
                    uploadedImages.push(imagePath);
                } catch (imageError) {
                    console.error("Error processing image:", imageError);
                    // Продолжаем с другими изображениями, но логируем ошибку
                }
            }
        }

        const allImages: string[] = [...uploadedImages];
        if (imageUrls) {
            try {
                let urls: string[] = [];
                if (typeof imageUrls === 'string') {
                    // Если это строка, пробуем парсить как JSON или разделить по запятым
                    if (imageUrls.startsWith('[')) {
                        urls = JSON.parse(imageUrls);
                    } else if (imageUrls.includes(',')) {
                        urls = imageUrls.split(',').map(url => url.trim()).filter(url => url);
                    } else if (imageUrls.trim()) {
                        urls = [imageUrls.trim()];
                    }
                } else if (Array.isArray(imageUrls)) {
                    urls = imageUrls.filter(url => typeof url === 'string' && url.trim());
                }

                const validUrls = urls.filter(url => {
                    try {
                        new URL(url);
                        return true;
                    } catch {
                        return false;
                    }
                });

                allImages.push(...validUrls);
            } catch (urlError) {
                console.error("Error processing image URLs:", urlError);
            }
        }

        let finalSuperhero = newSuperhero;
        if (allImages.length > 0) {
            const updatedSuperhero = await superheroService.update(newSuperhero.id, {}, allImages);
            if (updatedSuperhero) {
                finalSuperhero = updatedSuperhero;
            }
        }

        res.status(201).json(finalSuperhero);
    } catch (error) {
        console.error("Error creating superhero:", error);
        res.status(500).json({ error: "Failed to create superhero" });
    }
});

// PUT /api/superhero/:id
router.put("/:id", upload.array('images', 5), async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid superhero ID" });
        }

        const { nickname, realName, originDescription, superpowers, catchPhrase, imageUrls, keepExistingImages } = req.body;
        const files = req.files as Express.Multer.File[];

        const fieldsToUpdate: any = {};
        if (nickname !== undefined) fieldsToUpdate.nickname = nickname;
        if (realName !== undefined) fieldsToUpdate.realName = realName;
        if (originDescription !== undefined) fieldsToUpdate.originDescription = originDescription;
        if (superpowers !== undefined) fieldsToUpdate.superpowers = superpowers;
        if (catchPhrase !== undefined) fieldsToUpdate.catchPhrase = catchPhrase;

        if (Object.keys(fieldsToUpdate).length > 0) {
            const validationResult = superheroUpdateSchema.safeParse(fieldsToUpdate);

            if (!validationResult.success) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: validationResult.error.issues
                });
            }
        }

        let currentImages: string[] = [];
        if (keepExistingImages === 'true' || keepExistingImages === true) {
            const currentSuperhero = await superheroService.getById(id);
            if (currentSuperhero) {
                currentImages = currentSuperhero.images || [];
            }
        }

        const uploadedImages: string[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    const imagePath = await processAndSaveImage(file, id);
                    uploadedImages.push(imagePath);
                } catch (imageError) {
                    console.error("Error processing image:", imageError);
                }
            }
        }

        const urlImages: string[] = [];
        if (imageUrls) {
            try {
                let urls: string[] = [];
                if (typeof imageUrls === 'string') {
                    if (imageUrls.startsWith('[')) {
                        urls = JSON.parse(imageUrls);
                    } else if (imageUrls.includes(',')) {
                        urls = imageUrls.split(',').map(url => url.trim()).filter(url => url);
                    } else if (imageUrls.trim()) {
                        urls = [imageUrls.trim()];
                    }
                } else if (Array.isArray(imageUrls)) {
                    urls = imageUrls.filter(url => typeof url === 'string' && url.trim());
                }

                const validUrls = urls.filter(url => {
                    try {
                        new URL(url);
                        return true;
                    } catch {
                        return false;
                    }
                });

                urlImages.push(...validUrls);
            } catch (urlError) {
                console.error("Error processing image URLs:", urlError);
            }
        }

        const allImages = [...currentImages, ...uploadedImages, ...urlImages];

        const updatedSuperhero = await superheroService.update(id, fieldsToUpdate, allImages);

        if (!updatedSuperhero) {
            return res.status(404).json({ error: "Superhero not found" });
        }

        res.json(updatedSuperhero);
    } catch (error) {
        console.error("Error updating superhero:", error);
        res.status(500).json({ error: "Failed to update superhero" });
    }
});

// DELETE /api/superhero/:id
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid superhero ID" });
        }

        const deletedSuperhero = await superheroService.delete(id);

        if (!deletedSuperhero) {
            return res.status(404).json({ error: "Superhero not found" });
        }

        res.json({
            message: "Superhero deleted successfully",
            superhero: deletedSuperhero
        });
    } catch (error) {
        console.error("Error deleting superhero:", error);
        res.status(500).json({ error: "Failed to delete superhero" });
    }
});

// GET /api/superhero/:id/images
router.get("/:id/images", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid superhero ID" });
        }

        const superhero = await superheroService.getById(id);

        if (!superhero) {
            return res.status(404).json({ error: "Superhero not found" });
        }

        res.json({
            superheroId: id,
            images: superhero.images || [],
            count: superhero.images ? superhero.images.length : 0
        });
    } catch (error) {
        console.error("Error fetching superhero images:", error);
        res.status(500).json({ error: "Failed to fetch superhero images" });
    }
});

// POST /api/superhero/:id/images
router.post("/:id/images", upload.array('images', 5), async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid superhero ID" });
        }

        const { imageUrls } = req.body;
        const files = req.files as Express.Multer.File[];

        const existingSuperhero = await superheroService.getById(id);
        if (!existingSuperhero) {
            return res.status(404).json({ error: "Superhero not found" });
        }

        const uploadedImages: string[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    const imagePath = await processAndSaveImage(file, id);
                    uploadedImages.push(imagePath);
                } catch (imageError) {
                    console.error("Error processing image:", imageError);
                }
            }
        }

        const urlImages: string[] = [];
        if (imageUrls) {
            try {
                let urls: string[] = [];
                if (typeof imageUrls === 'string') {
                    if (imageUrls.startsWith('[')) {
                        urls = JSON.parse(imageUrls);
                    } else if (imageUrls.includes(',')) {
                        urls = imageUrls.split(',').map(url => url.trim()).filter(url => url);
                    } else if (imageUrls.trim()) {
                        urls = [imageUrls.trim()];
                    }
                } else if (Array.isArray(imageUrls)) {
                    urls = imageUrls.filter(url => typeof url === 'string' && url.trim());
                }

                const validUrls = urls.filter(url => {
                    try {
                        new URL(url);
                        return true;
                    } catch {
                        return false;
                    }
                });

                urlImages.push(...validUrls);
            } catch (urlError) {
                console.error("Error processing image URLs:", urlError);
            }
        }

        const newImages = [...uploadedImages, ...urlImages];

        if (newImages.length === 0) {
            return res.status(400).json({ error: "No valid images provided" });
        }

        const currentImages = existingSuperhero.images || [];
        const allImages = [...currentImages, ...newImages];

        const updatedSuperhero = await superheroService.update(id, {}, allImages);

        if (!updatedSuperhero) {
            return res.status(500).json({ error: "Failed to update superhero with new images" });
        }

        res.status(201).json({
            message: `Added ${newImages.length} images to superhero`,
            superhero: updatedSuperhero,
            addedImages: newImages
        });
    } catch (error) {
        console.error("Error adding images to superhero:", error);
        res.status(500).json({ error: "Failed to add images to superhero" });
    }
});

export default router;
