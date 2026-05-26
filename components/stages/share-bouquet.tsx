"use client";

import { useBouquet } from "@/context/bouquet-context";
import { Bouquet as BouquetType } from "@/types";
import { useRouter } from "next/navigation";
import Bouquet from "../bouquet";
import { useEffect, useRef } from "react";

export default function ShareBouquet() {
  const { bouquet } = useBouquet();
  const router = useRouter();
  const bouquetRef = useRef(bouquet);

  useEffect(() => {
    bouquetRef.current = bouquet;
  }, [bouquet]);

  const handleCreateBouquet = async (bouquet: BouquetType) => {
    const latest = bouquetRef.current;
    const res = await fetch("/api/bouquets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: latest.mode,
        flowers: latest.flowers,
        letter: latest.letter,
        greenery: latest.greenery,
        flowerOrder: latest.flowerOrder,
        timestamp: latest.timestamp,
        canvasFlowers: latest.canvasFlowers ?? null,
        canvasBg: latest.canvasBg ?? null,
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

      <button
        onClick={() => handleCreateBouquet(bouquet)}
        className="mt-8 uppercase text-white bg-black px-5 py-3"
      >
        CREATE SHAREABLE LINK
      </button>
    </div>
  );
}
