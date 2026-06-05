'use client';

import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';

const GAME_DURATION = 15; // seconds
const PANEL_W = 280;
const PANEL_H = 260;
const DOGE_SIZE = 56;

type Phase = 'idle' | 'playing' | 'done';

function randomPos(): { x: number; y: number } {
  // keep doge inside panel bounds
  return {
    x: Math.floor(Math.random() * (PANEL_W - DOGE_SIZE)),
    y: Math.floor(Math.random() * (PANEL_H - DOGE_SIZE - 8)),
  };
}

export default function MiniGame() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [dogePos, setDogePos] = useState(randomPos);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopGame = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setPhase('done');
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setDogePos(randomPos());
    setPhase('playing');
  }, []);

  // countdown tick
  useEffect(() => {
    if (phase !== 'playing') return;
    tickRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [phase, stopGame]);

  const handleDogeClick = () => {
    if (phase !== 'playing') return;
    setScore((s) => s + 1);
    setDogePos(randomPos());
  };

  const timerColor = timeLeft <= 5 ? '#ff4444' : '#00ff00';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '12%',
        left: '3%',
        zIndex: 45,
        background: 'rgba(0,0,0,0.82)',
        border: '3px solid #ff00ff',
        boxShadow: '0 0 18px #ff00ff, inset 0 0 12px rgba(255,0,255,0.15)',
        borderRadius: 8,
        padding: '10px 14px 12px',
        width: PANEL_W,
        fontFamily: 'Impact, Arial Black, sans-serif',
        userSelect: 'none',
      }}
    >
      {/* header */}
      <div
        style={{
          textAlign: 'center',
          color: '#ff00ff',
          fontSize: '1.15rem',
          fontWeight: 900,
          letterSpacing: '0.08em',
          textShadow: '0 0 10px #ff00ff',
          marginBottom: 6,
        }}
      >
        🐕 CLICK THE DOGE! 🐕
      </div>

      {/* score + timer bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: '#ffff00', fontSize: '0.95rem', textShadow: '0 0 8px #ffff00' }}>
          SCORE: {score}
        </span>
        <span style={{ color: timerColor, fontSize: '0.95rem', textShadow: `0 0 8px ${timerColor}` }}>
          {phase === 'playing' ? `⏱ ${timeLeft}s` : phase === 'done' ? 'TIME UP!' : 'READY?'}
        </span>
      </div>

      {/* game area */}
      <div
        style={{
          position: 'relative',
          width: PANEL_W - 28,
          height: PANEL_H,
          background: 'rgba(0,20,0,0.6)',
          border: '2px solid #00ff0055',
          borderRadius: 4,
          overflow: 'hidden',
          cursor: phase === 'playing' ? 'crosshair' : 'default',
        }}
      >
        {phase === 'idle' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <div style={{ color: '#aaa', fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.4 }}>
              Click the doge as fast<br />as you can in {GAME_DURATION}s!
            </div>
            <button onClick={startGame} style={btnStyle('#00ff00')}>
              ▶ START
            </button>
          </div>
        )}

        {phase === 'playing' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/doge.svg"
            alt="doge"
            width={DOGE_SIZE}
            height={DOGE_SIZE}
            onClick={handleDogeClick}
            style={{
              position: 'absolute',
              left: dogePos.x,
              top: dogePos.y,
              cursor: 'pointer',
              transition: 'left 0.08s ease, top 0.08s ease',
              filter: 'drop-shadow(0 0 6px #ffff00)',
            }}
          />
        )}

        {phase === 'done' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <div style={{ color: '#ffff00', fontSize: '1rem', textShadow: '0 0 10px #ffff00' }}>
              SCORE: {score} 🏆
            </div>
            <div style={{ color: score >= 10 ? '#00ff00' : '#ff8800', fontSize: '0.8rem' }}>
              {score >= 20 ? 'PRO GAMER! 🔥' : score >= 10 ? 'NICE SKILLZ 💪' : 'GIT GUD 😢'}
            </div>
            <button onClick={startGame} style={btnStyle('#ff00ff')}>
              🔄 REPLAY
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function btnStyle(color: string): CSSProperties {
  return {
    background: 'transparent',
    border: `2px solid ${color}`,
    color,
    fontFamily: 'Impact, Arial Black, sans-serif',
    fontSize: '0.95rem',
    fontWeight: 900,
    letterSpacing: '0.08em',
    padding: '4px 18px',
    cursor: 'pointer',
    textShadow: `0 0 8px ${color}`,
    boxShadow: `0 0 10px ${color}44`,
    borderRadius: 4,
  };
}
