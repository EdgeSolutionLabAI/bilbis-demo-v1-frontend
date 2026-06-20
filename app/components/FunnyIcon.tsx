'use client';

import { useState } from 'react';

export default function FunnyIcon() {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        top: '3%',
        right: '20%',
        zIndex: 32,
        width: 100,
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className="funny-icon-spin"
    >
      {imgFailed ? (
        // Visible placeholder until the real image is uploaded to public/funny-icon-27.png
        <span style={{ fontSize: '4rem', lineHeight: 1 }}>🤣</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/funny-icon-27.png"
          alt="funny icon"
          width={100}
          height={100}
          style={{ display: 'block' }}
          onError={() => setImgFailed(true)}
        />
      )}
    </div>
  );
}
