'use client';

import { type CSSProperties, type ReactNode, useCallback, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

interface GameState {
  tableau: Card[][];   // 7 columns
  foundations: Card[][]; // 4 piles (one per suit)
  stock: Card[];
  waste: Card[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_VALUE: Record<Rank, number> = {
  A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13,
};

const RED_SUITS = new Set<Suit>(['♥', '♦']);

function isRed(card: Card) { return RED_SUITS.has(card.suit); }

// ─── Deck helpers ─────────────────────────────────────────────────────────────

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceUp: false });
    }
  }
  return deck;
}

// Fisher-Yates shuffle with a seed-like approach using index swaps
function shuffle(deck: Card[]): Card[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    // Use a pseudo-random index based on timestamp bits — not cryptographic, fine for a game
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function deal(): GameState {
  const deck = shuffle(buildDeck());
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);

  let idx = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[idx++], faceUp: row === col };
      tableau[col].push(card);
    }
  }

  const stock = deck.slice(idx).map((c) => ({ ...c, faceUp: false }));
  return { tableau, foundations: [[], [], [], []], stock, waste: [] };
}

// ─── Move validation ──────────────────────────────────────────────────────────

function canPlaceOnTableau(card: Card, targetCol: Card[]): boolean {
  if (targetCol.length === 0) return card.rank === 'K';
  const top = targetCol[targetCol.length - 1];
  if (!top.faceUp) return false;
  return isRed(card) !== isRed(top) && RANK_VALUE[card.rank] === RANK_VALUE[top.rank] - 1;
}

function canPlaceOnFoundation(card: Card, pile: Card[]): boolean {
  if (pile.length === 0) return card.rank === 'A';
  const top = pile[pile.length - 1];
  return card.suit === top.suit && RANK_VALUE[card.rank] === RANK_VALUE[top.rank] + 1;
}

function countScore(foundations: Card[][]): number {
  return foundations.reduce((sum, pile) => sum + pile.length, 0);
}

// ─── Selection state ──────────────────────────────────────────────────────────

type Selection =
  | { source: 'waste' }
  | { source: 'tableau'; col: number; fromIdx: number };

// ─── Component ────────────────────────────────────────────────────────────────

