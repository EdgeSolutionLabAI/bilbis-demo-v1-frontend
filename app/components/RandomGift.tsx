'use client';

import { useEffect, useState } from 'react';

const GIFT_EMOJIS = ['🎁', '🎀', '🎊', '🎉', '🎈', '💝', '🎂'];

export default function RandomGift() {
  const [randomGift, setRandomGift] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const gift = GIFT_EMOJIS[Math.floor(Math.random() * GIFT_EMOJIS.length)];
      if (!gift) throw new Error('No emoji available');
      setRandomGift(gift);
    } catch {
      setError(true);
    }
  }, []);

  if (error) {
    return (
      <div className="text-sm text-gray-400" data-testid="random-gift-error">
        —
      </div>
    );
  }

  if (!randomGift) {
    return null;
  }

  return (
    <div className="text-6xl" data-testid="random-gift">
      {randomGift}
    </div>
  );
}
