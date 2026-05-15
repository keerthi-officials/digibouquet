import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// DATABASE_URL comes from your Neon project dashboard
// Format: postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
