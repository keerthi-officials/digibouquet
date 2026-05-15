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
}

export type SetBouquet = Dispatch<SetStateAction<Bouquet>>;

export interface BouquetProps {
  bouquet: Bouquet;
  setBouquet: SetBouquet;
}

export interface BouquetReadOnlyProps {
  bouquet: Bouquet;
}
