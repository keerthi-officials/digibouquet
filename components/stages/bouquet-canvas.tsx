"use client";
import { useBouquet } from "@/context/bouquet-context";
import { CanvasFlower } from "@/types";
import { useRef, useState, useEffect, useCallback } from "react";
import { flowers } from "@/data";
import Image from "next/image";
import { cn } from "@/lib/utils";

const CANVAS_W = 560;
const CANVAS_H = 600;
const VASE_W = 170;

const BG_OPTIONS = [
  { value: "#fdf6e3", label: "Cream" },
  { value: "#f9f9ee", label: "Paper" },
  { value: "#0a0a0a", label: "Black" },
  { value: "#1a1a2e", label: "Midnight" },
  { value: "#2d1b1b", label: "Burgundy" },
  { value: "#0f1f0f", label: "Forest" },
];

let zCounter = 100;

function makeUid() {
  return "f_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
}

function sizeToPixels(s: string) {
  if (s === "small") return 80;
  if (s === "large") return 160;
  return 120;
}

interface DragState {
  uid: string;
  startX: number;
  startY: number;
  startFlowerX: number;
  startFlowerY: number;
}

interface ResizeState {
  uid: string;
  startX: number;
  startSize: number;
}

interface RotateState {
  uid: string;
  centerX: number;
  centerY: number;
}

function PaletteFlower({
  flower,
  mode,
  onAdd,
}: {
  flower: (typeof flowers)[0];
  mode: string;
  onAdd: () => void;
}) {
  const displaySize =
    flower.size === "small" ? 60 : flower.size === "large" ? 88 : 72;

  return (
    <button
      onClick={onAdd}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("flowerId", String(flower.id));
        e.dataTransfer.effectAllowed = "copy";
      }}
      className="group flex flex-col items-center gap-1.5 mt-1 p-2 rounded-xl border border-stone-200/60 hover:border-stone-400 bg-white/60 hover:bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-grab active:cursor-grabbing"
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: displaySize, height: displaySize }}
      >
        <Image
          src={`/${mode}/flowers/${flower.name}.png`}
          alt={flower.name}
          width={displaySize}
          height={displaySize}
          className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-300"
          draggable={false}
        />
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-widest text-stone-500 group-hover:text-stone-800 transition-colors">
        {flower.name}
      </span>
    </button>
  );
}

