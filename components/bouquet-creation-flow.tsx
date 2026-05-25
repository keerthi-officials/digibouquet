"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useBouquet } from "@/context/bouquet-context";
import FlowerPicker from "./stages/flower-picker";
import BouquetCustomizer from "./stages/bouquet-customizer";
import CardWriter from "./stages/card-writer";
import ShareBouquet from "./stages/share-bouquet";
import BouquetCanvas from "./stages/bouquet-canvas";

const steps = ["Pick Flowers", "Arrange", "Write Card", "Share"];

export default function BouquetCreationFlow() {
  const { bouquet, canProceed } = useBouquet();
  const [advancedArrange, setAdvancedArrange] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <main className="container flex flex-col p-4 mx-auto min-h-screen">
      <Link href="/">
        <Image
          src="/digiflority.png"
          alt="digiflority"
          width={200}
          height={80}
          className="object-cover mx-auto mt-6"
          priority
        />
      </Link>

      <div className="flex justify-center gap-2 mt-4 mb-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i === currentStep
                  ? "bg-black text-[#F5F5DC]"
                  : i < currentStep
                    ? "bg-stone-400 text-white"
                    : "bg-stone-200 text-stone-400"
              }`}
            >
              {i < currentStep ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs uppercase tracking-widest hidden sm:block ${
                i === currentStep ? "text-black font-bold" : "text-stone-400"
              }`}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-px ${
                  i < currentStep ? "bg-stone-400" : "bg-stone-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grow py-6">
        {currentStep === 0 && <FlowerPicker />}
        {currentStep === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setAdvancedArrange(false)}
                className={`text-xs px-4 py-2 uppercase tracking-widest border transition-all ${
                  !advancedArrange
                    ? "bg-black text-[#F5F5DC] border-black"
                    : "border-stone-300 text-stone-500 hover:border-stone-500"
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setAdvancedArrange(true)}
                className={`text-xs px-4 py-2 uppercase tracking-widest border transition-all ${
                  advancedArrange
                    ? "bg-black text-[#F5F5DC] border-black"
                    : "border-stone-300 text-stone-500 hover:border-stone-500"
                }`}
              >
                ✦ Advanced Arrange
              </button>
            </div>
            {advancedArrange ? <BouquetCanvas /> : <BouquetCustomizer />}
          </div>
        )}
        {currentStep === 2 && <CardWriter />}
        {currentStep === 3 && <ShareBouquet />}
      </div>

      <div className="flex flex-row gap-4 justify-center m-auto pb-8">
        {currentStep > 0 && (
          <button
            onClick={prevStep}
            className="text-sm px-4 py-2 border border-[#000000]"
          >
            BACK
          </button>
        )}
        {currentStep < steps.length - 1 && (
          <button
            onClick={nextStep}
            disabled={currentStep === 0 && !canProceed}
            className={`text-sm px-4 py-2 ml-auto ${
              currentStep === 0 && !canProceed
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#000000] text-[#F5F5DC]"
            }`}
          >
            NEXT
          </button>
        )}
      </div>
    </main>
  );
}
