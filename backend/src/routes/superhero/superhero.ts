import {Router} from "express";
import type {Request, Response} from "express";
import {SuperheroService} from "../../services/superheroService.js";
import {z} from "zod";
import {upload, processAndSaveImage} from '../../middleware/upload.js';

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

// GET /api/superhero/:id/images
router.get("/:id/images", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({error: "Invalid superhero ID"});
        }

        const superhero = await superheroService.getById(id);

        if (!superhero) {
            return res.status(404).json({error: "Superhero not found"});
        }

        res.json({
            superheroId: id,
            images: superhero.images || [],
            count: superhero.images ? superhero.images.length : 0
        });
    } catch (error) {
        console.error("Error fetching superhero images:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({error: "Failed to fetch superhero images", details: errorMessage});
    }
});

// POST /api/superhero/:id/images
router.post("/:id/images", upload.array('images', 5), async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({error: "Invalid superhero ID"});
        }

        const {imageUrls} = req.body;
        const files = req.files as Express.Multer.File[];

        const existingSuperhero = await superheroService.getById(id);
        if (!existingSuperhero) {
            return res.status(404).json({error: "Superhero not found"});
        }

        const newImageUrls: string[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    const imagePath = await processAndSaveImage(file, id);
                    newImageUrls.push(imagePath);
                } catch (imageError) {
                    console.error("Error processing image:", imageError);
                }
            }
        }

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

                newImageUrls.push(...validUrls);
            } catch (urlError) {
                console.error("Error processing image URLs:", urlError);
            }
        }

        if (newImageUrls.length === 0) {
            return res.status(400).json({error: "No valid images provided"});
        }

        await superheroService.addMultipleImages(id, newImageUrls);

        const updatedSuperhero = await superheroService.getById(id);

        res.status(201).json({
            message: `Added ${newImageUrls.length} images to superhero`,
            superhero: updatedSuperhero,
            addedImages: newImageUrls
        });
    } catch (error) {
        console.error("Error adding images to superhero:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({error: "Failed to add images to superhero", details: errorMessage});
    }
});

// DELETE /api/superhero/:id/images/:imageIndex
router.delete("/:id/images/:imageIndex", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const imageIndex = parseInt(req.params.imageIndex);

        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid superhero ID" });
        }

        if (isNaN(imageIndex) || imageIndex < 0) {
            return res.status(400).json({ error: "Invalid image index" });
        }

        const existingSuperhero = await superheroService.getById(id);
        if (!existingSuperhero) {
            return res.status(404).json({ error: "Superhero not found" });
        }

        const currentImages = existingSuperhero.images || [];
        if (imageIndex >= currentImages.length) {
            return res.status(404).json({ error: "Image not found" });
        }

        const removedImageUrl = currentImages[imageIndex];

        const deletedImage = await superheroService.removeImageByIndex(id, imageIndex);

        const updatedSuperhero = await superheroService.getById(id);

        res.json({
            message: "Image deleted successfully",
            superhero: updatedSuperhero,
            removedImage: removedImageUrl,
            remainingImages: updatedSuperhero?.images?.length || 0,
            deletedImageId: deletedImage.id
        });
    } catch (error) {
        console.error("Error deleting superhero image:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ error: "Failed to delete image", details: errorMessage });
    }
});

// DELETE /api/superhero/:id/images
router.delete("/:id/images", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid superhero ID" });
        }

        const existingSuperhero = await superheroService.getById(id);
        if (!existingSuperhero) {
            return res.status(404).json({ error: "Superhero not found" });
        }

        const removedImagesCount = existingSuperhero.images ? existingSuperhero.images.length : 0;

        if (removedImagesCount === 0) {
            return res.json({
                message: "No images to delete",
                superhero: existingSuperhero,
                removedImagesCount: 0
            });
        }

        const deletedImages = await superheroService.clearAllImages(id);

        const updatedSuperhero = await superheroService.getById(id);

        res.json({
            message: `All ${removedImagesCount} images deleted successfully`,
            superhero: updatedSuperhero,
            removedImagesCount,
            deletedImageIds: deletedImages.map(img => img.id)
        });
    } catch (error) {
        console.error("Error deleting all superhero images:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ error: "Failed to delete all images", details: errorMessage });
    }
});

// GET /api/superhero
router.get("/", async (req: Request, res: Response) => {
    try {
        let page = parseInt(req.query.page as string);
        let limit = parseInt(req.query.limit as string);
        const search = req.query.search as string;

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 5;
        if (limit > 50) limit = 50;

        console.log(`API request: page=${page}, limit=${limit}, search=${search}`);

        let result;
        if (search && search.trim()) {
            const heroes = await superheroService.search(search.trim(), page, limit);
            result = {
                superheroes: heroes,
                total: heroes.length,
                totalPages: Math.ceil(heroes.length / limit),
                currentPage: page,
                limit
            };
        } else {
            result = await superheroService.getAll(page, limit);
        }

        if (!result.currentPage) {
            result.currentPage = page;
        }

        console.log('API response:', {
            superheroesCount: result.superheroes.length,
            total: result.total,
            currentPage: result.currentPage,
            totalPages: result.totalPages
        });

        res.json(result);
    } catch (error) {
        console.error("Error fetching superheroes:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({error: "Failed to fetch superheroes", details: errorMessage});
    }
});

// GET /api/superhero/:id
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({error: "Invalid superhero ID"});
        }

        const superhero = await superheroService.getById(id);

        if (!superhero) {
            return res.status(404).json({error: "Superhero not found"});
        }

        res.json(superhero);
    } catch (error) {
        console.error("Error fetching superhero:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({error: "Failed to fetch superhero", details: errorMessage});
    }
});

// POST /api/superhero
router.post("/", upload.array('images', 5), async (req: Request, res: Response) => {
    try {
        const {nickname, realName, originDescription, superpowers, catchPhrase, imageUrls} = req.body;
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
                    // Continue with other images but log the error
                }
            }
        }

        const allImages: string[] = [...uploadedImages];
        if (imageUrls) {
            try {
                let urls: string[] = [];
                if (typeof imageUrls === 'string') {
                    // If it's a string, try parsing as JSON or splitting by commas
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
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({error: "Failed to create superhero", details: errorMessage});
    }
});

// PUT /api/superhero/:id
router.put("/:id", upload.array('images', 5), async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({error: "Invalid superhero ID"});
        }

        const {
            nickname,
            realName,
            originDescription,
            superpowers,
            catchPhrase,
            imageUrls,
            keepExistingImages
        } = req.body;
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
            return res.status(404).json({error: "Superhero not found"});
        }

        res.json(updatedSuperhero);
    } catch (error) {
        console.error("Error updating superhero:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({error: "Failed to update superhero", details: errorMessage});
    }
});

// DELETE /api/superhero/:id
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({error: "Invalid superhero ID"});
        }

        const deletedSuperhero = await superheroService.delete(id);

        if (!deletedSuperhero) {
            return res.status(404).json({error: "Superhero not found"});
        }

        res.json({
            message: "Superhero deleted successfully",
            superhero: deletedSuperhero
        });
    } catch (error) {
        console.error("Error deleting superhero:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({error: "Failed to delete superhero", details: errorMessage});
    }
});

export default router;
