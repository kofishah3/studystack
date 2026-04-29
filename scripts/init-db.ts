import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"'))
          value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'"))
          value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    });
  }
}

loadEnv();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "studystack",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
});

async function main() {
  const schemaPath = path.join(process.cwd(), "database_schema.sql");

  if (!fs.existsSync(schemaPath)) {
    console.error("schema file not found at:", schemaPath);
    process.exit(1);
  }

  const schema = fs.readFileSync(schemaPath, "utf8");

  console.log(" connecting to PostgreSQL server");
  const client = await pool.connect();

  try {
    console.log(" running the schema migration");
    await client.query(schema);
    console.log(" database fully initialized!!");
  } catch (error) {
    console.error(" error initializing database:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
