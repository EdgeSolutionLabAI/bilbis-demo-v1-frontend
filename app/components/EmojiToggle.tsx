'use client';

import { useState } from 'react';

export default function EmojiToggle() {
  const [isCrying, setIsCrying] = useState(true);

  return (
    <div
      onClick={() => setIsCrying(!isCrying)}
      style={{
        position: 'absolute',
        bottom: '10%',
        right: '20%',
        fontSize: 'clamp(4rem, 10vw, 7rem)',
        cursor: 'pointer',
        zIndex: 28,
        transition: 'transform 0.2s ease-in-out',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
      }}
    >
      {isCrying ? '😢' : '😊'}
    </div>
  );
}
