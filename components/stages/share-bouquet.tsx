"use client";

import { useBouquet } from "@/context/bouquet-context";
import { Bouquet as BouquetType } from "@/types";
import { timestamp } from "drizzle-orm/gel-core";
import { useRouter } from "next/navigation";
import Bouquet from "../bouquet";
import { Button } from "../ui/button";

export default function ShareBouquet() {
  const { bouquet } = useBouquet();
  const router = useRouter();

  const handleCreateBouquet = async (bouquet: BouquetType) => {
    const res = await fetch("/api/bouquets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: bouquet.mode,
        flowers: bouquet.flowers,
        letter: bouquet.letter,
        greenery: bouquet.greenery,
        flowerOrder: bouquet.flowerOrder,
        timestamp: bouquet.timestamp,
        canvasFlowers: bouquet.canvasFlowers ?? null,
        canvasBg: bouquet.canvasBg ?? null,
      }),
    });

    if (!res.ok) {
      console.error("Error creating bouquet");
      return;
    }

    const data = await res.json();
    router.push(`/bouquet/${data.id}`);
  };

  return (
    <div className="text-center">
      <h2 className="text-md uppercase text-center mb-4">SEND THE BOUQUET</h2>
      {bouquet.canvasFlowers && bouquet.canvasFlowers.length > 0 ? (
        <p className="text-xs text-stone-500 mb-8 uppercase tracking-widest">
          ✓ Your arrangement is saved — the recipient will see it exactly as you
          placed it
        </p>
      ) : (
        <p className="text-xs text-stone-400 mb-8 uppercase tracking-widest">
          No canvas arrangement — flowers will be shown in default layout
        </p>
      )}

      <Bouquet bouquet={bouquet} />

      <Button
        onClick={() => handleCreateBouquet(bouquet)}
        className="mt-8 uppercase px-5 py-3"
      >
        CREATE SHAREABLE LINK
      </Button>
    </div>
  );
}
