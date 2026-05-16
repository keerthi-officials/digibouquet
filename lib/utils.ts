import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BouquetFlower } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateDefaultFlowerOrder(flowers: BouquetFlower[]): number[] {
  const total = flowers.reduce((sum, f) => sum + f.count, 0);
  return Array.from({ length: total }, (_, i) => i);
}

export function createFlowerCountMap(
  flowers: BouquetFlower[],
): Record<number, number> {
  const map: Record<number, number> = {};
  flowers.forEach((f) => {
    map[f.id] = f.count;
  });
  return map;
}

export function calculateTotalFlowers(flowers: BouquetFlower[]): number {
  return flowers.reduce((sum, f) => sum + f.count, 0);
}

export function validateFlowerCount(flowers: BouquetFlower[]): boolean {
  const total = calculateTotalFlowers(flowers);
  return total >= 6 && total <= 10;
}
