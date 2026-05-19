import { db } from "@/db";
import { bouquets } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import type { Bouquet as BouquetType, CanvasFlower } from "@/types";

export async function getAllBouquets(): Promise<
  { id: string | number; bouquet: BouquetType; createdAt: Date }[]
> {
  const rows = await db
    .select()
    .from(bouquets)
    .orderBy(desc(bouquets.created_at));

  return rows.map((row) => ({
    id: row.id,
    bouquet: {
      mode: row.mode,
      flowers: row.flowers as BouquetType["flowers"],
      letter: row.letter as BouquetType["letter"],
      greenery: row.greenery,
      flowerOrder: row.flowerOrder as number[],
      timestamp: row.timestamp,
      canvasFlowers: (row.canvasFlowers as CanvasFlower[]) ?? null,
      canvasBg: row.canvasBg ?? null,
    },
    createdAt: new Date(row.created_at),
  }));
}

export async function getBouquetById(
  id: number,
): Promise<{ id: number; bouquet: BouquetType; createdAt: Date } | null> {
  const row = await db.query.bouquets.findFirst({
    where: eq(bouquets.id, id),
  });

  if (!row) return null;

  return {
    id: row.id,
    bouquet: {
      mode: row.mode,
      flowers: row.flowers as BouquetType["flowers"],
      letter: row.letter as BouquetType["letter"],
      greenery: row.greenery,
      flowerOrder: row.flowerOrder as number[],
      timestamp: row.timestamp,
      canvasFlowers: (row.canvasFlowers as CanvasFlower[]) ?? null,
      canvasBg: row.canvasBg ?? null,
    },
    createdAt: new Date(row.created_at),
  };
}
