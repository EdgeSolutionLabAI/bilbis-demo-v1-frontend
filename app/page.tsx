'use client';

import { useEffect, useState } from 'react';
import EmojiToggle from './components/EmojiToggle';

function toUTCTimeString(epochMs: number): string {
  const d = new Date(epochMs);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function ClockWidget() {
  const [display, setDisplay] = useState('--:--:--');

  useEffect(() => {
    let anchorEpoch: number | null = null;
    let anchorWall: number | null = null;

    async function fetchAndAnchor(): Promise<void> {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/time`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { epochMs: number } = await res.json();
        anchorEpoch = data.epochMs;
        anchorWall = Date.now();
        setDisplay(toUTCTimeString(data.epochMs));
      } catch {
        // keep current display: --:--:-- on initial failure, last known value on re-sync failure
      }
    }

    fetchAndAnchor();

    const tickId = setInterval(() => {
      if (anchorEpoch !== null && anchorWall !== null) {
        setDisplay(toUTCTimeString(anchorEpoch + (Date.now() - anchorWall)));
      }
    }, 1000);

    const syncId = setInterval(fetchAndAnchor, 60_000);

    return () => {
      clearInterval(tickId);
      clearInterval(syncId);
    };
  }, []);

  return (
    <div
      aria-live="off"
      style={{
        position: 'absolute',
        top: '1%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        fontFamily: 'monospace',
        fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
        fontWeight: 900,
        color: '#00ff00',
        textShadow: '2px 2px 0 #000, 0 0 15px #00ff00',
        letterSpacing: '0.1em',
      }}
    >
      {display}
    </div>
  );
}

const DOGE_POSITIONS = [
  { top: '5%',  left: '3%',  size: 90,  rotate: '-12deg', delay: '0s' },
  { top: '8%',  left: '72%', size: 80,  rotate: '8deg',   delay: '0.3s' },
  { top: '38%', left: '1%',  size: 100, rotate: '5deg',   delay: '0.6s' },
  { top: '55%', left: '65%', size: 85,  rotate: '-6deg',  delay: '0.1s' },
  { top: '72%', left: '20%', size: 75,  rotate: '15deg',  delay: '0.4s' },
  { top: '80%', left: '80%', size: 95,  rotate: '-10deg', delay: '0.2s' },
];

const X_MARKS = [
  { top: '15%', left: '30%' }, { top: '25%', left: '60%' },
  { top: '45%', left: '40%' }, { top: '60%', left: '10%' },
  { top: '70%', left: '55%' }, { top: '85%', left: '35%' },
  { top: '10%', left: '50%' }, { top: '50%', left: '85%' },
];

const WOW_TEXTS = [
  { text: 'wow',        color: '#ff00ff', top: '12%', left: '8%',  rotate: '-8deg' },
  { text: 'such MLG',   color: '#00ffff', top: '20%', left: '75%', rotate: '6deg'  },
  { text: 'very 360',   color: '#ffff00', top: '48%', left: '55%', rotate: '-5deg' },
  { text: 'much noscope', color: '#ff8800', top: '62%', left: '3%', rotate: '10deg' },
  { text: 'so dank',    color: '#00ff88', top: '78%', left: '60%', rotate: '-12deg' },
  { text: 'amaze',      color: '#ff4444', top: '32%', left: '28%', rotate: '7deg'  },
];

export default function Home() {
  return (
    <div className="mlg-bg" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* === UTC clock — anchored from /api/time, ticks locally every second === */}
      <ClockWidget />

      {/* === Doge faces scattered around === */}
      {DOGE_POSITIONS.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            transform: `rotate(${pos.rotate})`,
            zIndex: 10,
            animationDelay: pos.delay,
          }}
          className="bounce"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/doge.svg" alt="doge" width={pos.size} height={pos.size} />
        </div>
      ))}

      {/* === X marks === */}
      {X_MARKS.map((pos, i) => (
        <div
          key={i}
          className="x-mark"
          style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 8 }}
        >
          ✕
        </div>
      ))}

      {/* === Wow speech texts === */}
      {WOW_TEXTS.map((w, i) => (
        <div
          key={i}
          className="wow-text"
          style={{
            position: 'absolute',
            top: w.top,
            left: w.left,
            color: w.color,
            fontSize: '1.1rem',
            transform: `rotate(${w.rotate})`,
            zIndex: 12,
            fontFamily: 'Comic Sans MS, cursive',
          }}
        >
          {w.text}
        </div>
      ))}

      {/* === Illuminati triangle (left side) === */}
      <div
        style={{ position: 'absolute', top: '28%', left: '2%', zIndex: 15 }}
        className="spin-slow"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/illuminati.svg" alt="illuminati" width={130} height={130} />
      </div>

      {/* === Scope crosshair overlay (center) === */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 220,
          height: 220,
          zIndex: 20,
          pointerEvents: 'none',
        }}
        className="crosshair scope-ring"
      />

      {/* === Scope inner dot === */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'red',
          boxShadow: '0 0 12px red',
          zIndex: 21,
          pointerEvents: 'none',
        }}
      />

      {/* === Main title block === */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 30,
        }}
        className="slide-up"
      >
        <div
          className="glitch-wrapper mlg-pulse"
          data-text="TRUST NO ONE"
          style={{
            fontSize: 'clamp(2rem, 6vw, 4.5rem)',
            fontWeight: 900,
            color: '#fff',
            fontFamily: 'Impact, Arial Black, sans-serif',
            letterSpacing: '0.08em',
            textShadow: '4px 4px 0 #000, 0 0 30px #ff0000, 0 0 60px #ff0000',
            textTransform: 'uppercase',
          }}
        >
          🔥 TRUST NO ONE 🔥
        </div>
      </div>

      {/* === RUSH B text (top-left area) === */}
      <div
        style={{
          position: 'absolute',
          top: '2%',
          left: '22%',
          zIndex: 25,
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: 'clamp(0.9rem, 2.5vw, 1.6rem)',
          fontWeight: 900,
          letterSpacing: '0.12em',
          color: '#ff9900',
          textShadow: '2px 2px 0 #000, 0 0 15px #ff9900',
          transform: 'rotate(-3deg)',
        }}
        className="shake"
      >
        🎮 RUSH B VETERAN 🎮
      </div>

      {/* === Mountain Dew reference === */}
      <div
        style={{
          position: 'absolute',
          bottom: '18%',
          right: '5%',
          zIndex: 25,
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: 'clamp(1rem, 3vw, 2rem)',
          fontWeight: 900,
          color: '#ccff00',
          textShadow: '3px 3px 0 #006600, 0 0 20px #ccff00',
          transform: 'rotate(5deg)',
        }}
        className="float-up"
      >
        🟩 MOUNTAIN DEW 🟩
      </div>

      {/* === COD reference === */}
      <div
        style={{
          position: 'absolute',
          bottom: '28%',
          right: '8%',
          zIndex: 25,
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: 'clamp(0.8rem, 2.5vw, 1.8rem)',
          fontWeight: 900,
          color: '#ff6600',
          textShadow: '2px 2px 0 #000, 0 0 15px #ff6600',
          transform: 'rotate(-4deg)',
        }}
        className="pulse-glow"
      >
        ◈ COD ◈
      </div>

      {/* === FaZe style clan tag === */}
      <div
        style={{
          position: 'absolute',
          top: '22%',
          right: '4%',
          zIndex: 25,
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: 'clamp(1rem, 3vw, 2.2rem)',
          fontWeight: 900,
          color: '#ff0000',
          textShadow: '3px 3px 0 #000, 0 0 20px #ff0000',
          transform: 'rotate(8deg)',
        }}
        className="neon-red heartbeat"
      >
        ⚡ FaZe▲UP ⚡
      </div>

      {/* === MLG Logo === */}
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
        }}
        className="mlg-pulse"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mlg-logo.svg" alt="MLG" width={240} height={103} />
      </div>

      {/* === CS2 Logo === */}
      <div
        style={{
          position: 'absolute',
          top: '58%',
          left: '72%',
          zIndex: 25,
          transform: 'rotate(-6deg)',
        }}
        className="bounce"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cs2-logo.svg" alt="CS2" width={110} height={110} />
      </div>

      {/* === 360 no scope text (center-left) === */}
      <div
        style={{
          position: 'absolute',
          top: '42%',
          left: '8%',
          zIndex: 25,
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: 'clamp(1rem, 2.5vw, 1.8rem)',
          fontWeight: 900,
          color: '#00ffff',
          textShadow: '2px 2px 0 #000, 0 0 20px #00ffff',
          transform: 'rotate(-8deg)',
        }}
        className="neon-text swing"
      >
        360° 🌀 NO SCOPE
      </div>

      {/* === Sunglasses emoji (bottom center) === */}
      <div
        style={{
          position: 'absolute',
          bottom: '14%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 28,
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          filter: 'grayscale(100%) brightness(0.4)',
        }}
      >
        😎
      </div>

      {/* === Rifle/weapon scope text === */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '5%',
          transform: 'translateY(-50%)',
          zIndex: 25,
          fontFamily: 'monospace',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          color: '#888',
          textShadow: '1px 1px 0 #000',
          letterSpacing: '-0.05em',
        }}
      >
        🔫
      </div>

      {/* === Speaker/mic person indicator === */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          right: '12%',
          zIndex: 22,
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: 'clamp(0.8rem, 2vw, 1.3rem)',
          color: '#fff',
          textShadow: '1px 1px 0 #000',
          textAlign: 'center',
          transform: 'rotate(3deg)',
        }}
        className="swing"
      >
        <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', animation: 'heartbeat 1.3s ease-in-out infinite' }}>🎤</div>
        <div style={{ color: '#ffff00', fontWeight: 900 }}>PRO GAMER</div>
      </div>

      {/* === Interactive emoji toggle (crying → smiling) === */}
      <EmojiToggle />

      {/* === Floating stars === */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            top: `${10 + i * 15}%`,
            left: `${5 + i * 12}%`,
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            zIndex: 15,
            animation: `float-up ${2 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        >
          ⭐
        </div>
      ))}

      {/* === Scattered fire emojis === */}
      {[...Array(4)].map((_, i) => (
        <div
          key={`fire-${i}`}
          style={{
            position: 'absolute',
            top: `${15 + i * 20}%`,
            right: `${3 + i * 8}%`,
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            zIndex: 12,
            animation: `pulse-glow 1.5s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            filter: 'drop-shadow(0 0 8px #ff4400)',
          }}
        >
          🔥
        </div>
      ))}

      {/* === Explosion symbols === */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`bomb-${i}`}
          style={{
            position: 'absolute',
            bottom: `${30 + i * 15}%`,
            left: `${12 + i * 20}%`,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            zIndex: 11,
            animation: `wobble 1s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        >
          💥
        </div>
      ))}

      {/* === Gaming/victory symbols === */}
      {[...Array(2)].map((_, i) => (
        <div
          key={`victory-${i}`}
          style={{
            position: 'absolute',
            top: `${60 + i * 15}%`,
            right: `${15 + i * 10}%`,
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            zIndex: 13,
            animation: `flip 2s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        >
          🏆
        </div>
      ))}

      {/* === Train emoji sliding across the bottom === */}
      <div
        style={{
          position: 'absolute',
          bottom: '22%',
          left: 0,
          zIndex: 27,
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          pointerEvents: 'none',
        }}
        className="train-ride"
      >
        🚂
      </div>

      {/* === Neon border frame === */}
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          border: '6px solid #00ff00',
          boxShadow: 'inset 0 0 30px rgba(0,255,0,0.3), 0 0 30px rgba(0,255,0,0.3)',
          pointerEvents: 'none',
          zIndex: 50,
        }}
        className="pulse-glow"
      />

      {/* === Corner triangles === */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 35, color: '#ff00ff', fontSize: '1.5rem' }}>▲</div>
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 35, color: '#ff00ff', fontSize: '1.5rem' }}>▲</div>
      <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 35, color: '#ff00ff', fontSize: '1.5rem' }}>▼</div>
      <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 35, color: '#ff00ff', fontSize: '1.5rem' }}>▼</div>

    </div>
  );
}
