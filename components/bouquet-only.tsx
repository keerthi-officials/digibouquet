import Image from "next/image";
import { flowers } from "@/data";
import type { BouquetReadOnlyProps } from "@/types";

export default function BouquetOnly({ bouquet }: BouquetReadOnlyProps) {
  const getFlowerDimensions = (size: string) => {
    switch (size) {
      case "small":
        return 80;
      case "large":
        return 160;
      default:
        return 120;
    }
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center relative py-4 my-4">
        <div className="relative w-125 min-h-102.5">
          <Image
            src={`/${bouquet.mode}/bush/bush-${bouquet.greenery + 1}.png`}
            alt="bush background"
            width={600}
            height={500}
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
            priority
          />

          <div className="flex flex-wrap reverse w-75 justify-center items-center -space-x-4 -space-y-20 relative m-auto">
            {bouquet.flowers.flatMap(
              (flower: { id: number; count: number }, flowerIndex: number) => {
                const flowerData = flowers.find((f) => f.id === flower.id);
                if (!flowerData) return [];
                return Array(flower.count)
                  .fill(null)
                  .map((_, instanceIndex) => {
                    const rotation = Math.random() * 10 - 5;
                    const index = bouquet.flowerOrder?.length
                      ? (bouquet.flowerOrder[
                          flowerIndex * flower.count + instanceIndex
                        ] ?? flowerIndex * flower.count + instanceIndex)
                      : flowerIndex * flower.count + instanceIndex;
                    const dimensions = getFlowerDimensions(flowerData.size);
                    return (
                      <div
                        key={`${flowerIndex}-${instanceIndex}`}
                        className="flex items-center justify-center pt-4 relative"
                        style={{ order: index }}
                      >
                        <Image
                          src={`/${bouquet.mode}/flowers/${flowerData.name}.png`}
                          alt={flowerData.name}
                          width={dimensions}
                          height={dimensions}
                          className="relative z-10 transition-transform hover:scale-105"
                          style={{ transform: `rotate(${rotation}deg)` }}
                          priority
                        />
                      </div>
                    );
                  });
              },
            )}
          </div>
          <div>
            <Image
              src={`/${bouquet.mode}/bush/bush-${bouquet.greenery + 1}-top.png`}
              alt="bush top"
              width={600}
              height={500}
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
