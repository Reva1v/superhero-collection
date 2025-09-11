import express, { Request, Response } from "express";
import cors from "cors";
import superheroRouter from "./routes/superhero/superhero.ts";

const app = express();
const port = 4000;

app.use(cors());

app.use(express.json({ limit: '10mb' }));

app.use("/api/superhero", superheroRouter);

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Superhero API is running!",
        version: "1.0.0",
        endpoints: {
            superheroes: "/api/superhero",
            health: "/"
        }
    });
});

app.listen(port, () => {
    console.log(`🚀 Backend running on http://localhost:${port}`);
    console.log(`📚 API endpoints: http://localhost:${port}/api/superhero`);
});
