"use client";

import { useEffect, useMemo, useState } from "react";
import MatchCard from "../components/MatchCard";
import type { Match } from "../../lib/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Days in June 2026 to render in the mini-calendar
const JUNE_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
// June 1 2026 is a Monday (day index 0 = Mon)
const JUNE_START_DOF = 0;
const DAY_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const TODAY_DAY = 5; // June 5

const DEFAULT_TOURNAMENTS = [
  "IEM Cologne Major",
  "CCT 2026 Europe",
  "NODWIN Clutch S",
  "ESEA Advanced Se",
];

const ALL_REGIONS = ["Europe", "Asia", "Americas"] as const;
type Region = (typeof ALL_REGIONS)[number];

const REGION_COUNTS: Record<Region, number> = { Europe: 22, Asia: 0, Americas: 0 };

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"event" | "time">("event");
  const [starredOnly, setStarredOnly] = useState(false);
  const [filterRanked, setFilterRanked] = useState({ ranked: true, unranked: true });
  const [filterRegions, setFilterRegions] = useState<Set<Region>>(new Set(ALL_REGIONS));
  const [enabledTournaments, setEnabledTournaments] = useState<Set<string>>(
    new Set(DEFAULT_TOURNAMENTS)
  );

  useEffect(() => {
    fetch(`${BACKEND_URL}/matches/today`, { cache: "no-store" })
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

  const toggleRegion = (region: Region) => {
    setFilterRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  };

  const toggleTournament = (t: string) => {
    setEnabledTournaments((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const sorted = useMemo(() => {
    if (!matches) return [];
    const list = starredOnly ? matches.filter((m) => m.starred) : [...matches];
    return list.sort((a, b) =>
      sortBy === "event"
        ? (a.tournament ?? a.event).localeCompare(b.tournament ?? b.event)
        : a.time.localeCompare(b.time)
    );
  }, [matches, sortBy, starredOnly]);

  const liveMatches = useMemo(() => sorted.filter((m) => m.status === "live"), [sorted]);
  const upcomingMatches = useMemo(
    () => sorted.filter((m) => m.status !== "live"),
    [sorted]
  );

  return (
    <main className="hltv-page" style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Left sidebar ── */}
      <aside className="hltv-sidebar">
        {/* Mini calendar */}
        <div className="hltv-calendar">
          <div className="hltv-calendar-header">
            <button className="hltv-icon-btn">‹</button>
            <span>June</span>
            <button className="hltv-icon-btn">›</button>
          </div>
          <div className="hltv-calendar-grid">
            {DAY_HEADERS.map((d) => (
              <span key={d} style={{ fontWeight: 700, color: "var(--hltv-muted)", fontSize: 10 }}>
                {d}
              </span>
            ))}
            {/* Empty cells before June 1 (Monday = 0 offset) */}
            {Array.from({ length: JUNE_START_DOF }, (_, i) => (
              <span key={`empty-${i}`} />
            ))}
            {JUNE_DAYS.map((day) => (
              <span
                key={day}
                className={`hltv-cal-day${day === TODAY_DAY ? " today" : ""}`}
              >
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Star filter */}
        <div className="hltv-filter-group">
          <span className="hltv-filter-label">Star</span>
          <label className="hltv-filter-option">
            <input
              type="checkbox"
              checked={starredOnly}
              onChange={(e) => setStarredOnly(e.target.checked)}
            />
            Starred matches only
          </label>
        </div>

        {/* Ranked filter */}
        <div className="hltv-filter-group">
          <span className="hltv-filter-label">Ranked</span>
          <label className="hltv-filter-option">
            <input
              type="checkbox"
              checked={filterRanked.ranked}
              onChange={(e) =>
                setFilterRanked((p) => ({ ...p, ranked: e.target.checked }))
              }
            />
            Ranked
          </label>
          <label className="hltv-filter-option">
            <input
              type="checkbox"
              checked={filterRanked.unranked}
              onChange={(e) =>
                setFilterRanked((p) => ({ ...p, unranked: e.target.checked }))
              }
            />
            Unranked
          </label>
        </div>

        {/* Region filter */}
        <div className="hltv-filter-group">
          <span className="hltv-filter-label">Region</span>
          {ALL_REGIONS.map((region) => (
            <label key={region} className="hltv-filter-option">
              <input
                type="checkbox"
                checked={filterRegions.has(region)}
                onChange={() => toggleRegion(region)}
              />
              {region}
              <span style={{ marginLeft: "auto", color: "var(--hltv-muted)", fontSize: 10 }}>
                {REGION_COUNTS[region]}
              </span>
            </label>
          ))}
        </div>

        {/* Tournament filter */}
        <div className="hltv-filter-group">
          <span className="hltv-filter-label">Tournament</span>
          {DEFAULT_TOURNAMENTS.map((t) => (
            <label key={t} className="hltv-filter-option">
              <input
                type="checkbox"
                checked={enabledTournaments.has(t)}
                onChange={() => toggleTournament(t)}
              />
              {t}
            </label>
          ))}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, padding: "16px 20px", minWidth: 0 }}>
        <h1 className="hltv-page-heading">Live Counter-Strike matches</h1>

        {/* Sort bar */}
        <div className="hltv-sort-bar">
          <button
            className={`hltv-sort-btn${sortBy === "event" ? " active" : ""}`}
            onClick={() => setSortBy("event")}
          >
            Event
          </button>
          <button
            className={`hltv-sort-btn${sortBy === "time" ? " active" : ""}`}
            onClick={() => setSortBy("time")}
          >
            Time
          </button>
          <span
            className="hltv-star-icon"
            style={{ marginLeft: "auto", fontSize: 16 }}
            title="Show starred only"
            onClick={() => setStarredOnly((v) => !v)}
          >
            {starredOnly ? "★" : "☆"}
          </span>
        </div>

        {/* Live matches */}
        {isLoading ? (
          <p style={{ color: "var(--hltv-muted)", fontSize: 13 }}>Loading…</p>
        ) : liveMatches.length === 0 ? (
          <p style={{ color: "var(--hltv-muted)", fontSize: 13 }}>No live matches</p>
        ) : (
          <div>
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}

        {/* Upcoming / matches for you */}
        {!isLoading && upcomingMatches.length > 0 && (
          <>
            <h2
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--hltv-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "20px 0 8px",
                paddingBottom: 4,
                borderBottom: "1px solid var(--hltv-border)",
              }}
            >
              Matches for you
            </h2>
            {upcomingMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </>
        )}
      </div>
    </main>
  );
}
