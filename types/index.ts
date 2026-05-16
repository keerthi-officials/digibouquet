import { Dispatch, SetStateAction } from "react";

export interface Flower {
  id: number;
  name: string;
  meaning: string;
  birthMonth: string;
  size: "small" | "medium" | "large";
  color?: string;
}

export interface BouquetFlower {
  id: number;
  count: number;
}

export interface CanvasFlower {
  uid: string;
  flowerId: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  flipH: boolean;
  zIndex: number;
}

export interface BouquetLetter {
  sender: string;
  recipient: string;
  message: string;
}

export interface Bouquet {
  mode: string;
  flowers: BouquetFlower[];
  letter: BouquetLetter;
  timestamp: number;
  greenery: number;
  flowerOrder: number[];
  canvasFlowers: CanvasFlower[] | null;
  canvasBg: string | null;
}

export type SetBouquet = Dispatch<SetStateAction<Bouquet>>;
export interface BouquetProps {
  bouquet: Bouquet;
  setBouquet: SetBouquet;
}
export interface BouquetReadOnlyProps {
  bouquet: Bouquet;
}
