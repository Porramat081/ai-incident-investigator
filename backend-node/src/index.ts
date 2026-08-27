import express, { type Request, type Response } from "express";
import pool from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

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
    const queryText = `
    INSERT INTO production_logs (timestamp, service_name, log_level, raw_message, metadata)
      VALUES ($1, $2, $3, $4, $5) RETURNING id;`;

    const values = [
      requestObj.timestamp || new Date().toISOString(),
      requestObj.service_name,
      requestObj.log_level.toUpperCase(),
      requestObj.raw_message,
      JSON.stringify(requestObj.metadata || {}),
    ];

    const result = await pool.query(queryText, values);

    res.status(201).json({
      success: true,
      logId: result.rows[0].id,
    });
  } catch (err) {
    console.error("❌ Database insertion error:", err);
    res.status(500).json({ error: "Internal database write failure" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Node Ingestion API running on port ${PORT}`);
});
