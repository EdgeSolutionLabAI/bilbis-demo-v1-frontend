import type { Match } from "../../lib/types";

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  return (
    <div className="border border-green-400 bg-black p-4 rounded">
      <p className="text-xl font-black text-white">
        {match.team1} vs {match.team2}
      </p>
      <p className="mt-1 text-sm text-green-400">{match.time}</p>
      <p className="mt-0.5 text-sm text-gray-400">{match.event}</p>
      <span className="mt-2 inline-block border border-green-400 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-green-400">
        {match.format}
      </span>
    </div>
  );
}
