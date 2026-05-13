'use client';

import { useState } from 'react';

export default function RandomPicture() {
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1000));

  function generateNewPicture() {
    setSeed(Math.floor(Math.random() * 1000));
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="border-4 border-gray-300 rounded-lg overflow-hidden shadow-lg">
        {/* picsum.photos serves a deterministic image per seed; changing seed swaps the image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${seed}/400/300`}
          alt="Random picture"
          width={400}
          height={300}
        />
      </div>
      <button
        onClick={generateNewPicture}
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 active:bg-blue-800 transition-colors"
      >
        Generate New Picture
      </button>
    </div>
  );
}
