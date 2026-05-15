"use client";

import { useState } from "react";

type CoinResult = "heads" | "tails";

interface CoinFlipResponse {
  result: CoinResult;
  flipId: string;
}

export default function CoinFlipPage() {
  const [result, setResult] = useState<CoinResult | null>(null);
  const [streak, setStreak] = useState(0);
  const [streakSide, setStreakSide] = useState<CoinResult | null>(null);
  const [history, setHistory] = useState<CoinResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleFlip = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await fetch("/api/coin-flip", { method: "POST" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as CoinFlipResponse;
      const newResult = data.result;

      // streakSide holds the side from the previous flip; compare before updating
      setStreak((prev) => (newResult === streakSide ? prev + 1 : 1));
      setStreakSide(newResult);
      setResult(newResult);
      setHistory((prev) => [...prev, newResult].slice(-5));
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const streakText =
    streakSide === null ? "—" : `${streak} ${streakSide}`;

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-green-400">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-black uppercase tracking-[0.12em] text-white">
          Coin flip
        </h1>

        {/* Badge — screen readers announce new results via aria-live */}
        <div
          aria-live="polite"
          aria-label={result ? `Result: ${result}` : "No flip yet"}
          className="flex h-[120px] w-[120px] items-center justify-center rounded-full border-2 border-green-400 bg-black text-3xl font-black text-white"
        >
          {result ? (result === "heads" ? "H" : "T") : "?"}
        </div>

        <button
          className="rounded border border-green-400 px-6 py-3 text-lg font-bold uppercase tracking-[0.12em] transition hover:bg-green-400 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
          onClick={handleFlip}
          type="button"
        >
          {isLoading ? "Flipping…" : "Flip the coin"}
        </button>

        <p className="text-lg font-semibold">Streak: {streakText}</p>

        {hasError ? (
          <p className="text-sm font-semibold text-red-400">
            Flip failed — try again
          </p>
        ) : null}

        {history.length > 0 ? (
          <div aria-label="Flip history" className="flex gap-3">
            {history.map((flip, index) => (
              <div
                key={index}
                aria-label={flip}
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${
                  flip === "heads"
                    ? "border-green-400 text-green-400"
                    : "border-yellow-400 text-yellow-400"
                }`}
              >
                {flip === "heads" ? "H" : "T"}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
