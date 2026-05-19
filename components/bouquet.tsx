import Image from "next/image";
import { flowers } from "@/data";
import type { BouquetReadOnlyProps, CanvasFlower } from "@/types";

const CANVAS_W = 560;
const CANVAS_H = 600;

export default function Bouquet({ bouquet }: BouquetReadOnlyProps) {
  const hasCanvas = bouquet.canvasFlowers && bouquet.canvasFlowers.length > 0;

  return (
    <div className="text-center">
      {hasCanvas ? (
        <CanvasRenderer bouquet={bouquet} />
      ) : (
        <DefaultRenderer bouquet={bouquet} />
      )}

      <LetterCard bouquet={bouquet} />
    </div>
  );
}

function CanvasRenderer({ bouquet }: BouquetReadOnlyProps) {
  const canvasFlowers = bouquet.canvasFlowers as CanvasFlower[];
  const bg = bouquet.canvasBg ?? "#fdf6e3";

  return (
    <div className="flex justify-center mb-4">
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          maxWidth: CANVAS_W,
          aspectRatio: `${CANVAS_W}/ ${CANVAS_H}`,
          background: bg,
        }}
      >
        <div
          className="z-5 absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: "30%" }}
        >
          <Image
            src={`/${bouquet.mode}/bush/bush-${bouquet.greenery + 1}.png`}
            alt="vase"
            width={170}
            height={170}
            className="object-contain w-full drop-shadow-2xl"
            priority
          />
        </div>

        {[...canvasFlowers]
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((cf) => {
            const fd = flowers.find((f) => f.id === cf.flowerId);
            if (!fd) return null;

            const leftPct = (cf.x / CANVAS_W) * 100;
            const topPct = (cf.x / CANVAS_H) * 100;
            const sizePct = (cf.size / CANVAS_W) * 100;

            return (
              <div
                className="absolute"
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${sizePct}%`,
                  aspectRatio: "1 / 1",
                  zIndex: cf.zIndex,
                  transform: `rotate(${cf.rotation}deg) scaleX(${cf.flipH ? -1 : 1})`,
                  opacity: cf.opacity,
                  transformOrigin: "center center",
                }}
              >
                <Image
                  src={`/${bouquet.mode}/flowers/${fd.name}.png`}
                  alt={fd.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}

function DefaultRenderer({ bouquet }: BouquetReadOnlyProps) {
  const getFlowerDimensions = (size: string) => {
    if (size === "small") return 80;
    if (size === "large") return 160;
    return 120;
  };
  return (
    <div className="flex flex-col max-w-lg mx-auto bg-[#F5F5DC] rounded-full">
      <div className="flex relative justify-center items-center py-4 my-4">
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
            {bouquet.flowers.flatMap(
              (flower: { id: number; count: number }, flowerIndex: number) => {
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
                    const dimensions = getFlowerDimensions(flowerData.size);
                    return (
                      <div
                        key={`${flowerIndex}-${instanceIndex}`}
                        className="flex relative justify-center items-center pt-4"
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
              className="absolute top-1/2 left-1/2 z-10 transform -translate-x-1/2 -translate-y-1/2"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LetterCard({ bouquet }: BouquetReadOnlyProps) {
  return (
    <div className="mx-auto max-w-sm text-sm text-center">
      <div className="bg-white border-[1.5px] border-black p-8 mx-auto -translate-y-[50px] -rotate-2 hover:-rotate-2 transition-all duration-300">
        <div className="space-y-4">
          <div className="flex flex-row gap-2 items-left justify-left">
            <p>Dear {bouquet.letter.recipient}</p>
          </div>
          <div className="text-left">
            <p>{bouquet.letter.message}</p>
          </div>
          <div className="flex flex-col gap-2 justify-end items-end">
            <p>Sincerely,</p>
            <p>{bouquet.letter.sender}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
