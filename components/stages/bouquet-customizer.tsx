"use client";

import Image from "next/image";
import { flowers } from "@/data";
import { useBouquet } from "@/context/bouquet-context";

export default function BouquetCustomizer() {
  const { bouquet, setBouquet } = useBouquet();

  const randomizeFlowers = () => {
    const total = bouquet.flowers.reduce((sum, f) => sum + f.count, 0);
    const indices = Array.from({ length: total }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setBouquet((prev) => ({ ...prev, flowerOrder: indices }));
  };

  const changeGreenery = () => {
    setBouquet((prev) => ({ ...prev, greenery: (prev.greenery + 1) % 3 }));
  };

  return (
    <div className="flex flex-col mx-auto max-w-5xl">
      <div className="p-6">
        <h2 className="mb-6 text-center uppercase text-md">
          Customize Your Bouquet
        </h2>
        <div className="flex flex-col justify-center items-center space-y-4">
          <button
            onClick={randomizeFlowers}
            className="px-5 py-3 text-white uppercase bg-black"
          >
            Try a new Arrangement
          </button>
          <button
            onClick={changeGreenery}
            className="px-5 py-3 text-black uppercase border border-black"
          >
            Change Greenery
          </button>
        </div>
      </div>

      <div className="flex relative justify-center items-center py-4 my-16">
        <div className="relative w-125 min-h-102.5">
          <Image
            src={`/${bouquet.mode}/bush/bush-${bouquet.greenery + 1}.png`}
            alt="bush background"
            width={600}
            height={500}
            className="absolute top-1/2 left-1/2 z-0 transform -translate-x-1/2 -translate-y-1/2"
            priority
          />
          <div className="flex flex-wrap reverse w-75 justify-center items-center -space-x-4 -space-y-20 relative m-auto">
            {bouquet.flowers.flatMap((flower, flowerIndex) => {
              const flowerData = flowers.find((f) => f.id === flower.id);
              if (!flowerData) return [];
              return Array(flower.count)
                .fill(null)
                .map((_, instanceIndex) => {
                  const rotation = Math.random() * 10 - 5;
                  const index =
                    bouquet.flowerOrder.length > 0
                      ? (bouquet.flowerOrder[
                          flowerIndex * flower.count + instanceIndex
                        ] ?? flowerIndex * flower.count + instanceIndex)
                      : flowerIndex * flower.count + instanceIndex;
                  const dim =
                    flowerData.size === "small"
                      ? 80
                      : flowerData.size === "large"
                        ? 160
                        : 120;
                  return (
                    <div
                      key={`${flowerIndex}-${instanceIndex}`}
                      className="flex relative justify-center items-center pt-4"
                      style={{ order: index }}
                    >
                      <Image
                        src={`/${bouquet.mode}/flowers/${flowerData.name}.png`}
                        alt={flowerData.name}
                        width={dim}
                        height={dim}
                        className="relative z-10 transition-transform hover:scale-105"
                        style={{ transform: `rotate(${rotation}deg)` }}
                        priority
                      />
                    </div>
                  );
                });
            })}
          </div>
          <Image
            src={`/${bouquet.mode}/bush/bush-${bouquet.greenery + 1}-top.png`}
            alt="bush top"
            width={600}
            height={500}
            className="absolute top-1/2 left-1/2 z-10 transform -translate-x-1/2 -translate-y-1/2"
            priority
          />
        </div>
      </div>
    </div>
  );
}
