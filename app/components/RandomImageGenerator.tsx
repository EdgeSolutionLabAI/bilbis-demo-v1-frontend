'use client';

import { useState } from 'react';

export default function RandomImageGenerator() {
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1000));
  const [imgError, setImgError] = useState(false);

  function generateNewImage() {
    setSeed(Math.floor(Math.random() * 1000));
    setImgError(false);
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10%',
        left: '3%',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <div
        style={{
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: 'clamp(0.7rem, 1.5vw, 1rem)',
          fontWeight: 900,
          color: '#ff00ff',
          textShadow: '1px 1px 0 #000, 0 0 10px #ff00ff',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        🖼️ RANDOM IMAGE 🖼️
      </div>
      <div style={{ border: '3px solid #ff00ff', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 0 15px #ff00ff' }}>
        {imgError ? (
          <div
            style={{
              width: 160,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1a001a',
              color: '#ff00ff',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
            }}
            data-testid="random-image-error"
          >
            Could not load image
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://picsum.photos/seed/${seed}/160/120`}
            alt="Random image"
            width={160}
            height={120}
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <button
        onClick={generateNewImage}
        style={{
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: 'clamp(0.65rem, 1.2vw, 0.85rem)',
          fontWeight: 900,
          color: '#fff',
          background: '#9900cc',
          border: '2px solid #ff00ff',
          borderRadius: '4px',
          padding: '4px 12px',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          boxShadow: '0 0 10px #ff00ff',
        }}
      >
        🎲 GENERATE
      </button>
    </div>
  );
}
