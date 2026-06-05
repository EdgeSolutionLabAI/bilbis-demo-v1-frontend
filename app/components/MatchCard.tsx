"use client";

import type { Match } from "../../lib/types";

interface MatchCardProps {
  match: Match;
  onStarToggle?: (id: string) => void;
}

export default function MatchCard({ match, onStarToggle }: MatchCardProps) {
  const isLive = match.status === "live";
  const eventLabel = match.tournament ?? match.event;

  const scoreDisplay =
    match.score1 !== undefined && match.score2 !== undefined
      ? `${match.score1} - ${match.score2}`
      : match.mapScore ?? "vs";

  return (
    <div className="hltv-match-row">
      {/* Status / time */}
      <div style={{ minWidth: 42, flexShrink: 0 }}>
        {isLive ? (
          <span className="hltv-live-badge">LIVE</span>
        ) : (
          <span style={{ fontSize: 11, color: "var(--hltv-muted)", fontWeight: 600 }}>
            {match.time}
          </span>
        )}
      </div>

      {/* Format badge */}
      <span className="hltv-format-badge">{match.format}</span>

      {/* Teams + score */}
      <div className="hltv-teams">
        <span className="hltv-team-name">{match.team1}</span>
        <span className="hltv-score">{scoreDisplay}</span>
        <span className="hltv-team-name" style={{ textAlign: "right" }}>
          {match.team2}
        </span>
      </div>

      {/* Event / tournament */}
      <span className="hltv-event-name">{eventLabel}</span>

      {/* Optional round tag */}
      {match.tag && <span className="hltv-tag-orange">{match.tag}</span>}

      {/* Action icons */}
      <div style={{ display: "flex", gap: 4, marginLeft: "auto", flexShrink: 0 }}>
        <button
          className="hltv-icon-btn"
          aria-label="Toggle favourite"
          onClick={() => onStarToggle?.(match.id)}
          style={{ color: match.starred ? "#ffd700" : undefined }}
        >
          {match.starred ? "★" : "☆"}
        </button>
        <button className="hltv-icon-btn" aria-label="Stats">▦</button>
        <button className="hltv-icon-btn" aria-label="Expand">›</button>
      </div>
    </div>
  );
}
