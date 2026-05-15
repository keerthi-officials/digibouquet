import {
  pgTable,
  text,
  integer,
  jsonb,
  bigint,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";

export const bouquets = pgTable("bouquets", {
  id: serial("id").primaryKey(),
  short_id: text("short_id").notNull().unique(),
  mode: text("mode").notNull(),
  flowers: jsonb("flowers").notNull(),
  letter: jsonb("letter").notNull(),
  greenery: integer("greenery").notNull().default(0),
  flowerOrder: jsonb("flower_order").notNull(),
  canvasFlowers: jsonb("canvas_flowers"),
  canvasBg: text("canvas_bg"),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type BouquetRow = typeof bouquets.$inferSelect;
export type NewBouquet = typeof bouquets.$inferInsert;
