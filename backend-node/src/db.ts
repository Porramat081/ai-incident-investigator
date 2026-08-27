import pg from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import dotenvExpand from "dotenv-expand";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const backendEnv = dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenvExpand.expand(backendEnv);

const databaseUrl = process.env.DATABASE_URL || "";

if (!databaseUrl) {
  throw new Error(
    "Database configuration is missing. Set DATABASE_URL or POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB.",
  );
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
});

pool.on("connect", () => {
  console.log("🐘 Database connection pool established successfully.");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
});

export default pool;
