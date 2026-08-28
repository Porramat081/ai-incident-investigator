import express, { type Request, type Response } from "express";
import pool from "./db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PYTHON_AI_URL =
  process.env.PYTHON_AI_URL || "http://127.0.0.1:8000/api/embed";

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", service: "node-ingestion-api" });
});

app.post("/api/logs", async (req: Request, res: Response): Promise<void> => {
  const requestObj = req.body;

  // validation
  if (
    !requestObj.service_name ||
    !requestObj.log_level ||
    !requestObj.raw_message
  ) {
    res.status(400).json({
      error:
        "Missing required log parameters (service_name, log_level, raw_message)",
    });
    return;
  }

  try {
    let vectorEmbedding: number[] | null = null;

    try {
      const aiResponse = await fetch(PYTHON_AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: requestObj.raw_message }),
      });

      if (aiResponse.ok) {
        const aiData = (await aiResponse.json()) as { embedding: number[] };
        vectorEmbedding = aiData.embedding;
      }
    } catch (aiErr) {
      console.warn(
        "⚠️ AI Vector Engine unreachable, inserting raw log without vector mapping.",
      );
    }
    const queryText = `
    INSERT INTO production_logs (timestamp, service_name, log_level, raw_message, message_embedding,metadata)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`;

    const vectorValueString = vectorEmbedding
      ? `[${vectorEmbedding.join(",")}]`
      : null;

    const values = [
      requestObj.timestamp || new Date().toISOString(),
      requestObj.service_name,
      requestObj.log_level.toUpperCase(),
      requestObj.raw_message,
      vectorValueString,
      JSON.stringify(requestObj.metadata || {}),
    ];

    const result = await pool.query(queryText, values);

    res.status(201).json({
      success: true,
      logId: result.rows[0].id,
      vectorized: !!vectorEmbedding,
    });
  } catch (err) {
    console.error("❌ Pipeline failure:", err);
    res.status(500).json({ error: "Database transaction failure" });
  }
});

app.get("/api/mock-github/commits", (req: Request, res: Response) => {
  const service = req.query.service_name as string;
  const mockCommits = [
    {
      commit_id: "a1b2c3d",
      author: "senior_dev",
      message: "Refactored routing authentication checks.",
    },
    {
      commit_id: "f8e9d1c",
      author: "intern_user",
      message: "Optimized connection arrays.",
      service_affected: "PaymentService",
    },
    {
      commit_id: "x9y8z7w",
      author: "devops_lead",
      message: "Added strict memory limits to Docker definitions.",
    },
  ];
  if (service) {
    const filtered = mockCommits.filter((c) => c.service_affected === service);
    return res.json({ service, history: filtered });
  }
  res.json({ history: mockCommits });
});

app.post("/api/mock-terminal/exec", (req: Request, res: Response) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: "No system command provided." });
  }
  const cmdString = command.toLowerCase();

  if (cmdString.includes("free -m") || cmdString.includes("mem")) {
    return res.json({
      output:
        "Mem: Total: 16384MB | Used: 16100MB | Free: 284MB | Buffers/Cached: 1100MB. Warning: Swap allocation active.",
    });
  }

  if (cmdString.includes("df -h") || cmdString.includes("disk")) {
    return res.json({
      output:
        "/dev/sda1  Size: 100G | Used: 42G | Avail: 58G | Use%: 42% | Mounted on: /",
    });
  }

  res.json({
    output: `Command '${command}' executed successfully. Exit code: 0. Status: Idle.`,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Node Ingestion API running on port ${PORT}`);
});
