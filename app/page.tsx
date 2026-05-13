'use client';

import { useEffect, useState } from 'react';

const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
  '😇', '🙂', '🙃', '😌', '😍', '🥰', '😘', '😗', '😚', '😙',
  '🥲', '😋', '😛', '😜', '🤪', '😝', '😑', '😐', '😔', '😒',
  '😲', '☹️', '🙁', '😮', '😯', '😨', '😰', '😢', '😭', '😱',
  '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠',
  '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻',
  '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀',
  '😿', '😾', '🙈', '🙉', '🙊', '💋', '💌', '💍', '💎', '💔',
  '💕', '💖', '💗', '💘', '💝', '💞', '💓', '💳', '💲', '💱',
  '💹', '🔱', '⚡', '☄️', '🌟', '✨', '⭐', '🌠', '💫', '⚪',
];

export default function Home() {
  const [emoji, setEmoji] = useState<string>('');

  useEffect(() => {
    setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-9xl">{emoji}</div>
    </div>
  );
}
