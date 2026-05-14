import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Clock, Layers } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useGameScore } from '../../hooks/useGameScore';
import styles from './MemoryGame.module.css';

const EMOJI_SETS: Record<string, string[]> = {
  easy:   ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼'],
  medium: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮'],
  hard:   ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔'],
};

type Card = { id: number; emoji: string; matched: boolean };

function makeCards(difficulty: string): Card[] {
  const emojis = EMOJI_SETS[difficulty];
  return [...emojis, ...emojis]
    .sort(() => Math.random() - 0.5)
    .map((emoji, id) => ({ id, emoji, matched: false }));
}

export function MemoryGame() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [cards, setCards] = useState<Card[]>(() => makeCards('easy'));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [locked, setLocked] = useState(false);
  const { score, setScore, best, reset, save } = useGameScore('memory');

  useEffect(() => {
    if (!started || won) return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [started, won]);

  const handleFlip = useCallback((id: number) => {
    if (locked || flipped.includes(id) || cards[id].matched || won) return;
    if (!started) setStarted(true);

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [a, b] = newFlipped;
      if (cards[a].emoji === cards[b].emoji) {
        const newCards = cards.map((c) => c.id === a || c.id === b ? { ...c, matched: true } : c);
        setCards(newCards);
        setFlipped([]);
        setLocked(false);
        if (newCards.every((c) => c.matched)) {
          setWon(true);
          const pts = Math.max(100, 1000 - moves * 10 - time * 2);
          setScore(pts);
          save(pts);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  }, [locked, flipped, cards, won, started, moves, time, setScore, save]);

  const restart = (diff = difficulty) => {
    setCards(makeCards(diff));
    setFlipped([]);
    setMoves(0);
    setTime(0);
    setStarted(false);
    setWon(false);
    setLocked(false);
    reset();
  };

  const cols = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className={styles.wrapper}>
      {/* Difficulty */}
      <div className={styles.diffRow}>
        {(['easy', 'medium', 'hard'] as const).map((d) => (
          <button
            key={d}
            className={`${styles.diffBtn} ${difficulty === d ? styles.diffActive : ''}`}
            onClick={() => { setDifficulty(d); restart(d); }}
          >
            {d === 'easy' ? '4×4' : d === 'medium' ? '6×4' : '8×4'}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <Layers size={14} /> <span>Movimientos:</span>
          <strong style={{ color: 'var(--game-memory)' }}>{moves}</strong>
        </div>
        <div className={styles.stat}>
          <Clock size={14} /> <span>Tiempo:</span>
          <strong style={{ color: 'var(--neon-cyan)' }}>{fmt(time)}</strong>
        </div>
        <div className={styles.stat}>
          <span>Récord:</span>
          <strong style={{ color: 'var(--neon-amber)' }}>{best}</strong>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.grid} style={{ '--cols': cols } as React.CSSProperties}>
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || card.matched;
          return (
            <motion.button
              key={card.id}
              className={`${styles.card} ${card.matched ? styles.matched : ''}`}
              onClick={() => handleFlip(card.id)}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className={styles.cardInner}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className={styles.cardFront}>
                  <span className={styles.cardPattern}>◆</span>
                </div>
                <div className={styles.cardBack}>
                  <span className={styles.cardEmoji}>{card.emoji}</span>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      {/* Win */}
      <AnimatePresence>
        {won && (
          <motion.div
            className={styles.winBanner}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <span className={styles.winEmoji}>🎉</span>
            <div>
              <p className={styles.winTitle}>¡Lo lograste!</p>
              <p className={styles.winMeta}>{moves} movimientos · {fmt(time)}</p>
            </div>
            <strong style={{ color: 'var(--game-memory)', fontSize: 'var(--text-xl)' }}>{score} pts</strong>
          </motion.div>
        )}
      </AnimatePresence>

      <Button variant="secondary" onClick={() => restart()}>
        <RotateCcw size={14} /> Nueva partida
      </Button>
    </div>
  );
}
