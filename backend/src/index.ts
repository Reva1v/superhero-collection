import express, { Request, Response } from "express";
import usersRouter from "./routes/superhero/superhero";

const app = express();
const port = 4000;

app.use(express.json());
app.use("/api/users", usersRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello from Express + TS backend!");
});

app.listen(port, () => {
    console.log(`🚀 Backend running on http://localhost:${port}`);
});
