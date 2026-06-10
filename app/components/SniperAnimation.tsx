'use client';

import { useEffect, useState } from 'react';

// Cycle: idle → zooming → scoped → shooting → recoil → idle
type Phase = 'idle' | 'zooming' | 'scoped' | 'shooting' | 'recoil';

const PHASE_DURATIONS: Record<Phase, number> = {
  idle:     1200,
  zooming:  400,
  scoped:   900,
  shooting: 180,
  recoil:   350,
};

const PHASE_ORDER: Phase[] = ['idle', 'zooming', 'scoped', 'shooting', 'recoil'];

export default function SniperAnimation() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [killCount, setKillCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function runCycle() {
      for (const p of PHASE_ORDER) {
        if (cancelled) return;
        setPhase(p);
        if (p === 'shooting') setKillCount((n) => n + 1);
        await new Promise<void>((res) => setTimeout(res, PHASE_DURATIONS[p]));
      }
      if (!cancelled) runCycle();
    }

    runCycle();
    return () => { cancelled = true; };
  }, []);

  const isScoped   = phase === 'scoped' || phase === 'shooting';
  const scopeScale = phase === 'idle' ? 1 : phase === 'zooming' ? 1.4 : isScoped ? 1.6 : 1.1;
  const flash      = phase === 'shooting';
  const recoiling  = phase === 'recoil';

  return (
    <div
      aria-label="CS2 sniper animation"
      style={{
        position: 'absolute',
        bottom: '38%',
        left: '3%',
        zIndex: 28,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      {/* ── Scope lens overlay ── */}
      <div
        style={{
          position: 'relative',
          width: 90,
          height: 90,
          transform: `scale(${scopeScale})`,
          transition: 'transform 0.25s ease-out',
        }}
      >
        {/* Outer scope ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `3px solid ${isScoped ? '#00ff00' : '#888'}`,
            boxShadow: isScoped
              ? '0 0 14px #00ff00, inset 0 0 14px rgba(0,255,0,0.15)'
              : 'none',
            background: 'rgba(0,0,0,0.55)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        />

        {/* Crosshair — horizontal */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 6,
            right: 6,
            height: 1,
            marginTop: -0.5,
            background: flash ? '#ffffff' : '#00ff00',
            opacity: isScoped ? 1 : 0.4,
            transition: 'opacity 0.2s, background 0.05s',
          }}
        />
        {/* Crosshair gap (center) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 10,
            height: 1,
            marginTop: -0.5,
            marginLeft: -5,
            background: 'transparent',
          }}
        />

        {/* Crosshair — vertical */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 6,
            bottom: 6,
            width: 1,
            marginLeft: -0.5,
            background: flash ? '#ffffff' : '#00ff00',
            opacity: isScoped ? 1 : 0.4,
            transition: 'opacity 0.2s, background 0.05s',
          }}
        />

        {/* Center dot */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: flash ? '#fff' : '#ff0000',
            boxShadow: flash ? '0 0 10px #fff' : '0 0 6px #ff0000',
            transform: 'translate(-50%, -50%)',
            transition: 'background 0.05s, box-shadow 0.05s',
          }}
        />

        {/* Muzzle flash */}
        {flash && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #fffde7 0%, #ffcc00 40%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
              opacity: 0.9,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* ── Sniper rifle body ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          transform: recoiling ? 'translateX(-6px) rotate(-3deg)' : 'translateX(0) rotate(0deg)',
          transition: 'transform 0.12s ease-out',
        }}
      >
        {/* Stock */}
        <div style={{ width: 14, height: 8, background: '#8B4513', borderRadius: '3px 0 0 3px', flexShrink: 0 }} />
        {/* Grip */}
        <div style={{ width: 8, height: 14, background: '#5C3317', borderRadius: 2, marginTop: 3, flexShrink: 0 }} />
        {/* Body */}
        <div style={{ width: 32, height: 7, background: '#444', borderRadius: 2, flexShrink: 0 }} />
        {/* Scope mount on top */}
        <div
          style={{
            position: 'relative',
            width: 18,
            height: 7,
            background: '#333',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 12,
              height: 8,
              background: '#222',
              borderRadius: '2px 2px 0 0',
            }}
          />
        </div>
        {/* Barrel */}
        <div
          style={{
            width: 34,
            height: 4,
            background: '#555',
            borderRadius: '0 2px 2px 0',
            flexShrink: 0,
            boxShadow: flash ? '8px 0 12px #ffcc00' : 'none',
            transition: 'box-shadow 0.05s',
          }}
        />
      </div>

      {/* ── Kill counter label ── */}
      <div
        style={{
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: 'clamp(0.65rem, 1.5vw, 0.85rem)',
          fontWeight: 900,
          color: '#00ff00',
          textShadow: '1px 1px 0 #000, 0 0 8px #00ff00',
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
        }}
      >
        ☠ KILLS: {killCount}
      </div>

      {/* ── Phase label ── */}
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: 'clamp(0.55rem, 1.2vw, 0.75rem)',
          color: flash ? '#ffcc00' : '#aaa',
          textShadow: flash ? '0 0 8px #ffcc00' : 'none',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          transition: 'color 0.1s',
        }}
      >
        {phase === 'idle'     && '[ IDLE ]'}
        {phase === 'zooming'  && '[ ZOOMING IN ]'}
        {phase === 'scoped'   && '[ SCOPED ]'}
        {phase === 'shooting' && '💥 FIRE! 💥'}
        {phase === 'recoil'   && '[ RECOIL ]'}
      </div>
    </div>
  );
}
