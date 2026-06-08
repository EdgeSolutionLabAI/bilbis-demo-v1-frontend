"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RaceTrackCanvas } from "../components/RaceTrackCanvas";
import { makePrng } from "../../lib/track-generator";

/** Derive a new seed from the previous one via one LCG step. */
function nextSeed(prev: number): number {
  const rand = makePrng(prev ^ 0xdeadbeef);
  return Math.floor(rand() * 0x100000000);
}

export default function RaceTrackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [seed, setSeed] = useState<number>(() => {
    const param = searchParams.get("seed");
    if (param !== null) {
      const n = parseInt(param, 10);
      if (!isNaN(n)) return n;
    }
    // Fixed initial seed so SSR and first hydration agree
    return 42;
  });

  const [inputValue, setInputValue] = useState(String(seed));

  // Keep URL in sync whenever seed changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("seed", String(seed));
    router.replace(`?${params.toString()}`, { scroll: false });
    setInputValue(String(seed));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const handleGenerate = useCallback(() => {
    setSeed((prev) => nextSeed(prev));
  }, []);

  const handleSeedSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const n = parseInt(inputValue, 10);
      if (!isNaN(n)) setSeed(n >>> 0);
    },
    [inputValue],
  );

  return (
    <main className="min-h-screen bg-[#0d1a0d] px-6 py-12 text-green-400">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
        <h1 className="text-4xl font-black uppercase tracking-[0.12em] text-white">
          Race Track Generator
        </h1>

        <RaceTrackCanvas seed={seed} width={700} height={500} />

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded border border-green-400 px-6 py-3 text-lg font-bold uppercase tracking-[0.12em] transition hover:bg-green-400 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
          >
            Generate track
          </button>

          <form
            onSubmit={handleSeedSubmit}
            className="flex items-center gap-2"
            aria-label="Seed input"
          >
            <label
              htmlFor="seed-input"
              className="text-sm font-semibold uppercase tracking-wide"
            >
              Seed
            </label>
            <input
              id="seed-input"
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-32 rounded border border-green-400 bg-transparent px-3 py-2 text-center font-mono text-sm text-green-300 focus:outline-none focus:ring-1 focus:ring-green-400"
            />
            <button
              type="submit"
              className="rounded border border-green-400 px-3 py-2 text-sm font-bold uppercase tracking-wide transition hover:bg-green-400 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
            >
              Apply
            </button>
          </form>
        </div>

        <p className="text-xs text-green-600">
          Same seed always produces the same track · Share via URL
        </p>
      </div>
    </main>
  );
}
