"use client";

import { useState } from "react";

interface DiceRollResponse {
  dice1: number;
  dice2: number;
}

const EMPTY_DIE = "–";

export default function RollDicePage() {
  const [dice, setDice] = useState<DiceRollResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleRoll = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await fetch("/api/roll-dice");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const nextDice = (await response.json()) as DiceRollResponse;
      setDice(nextDice);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-green-400">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-black uppercase tracking-[0.12em] text-white">
          Roll the dice
        </h1>

        <button
          className="rounded border border-green-400 px-6 py-3 text-lg font-bold uppercase tracking-[0.12em] transition hover:bg-green-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
          onClick={handleRoll}
          type="button"
        >
          {isLoading ? "Rolling..." : "Roll"}
        </button>

        <div className="flex gap-4">
          {[dice?.dice1 ?? EMPTY_DIE, dice?.dice2 ?? EMPTY_DIE].map((value, index) => (
            <div
              key={index}
              className="flex h-24 w-24 items-center justify-center border-2 border-green-400 bg-black text-5xl font-black text-white"
            >
              {value}
            </div>
          ))}
        </div>

        {hasError ? (
          <p className="text-sm font-semibold text-red-400">Roll failed — try again</p>
        ) : null}
      </div>
    </main>
  );
}