export default function Solitaire() {
  const [game, setGame] = useState<GameState>(deal);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [won, setWon] = useState(false);

  // Returns the cards being "held" from the current selection
  function getSelectedCards(g: GameState): Card[] {
    if (!selection) return [];
    if (selection.source === 'waste') {
      return g.waste.length ? [g.waste[g.waste.length - 1]] : [];
    }
    return g.tableau[selection.col].slice(selection.fromIdx);
  }

  const checkWin = useCallback((g: GameState) => {
    if (countScore(g.foundations) === 52) setWon(true);
  }, []);

  // ── Click stock ──────────────────────────────────────────────────────────────
  const handleStockClick = useCallback(() => {
    setSelection(null);
    setGame((g) => {
      if (g.stock.length === 0) {
        // Flip waste back to stock
        if (g.waste.length === 0) return g;
        return {
          ...g,
          stock: [...g.waste].reverse().map((c) => ({ ...c, faceUp: false })),
          waste: [],
        };
      }
      const [drawn, ...rest] = g.stock;
      return { ...g, stock: rest, waste: [...g.waste, { ...drawn, faceUp: true }] };
    });
  }, []);

  // ── Click waste top card ──────────────────────────────────────────────────────
  const handleWasteClick = useCallback(() => {
    setGame((g) => {
      if (g.waste.length === 0) return g;
      // If already selected, deselect
      if (selection?.source === 'waste') {
        setSelection(null);
        return g;
      }
      setSelection({ source: 'waste' });
      return g;
    });
  }, [selection]);

  // ── Click foundation ──────────────────────────────────────────────────────────
  const handleFoundationClick = useCallback((fIdx: number) => {
    if (!selection) return;
    const cards = getSelectedCards(game);
    if (cards.length !== 1) { setSelection(null); return; }
    const card = cards[0];

    if (!canPlaceOnFoundation(card, game.foundations[fIdx])) {
      setSelection(null);
      return;
    }

    setGame((g) => {
      const newFoundations = g.foundations.map((p, i) =>
        i === fIdx ? [...p, card] : p
      );
      let newWaste = g.waste;
      let newTableau = g.tableau;

      if (selection.source === 'waste') {
        newWaste = g.waste.slice(0, -1);
      } else {
        newTableau = g.tableau.map((col, i) => {
          if (i !== selection.col) return col;
          const next = col.slice(0, selection.fromIdx);
          if (next.length > 0) next[next.length - 1] = { ...next[next.length - 1], faceUp: true };
          return next;
        });
      }

      const next: GameState = { ...g, foundations: newFoundations, waste: newWaste, tableau: newTableau };
      checkWin(next);
      return next;
    });
    setSelection(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, game, checkWin]);

  // ── Click tableau column ──────────────────────────────────────────────────────
  const handleTableauClick = useCallback((col: number, cardIdx: number) => {
    const colCards = game.tableau[col];
    const clickedCard = colCards[cardIdx];

    // Flip face-down card if it's the last in the column
    if (!clickedCard.faceUp) {
      if (cardIdx !== colCards.length - 1) return;
      setGame((g) => ({
        ...g,
        tableau: g.tableau.map((c, i) =>
          i !== col ? c : c.map((card, j) => j === cardIdx ? { ...card, faceUp: true } : card)
        ),
      }));
      return;
    }

    // If nothing selected → select this stack
    if (!selection) {
      setSelection({ source: 'tableau', col, fromIdx: cardIdx });
      return;
    }

    const cards = getSelectedCards(game);
    if (cards.length === 0) { setSelection(null); return; }

    // Deselect if clicking the same card
    if (selection.source === 'tableau' && selection.col === col && selection.fromIdx === cardIdx) {
      setSelection(null);
      return;
    }

    // Attempt to move
    if (!canPlaceOnTableau(cards[0], colCards)) {
      // Re-select clicked card instead
      setSelection({ source: 'tableau', col, fromIdx: cardIdx });
      return;
    }

    setGame((g) => {
      const movedCards = cards;
      let newWaste = g.waste;
      const newTableau = g.tableau.map((c, i) => {
        if (i === col) return [...c, ...movedCards];
        if (selection!.source === 'tableau' && i === selection!.col) {
          const trimmed = c.slice(0, (selection as { source: 'tableau'; col: number; fromIdx: number }).fromIdx);
          if (trimmed.length > 0) trimmed[trimmed.length - 1] = { ...trimmed[trimmed.length - 1], faceUp: true };
          return trimmed;
        }
        return c;
      });
      if (selection!.source === 'waste') {
        newWaste = g.waste.slice(0, -1);
      }
      return { ...g, tableau: newTableau, waste: newWaste };
    });
    setSelection(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, game]);

  const restart = useCallback(() => {
    setGame(deal());
    setSelection(null);
    setWon(false);
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────

  const score = countScore(game.foundations);

  return (
    <div
      style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 45,
        background: 'rgba(0,0,0,0.88)',
        border: '3px solid #00ffff',
        boxShadow: '0 0 18px #00ffff, inset 0 0 12px rgba(0,255,255,0.12)',
        borderRadius: 8,
        padding: '10px 12px 12px',
        fontFamily: 'Impact, Arial Black, sans-serif',
        userSelect: 'none',
        minWidth: 420,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', color: '#00ffff', fontSize: '1.1rem', fontWeight: 900,
        letterSpacing: '0.08em', textShadow: '0 0 10px #00ffff', marginBottom: 6 }}>
        🃏 SOLITER 🃏
      </div>

      {/* Score + buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ color: '#ffff00', fontSize: '0.85rem', textShadow: '0 0 8px #ffff00' }}>
          SCORE: {score}/52
        </span>
        <button onClick={restart} style={btnStyle('#ff00ff')}>🔄 NEW GAME</button>
      </div>

      {/* Win banner */}
      {won && (
        <div style={{ textAlign: 'center', color: '#ffff00', fontSize: '1.2rem',
          textShadow: '0 0 20px #ffff00', marginBottom: 8, animation: 'pulse-glow 0.8s ease-in-out infinite' }}>
          🏆 YOU WIN! 🏆
        </div>
      )}

      {/* Top row: stock / waste / gap / foundations */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'flex-start' }}>
        {/* Stock */}
        <CardSlot
          onClick={handleStockClick}
          label={game.stock.length === 0 ? '↺' : `${game.stock.length}`}
          color="#00ff00"
          selected={false}
        >
          {game.stock.length > 0 && <CardBack />}
          {game.stock.length === 0 && (
            <div style={{ color: '#00ff00', fontSize: '1.4rem', textShadow: '0 0 10px #00ff00' }}>↺</div>
          )}
        </CardSlot>

        {/* Waste */}
        <CardSlot onClick={handleWasteClick} color="#ff8800" selected={selection?.source === 'waste'}>
          {game.waste.length > 0 && (
            <CardFace card={game.waste[game.waste.length - 1]} small />
          )}
        </CardSlot>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Foundations */}
        {game.foundations.map((pile, fIdx) => (
          <CardSlot
            key={fIdx}
            onClick={() => handleFoundationClick(fIdx)}
            label={SUITS[fIdx]}
            color={RED_SUITS.has(SUITS[fIdx]) ? '#ff4444' : '#aaaaaa'}
            selected={false}
          >
            {pile.length > 0 && <CardFace card={pile[pile.length - 1]} small />}
            {pile.length === 0 && (
              <div style={{ color: RED_SUITS.has(SUITS[fIdx]) ? '#ff444488' : '#aaaaaa88', fontSize: '1.2rem' }}>
                {SUITS[fIdx]}
              </div>
            )}
          </CardSlot>
        ))}
      </div>

      {/* Tableau */}
      <div style={{ display: 'flex', gap: 6 }}>
        {game.tableau.map((col, colIdx) => (
          <div
            key={colIdx}
            style={{ position: 'relative', width: CARD_W, minHeight: CARD_H + 8 }}
          >
            {/* Empty column target (click to place king) */}
            {col.length === 0 && (
              <div
                onClick={() => handleTableauClick(colIdx, 0)}
                style={{
                  width: CARD_W, height: CARD_H,
                  border: '1px dashed #ffffff44',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              />
            )}
            {col.map((card, cardIdx) => {
              const isSelected =
                selection?.source === 'tableau' &&
                selection.col === colIdx &&
                cardIdx >= selection.fromIdx;
              return (
                <div
                  key={cardIdx}
                  onClick={() => handleTableauClick(colIdx, cardIdx)}
                  style={{
                    position: cardIdx === 0 ? 'relative' : 'relative',
                    marginTop: cardIdx === 0 ? 0 : card.faceUp ? -CARD_H + FACE_OVERLAP : -CARD_H + BACK_OVERLAP,
                    cursor: card.faceUp ? 'pointer' : cardIdx === col.length - 1 ? 'pointer' : 'default',
                    outline: isSelected ? '2px solid #ffff00' : 'none',
                    outlineOffset: 1,
                    borderRadius: 4,
                    zIndex: cardIdx,
                  }}
                >
                  {card.faceUp ? <CardFace card={card} small /> : <CardBack small />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const CARD_W = 52;
const CARD_H = 72;
const FACE_OVERLAP = 54; // how many px are hidden when stacked face-up
const BACK_OVERLAP = 16; // how many px are hidden when stacked face-down

function CardBack({ small }: { small?: boolean }) {
  return (
    <div style={{
      width: small ? CARD_W : CARD_W + 8,
      height: small ? CARD_H : CARD_H + 10,
      background: 'repeating-linear-gradient(45deg, #003366, #003366 4px, #004499 4px, #004499 8px)',
      border: '1px solid #0066cc',
      borderRadius: 4,
      boxShadow: '1px 1px 4px rgba(0,0,0,0.6)',
    }} />
  );
}

function CardFace({ card, small }: { card: Card; small?: boolean }) {
  const red = isRed(card);
  const color = red ? '#ff4444' : '#ffffff';
  const w = small ? CARD_W : CARD_W + 8;
  const h = small ? CARD_H : CARD_H + 10;
  return (
    <div style={{
      width: w, height: h,
      background: 'rgba(20, 20, 40, 0.95)',
      border: `1px solid ${color}66`,
      borderRadius: 4,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '2px 3px',
      boxShadow: `0 0 4px ${color}44, 1px 1px 4px rgba(0,0,0,0.6)`,
      color,
      fontFamily: 'Impact, Arial Black, sans-serif',
    }}>
      <div style={{ fontSize: '0.7rem', lineHeight: 1 }}>{card.rank}<br />{card.suit}</div>
      <div style={{ fontSize: '0.65rem', transform: 'rotate(180deg)', lineHeight: 1 }}>{card.rank}<br />{card.suit}</div>
    </div>
  );
}

function CardSlot({
  children,
  onClick,
  label,
  color,
  selected,
}: {
  children?: ReactNode;
  onClick?: () => void;
  label?: string;
  color?: string;
  selected: boolean;
}) {
  const c = color ?? '#ffffff';
  return (
    <div
      onClick={onClick}
      style={{
        width: CARD_W, height: CARD_H,
        border: `2px solid ${selected ? '#ffff00' : c + '66'}`,
        boxShadow: selected ? '0 0 8px #ffff00' : undefined,
        borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        background: 'rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}
    >
      {children ?? (
        label && <span style={{ color: c + '88', fontSize: '0.85rem' }}>{label}</span>
      )}
    </div>
  );
}

function btnStyle(color: string): CSSProperties {
  return {
    background: 'transparent',
    border: `2px solid ${color}`,
    color,
    fontFamily: 'Impact, Arial Black, sans-serif',
    fontSize: '0.85rem',
    fontWeight: 900,
    letterSpacing: '0.08em',
    padding: '3px 12px',
    cursor: 'pointer',
    textShadow: `0 0 8px ${color}`,
    boxShadow: `0 0 10px ${color}44`,
    borderRadius: 4,
  };
}
