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

function FlowerControls({
  onDelete,
  onDuplicate,
  onFlip,
  onBringForward,
  onSendBack,
}: {
  onDelete: () => void;
  onDuplicate: () => void;
  onFlip: () => void;
  onBringForward: () => void;
  onSendBack: () => void;
}) {
  return (
    <div
      className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-black/90 rounded-full px-2 py-1 shadow-xl whitespace-nowrap z-50 border border-white/10"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {[
        { icon: "↑", title: "Forward", action: onBringForward },
        { icon: "↓", title: "Back", action: onSendBack },
        { icon: "⇄", title: "Flip", action: onFlip },
        { icon: "⊕", title: "Duplicate", action: onDuplicate },
        { icon: "✕", title: "Delete", action: onDelete, danger: true },
      ].map((btn) => (
        <button
          key={btn.title}
          title={btn.title}
          onClick={(e) => {
            e.stopPropagation();
            btn.action();
          }}
          className={cn(
            "w-6 h-6 flex items-center justify-center text-[11px] rounded-full transition-colors",
            btn.danger
              ? "text-red-400 hover:text-red-300 hover:bg-red-900/40"
              : "text-white/60 hover:text-white hover:bg-white/10",
          )}
        >
          {btn.icon}
        </button>
      ))}
    </div>
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

  const duplicateFlower = useCallback(
    (id: string) => {
      const src = placed.find((p) => p.uid === id);
      if (!src) return;
      snap();
      const next: CanvasFlower = {
        ...src,
        uid: makeUid(),
        x: src.x + 20,
        y: src.y + 20,
        zIndex: ++zCounter,
      };
      setPlaced((prev) => [...prev, next]);
      setSelected(next.uid);
    },
    [placed, snap],
  );

  const deleteFlower = useCallback(
    (id: string) => {
      snap();
      setPlaced((prev) => prev.filter((p) => p.uid !== id));
      setSelected(null);
    },
    [snap],
  );

 const bringForward = useCallback((id: string) => {
   setPlaced((prev) => {
     const maxZ = Math.max(...prev.map((p) => p.zIndex));

     return prev.map((p) => (p.uid === id ? { ...p, zIndex: maxZ + 1 } : p));
   });
 }, []);

 const sendBack = useCallback((id: string) => {
   setPlaced((prev) => {
     const minZ = Math.min(...prev.map((p) => p.zIndex));

     return prev.map((p) => (p.uid === id ? { ...p, zIndex: minZ - 1 } : p));
   });
 }, []);

  const flipFlower = useCallback((id: string) => {
    setPlaced((prev) =>
      prev.map((p) => (p.uid === id ? { ...p, flipH: !p.flipH } : p)),
    );
  }, []);

  const updateProp = useCallback(
    <K extends keyof CanvasFlower>(
      id: string,
      key: K,
      val: CanvasFlower[K],
    ) => {
      setPlaced((prev) =>
        prev.map((p) => (p.uid === id ? { ...p, [key]: val } : p)),
      );
    },
    [],
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

  const onFlowerPointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      if ((e.target as HTMLElement).dataset.handle) return;
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      setSelected(id);
      const p = placed.find((f) => f.uid == id);
      if (!p) return;
      dragState.current = {
        uid: id,
        startX: e.clientX,
        startY: e.clientY,
        startFlowerX: p.x,
        startFlowerY: p.y,
      };
    },
    [placed],
  );

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

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      const p = placed.find((f) => f.uid === id);
      if (!p) return;
      snap();
      resizeState.current = { uid: id, startX: e.clientX, startSize: p.size };
    },
    [placed, snap],
  );

  const onRotatePointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      const p = placed.find((f) => f.uid === id);
      if (!p || !canvasRef.current) return;
      snap();
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = rect.width / CANVAS_W;
      rotateState.current = {
        uid: id,
        centerX: rect.left + (p.x + p.size / 2) * scale,
        centerY: rect.top + (p.y + p.size / 2) * scale,
      };
    },
    [placed, snap],
  );

  const selectedFlower = placed.find((p) => p.uid === selected) ?? null;

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
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelected(null);
                }
              }}
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

              <div
                className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{ zIndex: 5 }}
              >
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
                const fd = flowers.find((f) => f.id === p.flowerId);
                if (!fd) return null;
                const isSel = p.uid === selected;
                return (
                  <div
                    key={p.uid}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "absolute touch-none",
                      isSel &&
                        "outline outline-dashed outline-stone-400/60 outline-offset-2 rounded-sm",
                    )}
                    style={{
                      left: p.x,
                      top: p.y,
                      width: p.size,
                      height: p.size,
                      zIndex: isSel ? 999 : p.zIndex,
                      transform: `rotate(${p.rotation}deg) scaleX(${p.flipH ? -1 : 1})`,
                      opacity: p.opacity,
                      cursor:
                        dragState.current?.uid === p.uid ? "grabbing" : "grab",
                    }}
                    onPointerDown={(e) => onFlowerPointerDown(e, p.uid)}
                  >
                    <Image
                      src={`/${bouquet.mode}/flowers/${fd.name}.png`}
                      alt={fd.name}
                      width={p.size}
                      height={p.size}
                      className="w-full h-full object-contain pointer-events-none"
                      draggable={false}
                    />

                    {isSel && (
                      <>
                        <FlowerControls
                          onDelete={() => deleteFlower(p.uid)}
                          onDuplicate={() => duplicateFlower(p.uid)}
                          onFlip={() => flipFlower(p.uid)}
                          onBringForward={() => bringForward(p.uid)}
                          onSendBack={() => sendBack(p.uid)}
                        />

                        <div
                          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-stone-400 rounded-full cursor-se-resize shadow-md z-50"
                          onPointerDown={(e) => onResizePointerDown(e, p.uid)}
                        />

                        <div
                          className="absolute -top-3 -right-3 w-6 h-6 flex items-center justify-center bg-black/80 border border-white/30 text-white rounded-full cursor-grab text-[11px] shadow-md z-50"
                          onPointerDown={(e) => onRotatePointerDown(e, p.uid)}
                          title="Rotate"
                        >
                          ↻
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[9px] text-stone-400 tracking-wide">
            Del · Ctrl+Z · Ctrl+D · Esc
          </p>

          {placed.length > 0 && (
            <p className="text-[9px] text-green-600 font-semibold uppercase tracking-widest">
              ✓ Arrangement saved - recipient will see this exact layout
            </p>
          )}
        </div>

        <div className="shrink-0 w-40 flex flex-col gap-4">
          <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold px-1">
            Properties
          </p>

          {selectedFlower ? (
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] uppercase tracking-widest text-stone-500 font-bold">
                    Size
                  </span>
                  <span className="text-[9px] text-stone-400 font-mono">
                    {Math.round(selectedFlower.size)}px
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={280}
                  value={Math.round(selectedFlower.size)}
                  onChange={(e) =>
                    updateProp(
                      selectedFlower.uid,
                      "size",
                      Number(e.target.value),
                    )
                  }
                  className="w-full accent-stone-800 h-1.5"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] uppercase tracking-widest text-stone-500 font-bold">
                    Rotation
                  </span>
                  <span className="text-[9px] text-stone-400 font-mono">
                    {Math.round(selectedFlower.rotation)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={Math.round(selectedFlower.rotation)}
                  onChange={(e) =>
                    updateProp(
                      selectedFlower.uid,
                      "rotation",
                      Number(e.target.value),
                    )
                  }
                  className="w-full accent-stone-800 h-1.5"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] uppercase tracking-widest text-stone-500 font-bold">
                    Opacity
                  </span>
                  <span className="text-[9px] text-stone-400 font-mono">
                    {Math.round(selectedFlower.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round(selectedFlower.opacity * 100)}
                  onChange={(e) =>
                    updateProp(
                      selectedFlower.uid,
                      "opacity",
                      Number(e.target.value) / 100,
                    )
                  }
                  className="w-full accent-stone-800 h-1.5"
                />
              </div>

              <button
                onClick={() => flipFlower(selectedFlower.uid)}
                className={cn(
                  "w-full text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-lg border transition-all",
                  selectedFlower.flipH
                    ? "bg-stone-800 text-white border-stone-800"
                    : "border-stone-300 text-stone-600 hover:border-stone-500",
                )}
              >
                ⇄ {selectedFlower.flipH ? "Flipped" : "Flip H"}
              </button>

              <div className="flex gap-1.5">
                <button
                  onClick={() => bringForward(selectedFlower.uid)}
                  className="flex-1 text-xs font-semibold py-2 rounded-lg border border-stone-300 text-stone-600 hover:border-stone-500 transition-all"
                >
                  ↑
                </button>
                <button
                  onClick={() => sendBack(selectedFlower.uid)}
                  className="flex-1 text-xs font-semibold py-2 rounded-lg border border-stone-300 text-stone-600 hover:border-stone-500 transition-all"
                >
                  ↓
                </button>
              </div>

              <button
                onClick={() => deleteFlower(selectedFlower.uid)}
                className="text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-lg border border-red-200 text-red-400 hover:border-red-400 hover:bg-red-50 transition-all"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
              <span className="text-2xl opacity-30">🌸</span>
              <p className="text-xs text-stone-400 leading-relaxed">
                Click a flower to edit
              </p>
            </div>
          )}

          {placed.length > 0 && (
            <div className="mt-1">
              <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold mb-2 px-1">
                Layers ({placed.length})
              </p>

              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {[...placed].reverse().map((p) => {
                  const fd = flowers.find((f) => f.id === p.flowerId);
                  return (
                    <button
                      key={p.uid}
                      onClick={() => setSelected(p.uid)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-lg border text-left text-[10px] transition-all",
                        p.uid === selected
                          ? "border-stone-500 bg-stone-100 text-stone-800"
                          : "border-stone-200 text-stone-500 hover:border-stone-400",
                      )}
                    >
                      <Image
                        src={`/${bouquet.mode}/flowers/${fd?.name}.png`}
                        alt={fd?.name ?? ""}
                        width={18}
                        height={18}
                        className="object-contain shrink-0"
                        draggable={false}
                      />
                      <span className="truncate capitalize">{fd?.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
