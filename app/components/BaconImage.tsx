'use client';

import { useEffect, useState } from 'react';

interface RandomGifImageProps {
  width?: number;
  height?: number;
}

export default function BaconImage({
  width = 300,
  height = 300,
}: RandomGifImageProps) {
  const [gifSrc, setGifSrc] = useState<string>('');

  useEffect(() => {
    const gif =
      // Random gif from public domain endpoint; avoids backend dependency.
      `https://media.giphy.com/media/${randomGifId()}/giphy.gif`;

    setGifSrc(gif);
  }, []);

  if (!gifSrc) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={gifSrc} alt="Random GIF" width={width} height={height} />
  );
}

function randomGifId() {
  const ids = [
    '3o6Zt481isNVuQI1J6',
    'l0MYt5jPR6QX5pnqM',
    'xT9IgzoKnwFNmISRqI',
    '26BRv0ThflsHCqDr2',
    '3o7aD2saalBwwftBIY',
  ];

  return ids[Math.floor(Math.random() * ids.length)] ?? ids[0];
}
