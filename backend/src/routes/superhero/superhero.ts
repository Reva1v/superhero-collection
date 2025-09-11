import { Router } from "express";
import type { Request, Response } from "express";
import { SuperheroService } from "../..//services/superheroService.ts";
import { z } from "zod";

const router = Router();
const superheroService = new SuperheroService();

const superheroSchema = z.object({
    nickname: z.string().min(1, "Nickname is required"),
    realName: z.string().min(1, "Real name is required"),
    originDescription: z.string().min(1, "Origin description is required"),
    superpowers: z.string().min(1, "Superpowers are required"),
    catchPhrase: z.string().min(1, "Catch phrase is required"),
    images: z.array(z.string().url()).optional().default([]),
});

// GET /api/superhero
router.get("/", async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const search = req.query.search as string;

        let result;
        if (search) {
            const heroes = await superheroService.search(search, page, limit);
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
router.post("/", async (req: Request, res: Response) => {
    try {
        const validationResult = superheroSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: validationResult.error.issues
            });
        }

        const { images, ...superheroData } = validationResult.data;
        const newSuperhero = await superheroService.create(superheroData, images);

        res.status(201).json(newSuperhero);
    } catch (error) {
        console.error("Error creating superhero:", error);
        res.status(500).json({ error: "Failed to create superhero" });
    }
});

// PUT /api/superhero/:id
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid superhero ID" });
        }

        const validationResult = superheroSchema.partial().safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: validationResult.error.issues
            });
        }

        const { images, ...superheroData } = validationResult.data;
        const updatedSuperhero = await superheroService.update(id, superheroData, images);

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

        res.json({ message: "Superhero deleted successfully", superhero: deletedSuperhero });
    } catch (error) {
        console.error("Error deleting superhero:", error);
        res.status(500).json({ error: "Failed to delete superhero" });
    }
});

export default router;
