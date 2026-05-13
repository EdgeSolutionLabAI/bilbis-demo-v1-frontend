'use client';

import { useEffect, useState } from 'react';

const GIFT_EMOJIS = ['🎁', '🎀', '🎊', '🎉', '🎈', '💝', '🎂'];

export default function RandomGift() {
  const [randomGift, setRandomGift] = useState<string>('');

  useEffect(() => {
    const gift = GIFT_EMOJIS[Math.floor(Math.random() * GIFT_EMOJIS.length)];
    setRandomGift(gift);
  }, []);

  if (!randomGift) {
    return null;
  }

  return (
    <div className="text-6xl">
      {randomGift}
    </div>
  );
}