export default function BouquetCanvas() {
  const { bouquet, setCanvasArrangement } = useBouquet();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [placed, setPlaced] = useState<CanvasFlower[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasFlower[][]>([]);
  const [bg, setBg] = useState("#fdf6e3");
  const [isDragOver, setIsDragOver] = useState(false);

  const dragState = useRef<DragState | null>(null);
  const resizeState = useRef<ResizeState | null>(null);
  const rotateState = useRef<RotateState | null>(null);

  useEffect(() => {
    setCanvasArrangement(placed, bg);
  }, [placed, bg]);

  const snap = useCallback(() => {
    setHistory((h) => [...h, placed.map((p) => ({ ...p }))].slice(-20));
  }, [placed]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setPlaced(prev);
      setSelected(null);
      return h.slice(0, -1);
    });
  }, []);

  const addFlower = useCallback(
    (flowerId: number, x?: number, y?: number) => {
      const fd = flowers.find((f) => f.id === flowerId);
      if (!fd) return;
      snap();
      const sz = sizeToPixels(fd.size);
      const cx = x ?? CANVAS_W / 2 + (Math.random() - 0.5) * 80;
      const cy = y ?? CANVAS_H * 0.4 + (Math.random() - 0.5) * 60;
      const nf: CanvasFlower = {
        uid: makeUid(),
        flowerId,
        x: cx - sz / 2,
        y: cy - sz / 2,
        size: sz,
        rotation: (Math.random() - 0.5) * 12,
        opacity: 1,
        flipH: false,
        zIndex: ++zCounter,
      };
      setPlaced((prev) => [...prev, nf]);
      setSelected(nf.uid);
    },
    [snap],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const flowerId = Number(e.dataTransfer.getData("flowerId"));
    if (!flowerId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = CANVAS_W / rect.width;
    addFlower(
      flowerId,
      (e.clientX - rect.left) * scale,
      (e.clientY - rect.top) * scale,
    );
  };

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = CANVAS_W / rect.width;

    if (dragState.current) {
      const ds = dragState.current;
      const dx = (e.clientX - ds.startX) * scale;
      const dy = (e.clientY - ds.startY) * scale;
      setPlaced((prev) =>
        prev.map((p) =>
          p.uid === ds.uid
            ? { ...p, x: ds.startFlowerX + dx, y: ds.startFlowerY + dy }
            : p,
        ),
      );
    } else if (resizeState.current) {
      const rs = resizeState.current;
      const dx = (e.clientX - rs.startX) * scale;
      setPlaced((prev) =>
        prev.map((p) =>
          p.uid === rs.uid
            ? { ...p, size: Math.max(40, Math.min(300, rs.startSize + dx)) }
            : p,
        ),
      );
    } else if (rotateState.current) {
      const rs = rotateState.current;
      const angle =
        (Math.atan2(e.clientX - rs.centerX, -(e.clientY - rs.centerY)) * 180) /
        Math.PI;
      setPlaced((prev) =>
        prev.map((p) =>
          p.uid === rs.uid ? { ...p, rotation: Math.round(angle) } : p,
        ),
      );
    }
  }, []);

  const onPointerUp = useCallback(() => {
    dragState.current = null;
    resizeState.current = null;
    rotateState.current = null;
  }, []);

  const paletteFlowers = flowers.filter((f) =>
    bouquet.flowers.some((bf) => bf.id === f.id),
  );

  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto px-2">
      <h2 className="text-center uppercase text-sm tracking-widest font-bold">
        Arrange Your Bouquet
      </h2>

      <div className="flex gap-3 items-start">
        <div className="shrink-0 w-40 flex flex-col gap-3">
          <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold px-1">
            Your flowers
          </p>

          <div className="flex flex-col gap-2 max-h-130 overflow-y-auto pr-1">
            {paletteFlowers.length === 0 ? (
              <p className="text-xs text-stone-400 italic px-1">
                Go back and pick flowers first
              </p>
            ) : (
              paletteFlowers.map((flower) => (
                <PaletteFlower
                  key={flower.id}
                  flower={flower}
                  mode={bouquet.mode}
                  onAdd={() => addFlower(flower.id)}
                />
              ))
            )}
          </div>

          <div className="mt-1">
            <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold mb-2 px-1">
              Background
            </p>
            <div className="flex flex-wrap gap-2 px-1">
              {BG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBg(opt.value)}
                  title={opt.label}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all",
                    bg === opt.value
                      ? "border-stone-700 scale-110 shadow-md"
                      : "border-stone-300 hover:border-stone-500",
                  )}
                  style={{ background: opt.value }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-1">
            <button
              onClick={undo}
              className="text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-lg border border-stone-300 text-stone-600 hover:border-stone-500 hover:text-stone-800 transition-all"
            >
              ↩ Undo
            </button>
            <button
              onClick={() => {
                if (!placed.length) return;
                snap();
                setPlaced([]);
                setSelected(null);
              }}
              className="text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-lg border border-stone-200 text-stone-400 hover:border-red-300 hover:text-red-400 transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-2">
          <div
            className="relative w-full"
            style={{
              maxWidth: CANVAS_W,
              aspectRatio: `${CANVAS_W}/${CANVAS_H}`,
            }}
          >
            <div
              ref={canvasRef}
              className={cn(
                "absolute inset-0 rounded-2xl overflow-hidden select-none transition-all duration-200",
                isDragOver && "ring-2 ring-stone-400 ring-dashed ring-offset-2",
              )}
              style={{ background: bg }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onClick={() => setSelected(null)}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />

              {placed.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 gap-2">
                  <span className="text-4xl">🌸</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
                    Drag or click flowers to place
                  </span>
                </div>
              )}

              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none" style={{ zIndex: 5}}>
              <Image 
              src={`/${bouquet.mode}/bush/bush-${bouquet.greenery + 1}.png`}
              alt="vase"
              width={VASE_W}
              height={VASE_W}
              className="object-contain drop-shadow-2xl"
              draggable={false}
              />
              </div>

              {placed.map((p) => {
                const fd = flowers.find((f) => f.id === p.flowerId)
                if(!fd) return null;
                const isSel = p.uid === selected;
                return (
                  <div 
                  key={p.uid}
                  className={cn(
                    "absolute touch-none",
                  isSel && "outline outline-2 outline-dashed outline-stone-400/60 outline-offset-2 rounded-sm"
                    )}
                    style={{
                      left: p.x,
                      top: p.y,
                      width: p.size,
                      height: p.size,
                      zIndex: isSel ? 999 : p.zIndex,
                      transform: `rotate(${p.rotation}deg) scaleX(${p.flipH ? -1 : 1})`,
                      opacity: p.opacity,
                      cursor: dragState.current?.uid === p.uid ? "grabbing": "grab"
                    }}
                    
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
