import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    res.json([{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]);
});

export default router;
