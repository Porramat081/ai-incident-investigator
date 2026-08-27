import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const backendEnv = dotenv.config({ path: path.resolve(__dirname, "./.env") });
dotenvExpand.expand(backendEnv);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", service: "node-ingestion-api" });
});

app.listen(PORT, () => {
  console.log(`🚀 Node Ingestion API running on port ${PORT}`);
});
