'use client';

import { useState } from 'react';

export default function RandomPicture() {
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1000));
  const [imgError, setImgError] = useState(false);

  function generateNewPicture() {
    setSeed(Math.floor(Math.random() * 1000));
    setImgError(false);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="border-4 border-gray-300 rounded-lg overflow-hidden shadow-lg">
        {imgError ? (
          <div
            className="w-[400px] h-[300px] flex items-center justify-center bg-gray-100 text-gray-500 text-sm"
            data-testid="random-picture-error"
          >
            Could not load image
          </div>
        ) : (
          /* picsum.photos serves a deterministic image per seed; changing seed swaps the image */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://picsum.photos/seed/${seed}/400/300`}
            alt="Random picture"
            width={400}
            height={300}
            onError={() => setImgError(true)}
          />
        )}
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
