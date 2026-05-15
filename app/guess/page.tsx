"use client";

import { useEffect, useState } from "react";

// Backend base URL — set NEXT_PUBLIC_BACKEND_URL in your environment.
// Defaults to the same origin so a reverse-proxy can forward /api/* to the backend.
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

interface SessionResponse {
  sessionId: string;
  minValue: number;
  maxValue: number;
  attemptLimit: number;
}

interface GuessResponse {
  result: "higher" | "lower" | "correct" | "out_of_attempts";
  attemptsUsed: number;
  attemptsRemaining: number;
  revealedSecret: number | null;
}

interface ErrorResponse {
  error: string;
}

interface HistoryEntry {
  guess: number;
  result: string;
}

interface Session {
  sessionId: string;
  minValue: number;
  maxValue: number;
  attemptsRemaining: number;
}

interface GameOver {
  outcome: "won" | "lost";
  revealedSecret: number;
}

export default function GuessPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [guessInput, setGuessInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<GameOver | null>(null);
  const [sessionsPlayed, setSessionsPlayed] = useState(0);
  const [sessionsWon, setSessionsWon] = useState(0);

  const startSession = async () => {
    setSessionLoading(true);
    setSession(null);
    setHistory([]);
    setGuessInput("");
    setValidationError(null);
    setApiError(null);
    setGameOver(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/guess/session`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as SessionResponse;
      setSession({
        sessionId: data.sessionId,
        minValue: data.minValue,
        maxValue: data.maxValue,
        attemptsRemaining: data.attemptLimit,
      });
    } catch {
      setApiError("Failed to start session. Please try again.");
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const guessNum = Number(guessInput);

    if (!Number.isInteger(guessNum) || guessInput.trim() === "") {
      setValidationError("Please enter a whole number.");
      return;
    }
    if (guessNum < session.minValue || guessNum > session.maxValue) {
      setValidationError(
        `Number must be between ${session.minValue} and ${session.maxValue}.`,
      );
      return;
    }

    setValidationError(null);
    setApiError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.sessionId, guess: guessNum }),
      });

      if (!response.ok) {
        const errData = (await response.json()) as ErrorResponse;
        setApiError(`Bad guess: ${errData.error}`);
        return;
      }

      const data = (await response.json()) as GuessResponse;
      setHistory((prev) => [...prev, { guess: guessNum, result: data.result }]);
      setGuessInput("");

      if (data.result === "correct") {
        setSessionsPlayed((p) => p + 1);
        setSessionsWon((w) => w + 1);
        // revealedSecret is non-null for terminal results
        setGameOver({ outcome: "won", revealedSecret: data.revealedSecret! });
      } else if (data.result === "out_of_attempts") {
        setSessionsPlayed((p) => p + 1);
        setGameOver({ outcome: "lost", revealedSecret: data.revealedSecret! });
      } else {
        setSession((prev) =>
          prev ? { ...prev, attemptsRemaining: data.attemptsRemaining } : prev,
        );
      }
    } catch {
      setApiError("Request failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const errorId = "guess-error";
  const hasError = Boolean(validationError ?? apiError);

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-green-400">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <h1 className="text-4xl font-black uppercase tracking-[0.12em] text-white">
          Guess the number
        </h1>

        {sessionLoading ? (
          <p>Starting session…</p>
        ) : session === null ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-red-400">
              {apiError ?? "Failed to start session."}
            </p>
            <button
              type="button"
              onClick={startSession}
              className="self-start rounded border border-green-400 px-6 py-3 text-lg font-bold uppercase tracking-[0.12em] transition hover:bg-green-400 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <p>
              Pick a number between {session.minValue} and {session.maxValue}.{" "}
              {gameOver
                ? "Game over."
                : `You have ${session.attemptsRemaining} attempt${session.attemptsRemaining === 1 ? "" : "s"} left.`}
            </p>

            {gameOver ? (
              <div className="flex flex-col gap-4">
                <p className="text-xl font-bold text-white">
                  {gameOver.outcome === "won"
                    ? `You won! The number was ${gameOver.revealedSecret}.`
                    : `Out of attempts. The number was ${gameOver.revealedSecret}.`}
                </p>
                <button
                  type="button"
                  onClick={startSession}
                  className="self-start rounded border border-green-400 px-6 py-3 text-lg font-bold uppercase tracking-[0.12em] transition hover:bg-green-400 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                >
                  Play again
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3">
                    <input
                      id="guess-input"
                      type="number"
                      min={session.minValue}
                      max={session.maxValue}
                      step={1}
                      value={guessInput}
                      onChange={(e) => setGuessInput(e.target.value)}
                      aria-label="Your guess"
                      aria-describedby={hasError ? errorId : undefined}
                      className="w-32 rounded border border-green-400 bg-black px-4 py-3 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || guessInput.trim() === ""}
                      className="rounded border border-green-400 px-6 py-3 text-lg font-bold uppercase tracking-[0.12em] transition hover:bg-green-400 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? "Checking…" : "Submit guess"}
                    </button>
                  </div>

                  {hasError ? (
                    <p
                      id={errorId}
                      role="alert"
                      className="text-sm font-semibold text-red-400"
                    >
                      {validationError ?? apiError}
                    </p>
                  ) : null}
                </div>
              </form>
            )}

            {history.length > 0 ? (
              <ol className="flex flex-col gap-2">
                {history.map((entry, i) => (
                  <li
                    key={i}
                    className="rounded border border-green-400/30 px-4 py-2 font-mono text-sm"
                  >
                    <span className="text-white">{entry.guess}</span>
                    <span className="mx-2">—</span>
                    <span>{entry.result}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </>
        )}

        <footer className="mt-2 border-t border-green-400/20 pt-4 text-sm text-green-400/70">
          Sessions played: {sessionsPlayed} · Sessions won: {sessionsWon}
        </footer>
      </div>
    </main>
  );
}
