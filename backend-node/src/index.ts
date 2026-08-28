import express, { type Request, type Response } from "express";
import pool from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || "http://127.0.0";

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

app.listen(PORT, () => {
  console.log(`🚀 Node Ingestion API running on port ${PORT}`);
});
