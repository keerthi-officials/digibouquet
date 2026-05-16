"use client";

import Image from "next/image";
import { flowers } from "@/data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBouquet } from "@/context/bouquet-context";
import { createFlowerCountMap } from "@/lib/utils";
import type { Flower } from "@/types";

const flowersData = flowers as Flower[];

export default function FlowerPicker() {
  const { bouquet, totalFlowers, addFlower, removeFlower } = useBouquet();
  const selectedFlowersMap = createFlowerCountMap(bouquet.flowers);

  return (
    <div className="h-full text-center">
      <h2 className="mb-2 upeprcase text-md">Pick atleast 2 blooms</h2>

      {totalFlowers > 0 && (
        <p className="mb-6 text-sm opacity-50">
          Click on a flower's name to deselect
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-4 mb-6 items-center min-h-50">
        {flowersData.map((flower) => (
          <Tooltip key={flower.id}>
            <TooltipTrigger asChild>
              <button
                className="flex relative flex-col items-center cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  addFlower(flower);
                }}
              >
                <div
                  className={`${
                    flower.size === "small"
                      ? "w-30 h-30"
                      : flower.size === "large"
                        ? "w-46 h-46"
                        : "w-38 h-38"
                  }
                        flex items-center justify-center transition-transform duration-300 overflow-hidden ${
                          selectedFlowersMap[flower.id]
                            ? "transofrm -translate-y-2"
                            : ""
                        } hover:transform hover:-translate-y-2`}
                >
                  <Image
                    src={
                      "/" + bouquet.mode + "/flowers/" + flower.name + ".png"
                    }
                    alt={flower.name}
                    width={
                      flower.size === "small"
                        ? 128
                        : flower.size === "large"
                          ? 192
                          : 160
                    }
                    height={
                      flower.size === "small"
                        ? 128
                        : flower.size === "large"
                          ? 192
                          : 160
                    }
                    className="object-cover"
                    priority
                  />
                </div>
                {selectedFlowersMap[flower.id] && (
                  <div className="flex absolute top-0 right-0 justify-center items-center w-5 h-5 rounded-xl text-xs">
                    {selectedFlowersMap[flower.id]}
                  </div>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={8}
              className="z-10 p-2 w-40 text-center"
            >
              <h3 className="font-bold uppercase text-md">{flower.name}</h3>
              <p className="text-sm">{flower.meaning}</p>
              <p className="text-sm">Birth Month: {flower.birthMonth}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(selectedFlowersMap).map(([id, count]) => {
            const flower = flowersData.find((f) => f.id === parseInt(id));
            if (!flower) return null;
            return (
              <div
                key={id}
                className="px-3 py-1 text-sm rounded-xl border"
                onClick={() => removeFlower(parseInt(id))}
              >
                {flower.name.toUpperCase()} x{count}
              </div>
            );
          })}
        </div>
    
    </div>
  );
}
