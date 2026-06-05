"use client";

import { useEffect, useState } from "react";
import MatchCard from "../components/MatchCard";
import type { Match } from "../../lib/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/matches/today`)
      .then((res) => res.json())
      .then((data: Match[]) => {
        setMatches(data);
        setIsLoading(false);
      })
      .catch(() => {
        setMatches([]);
        setIsLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-green-400">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-4xl font-black uppercase tracking-[0.12em] text-white">
          Today&apos;s Matches
        </h1>

        {isLoading ? (
          <p className="text-green-400">Loading...</p>
        ) : matches === null || matches.length === 0 ? (
          <p className="text-gray-400">No matches today</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {matches.map((match) => (
              <li key={match.id}>
                <MatchCard match={match} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
