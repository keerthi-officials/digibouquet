"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import type { Bouquet, SetBouquet, Flower, CanvasFlower } from "@/types";
import {
  generateDefaultFlowerOrder,
  calculateTotalFlowers,
  validateFlowerCount,
} from "@/lib/utils";

interface BouquetContextType {
  bouquet: Bouquet;
  setBouquet: SetBouquet;
  totalFlowers: number;
  canProceed: boolean;
  addFlower: (flower: Flower) => void;
  removeFlower: (flowerId: number) => void;
  setCanvasArrangement: (flowers: CanvasFlower[], bg: string) => void;
  canvasFlowers: CanvasFlower[];
  canvasBg: string;
}

const BouquetContext = createContext<BouquetContextType | undefined>(undefined);

interface BouquetProviderProps {
  children: ReactNode;
  mode: string;
}

export function BouquetProvider({ children, mode }: BouquetProviderProps) {
  const [bouquet, setBouquet] = useState<Bouquet>({
    mode,
    flowers: [],
    letter: { sender: "", recipient: "", message: "" },
    greenery: 0,
    timestamp: Date.now(),
    flowerOrder: [],
    canvasFlowers: null,
    canvasBg: null,
  });

  const totalFlowers = calculateTotalFlowers(bouquet.flowers);
  const canProceed = validateFlowerCount(bouquet.flowers);

  const addFlower = (flower: Flower) => {
    setBouquet((prev) => {
      const existing = prev.flowers.find((f) => f.id === flower.id);
      const newFlowers = existing
        ? prev.flowers.map((f) =>
            f.id === flower.id ? { ...f, count: f.count + 1 } : f,
          )
        : [...prev.flowers, { id: flower.id, count: 1 }];
      return {
        ...prev,
        flowers: newFlowers,
        flowerOrder: generateDefaultFlowerOrder(newFlowers),
        canvasFlowers: null,
      };
    });
  };

  const removeFlower = (flowerId: number) => {
    setBouquet((prev) => {
      const existing = prev.flowers.find((f) => f.id === flowerId);
      if (!existing) return prev;
      const newFlowers =
        existing.count <= 1
          ? prev.flowers.filter((f) => f.id !== flowerId)
          : prev.flowers.map((f) =>
              f.id === flowerId ? { ...f, count: f.count - 1 } : f,
            );
      return {
        ...prev,
        flowers: newFlowers,
        flowerOrder: generateDefaultFlowerOrder(newFlowers),
        canvasFlowers: null,
      };
    });
  };

  const setCanvasArrangement = useCallback(
    (flowers: CanvasFlower[], bg: string) => {
      setBouquet((prev) => ({
        ...prev,
        canvasFlowers: flowers,
        canvasBg: bg,
      }));
    },
    [],
  );

  return (
    <BouquetContext.Provider
      value={{
        bouquet,
        setBouquet,
        totalFlowers,
        canProceed,
        addFlower,
        removeFlower,
        setCanvasArrangement,
        canvasFlowers: bouquet.canvasFlowers ?? [],
        canvasBg: bouquet.canvasBg ?? "#f9f9ee",
      }}
    >
      {children}
    </BouquetContext.Provider>
  );
}

export function useBouquet(): BouquetContextType {
  const context = useContext(BouquetContext);
  if (!context)
    throw new Error("useBouquet must be used within a BouquetProvider");
  return context;
}

export { BouquetContext };
