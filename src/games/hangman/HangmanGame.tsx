import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Lightbulb } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useGameScore } from '../../hooks/useGameScore';
import styles from './HangmanGame.module.css';

const WORDS: Record<string, string[]> = {
  easy: ['gato','perro','casa','luna','arbol','flor','libro','mesa','silla','agua'],
  medium: ['computadora','programacion','javascript','typescript','interfaz','teclado','pantalla','monitor'],
  hard: ['arquitectura','refactorizacion','encapsulamiento','polimorfismo','infraestructura','compilador'],
};
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const MAX_ERRORS = 6;

function pickWord(diff: string) {
  const list = WORDS[diff];
  return list[Math.floor(Math.random() * list.length)];
}

export function HangmanGame() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [word, setWord] = useState(() => pickWord('easy'));
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [hint, setHint] = useState(false);
  const { score, increment, reset, save } = useGameScore('hangman');

  const errors = [...guessed].filter((l) => !word.includes(l)).length;
  const revealed = word.split('').every((l) => guessed.has(l));

  useEffect(() => {
    if (revealed && !gameOver) {
      setWon(true);
      setGameOver(true);
      const pts = Math.max(10, (MAX_ERRORS - errors) * 20 + word.length * 5);
      increment(pts);
      save(score + pts);
    } else if (errors >= MAX_ERRORS && !gameOver) {
      setGameOver(true);
      setWon(false);
    }
  }, [guessed, revealed, errors, gameOver, increment, save, score, word.length]);

  const guess = useCallback((letter: string) => {
    if (guessed.has(letter) || gameOver) return;
    setGuessed((prev) => new Set([...prev, letter]));
  }, [guessed, gameOver]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (/^[a-z]$/i.test(e.key)) guess(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [guess]);

  const restart = (diff = difficulty) => {
    setWord(pickWord(diff));
    setGuessed(new Set());
    setGameOver(false);
    setWon(false);
    setHint(false);
    reset();
  };

  const hintLetter = word.split('').find((l) => !guessed.has(l));

  return (
    <div className={styles.wrapper}>
      {/* Difficulty */}
      <div className={styles.diffRow}>
        {(['easy','medium','hard'] as const).map((d) => (
          <button key={d} className={`${styles.diffBtn} ${difficulty === d ? styles.diffActive : ''}`}
            onClick={() => { setDifficulty(d); restart(d); }}>
            {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Medio' : 'Difícil'}
          </button>
        ))}
      </div>

      {/* Gallows */}
      <div className={styles.gallowsWrapper}>
        <svg viewBox="0 0 200 220" className={styles.gallows}>
          {/* Structure */}
          <line x1="20" y1="210" x2="180" y2="210" stroke="var(--border-default)" strokeWidth="3" strokeLinecap="round"/>
          <line x1="60" y1="210" x2="60" y2="20" stroke="var(--border-default)" strokeWidth="3" strokeLinecap="round"/>
          <line x1="60" y1="20" x2="130" y2="20" stroke="var(--border-default)" strokeWidth="3" strokeLinecap="round"/>
          <line x1="130" y1="20" x2="130" y2="45" stroke="var(--border-default)" strokeWidth="3" strokeLinecap="round"/>
          {/* Head */}
          {errors >= 1 && <circle cx="130" cy="60" r="16" stroke="var(--game-hangman)" strokeWidth="2.5" fill="none"/>}
          {/* Body */}
          {errors >= 2 && <line x1="130" y1="76" x2="130" y2="130" stroke="var(--game-hangman)" strokeWidth="2.5" strokeLinecap="round"/>}
          {/* Left arm */}
          {errors >= 3 && <line x1="130" y1="88" x2="105" y2="110" stroke="var(--game-hangman)" strokeWidth="2.5" strokeLinecap="round"/>}
          {/* Right arm */}
          {errors >= 4 && <line x1="130" y1="88" x2="155" y2="110" stroke="var(--game-hangman)" strokeWidth="2.5" strokeLinecap="round"/>}
          {/* Left leg */}
          {errors >= 5 && <line x1="130" y1="130" x2="105" y2="158" stroke="var(--game-hangman)" strokeWidth="2.5" strokeLinecap="round"/>}
          {/* Right leg */}
          {errors >= 6 && <line x1="130" y1="130" x2="155" y2="158" stroke="var(--game-hangman)" strokeWidth="2.5" strokeLinecap="round"/>}
        </svg>
        {/* Lives */}
        <div className={styles.lives}>
          {Array.from({ length: MAX_ERRORS }).map((_, i) => (
            <div key={i} className={`${styles.life} ${i < errors ? styles.lifeLost : ''}`} />
          ))}
        </div>
      </div>

      {/* Word display */}
      <div className={styles.wordRow}>
        {word.split('').map((letter, i) => (
          <div key={i} className={styles.letterBox}>
            <AnimatePresence>
              {guessed.has(letter) && (
                <motion.span
                  className={styles.letterRevealed}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {letter}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Wrong letters */}
      <div className={styles.wrongRow}>
        {[...guessed].filter((l) => !word.includes(l)).map((l) => (
          <span key={l} className={styles.wrongLetter}>{l}</span>
        ))}
      </div>

      {/* Keyboard */}
      <div className={styles.keyboard}>
        {ALPHABET.map((letter) => {
          const isGuessed = guessed.has(letter);
          const isWrong = isGuessed && !word.includes(letter);
          const isCorrect = isGuessed && word.includes(letter);
          return (
            <motion.button
              key={letter}
              className={`${styles.key} ${isWrong ? styles.keyWrong : ''} ${isCorrect ? styles.keyCorrect : ''}`}
              onClick={() => guess(letter)}
              disabled={isGuessed || gameOver}
              whileTap={{ scale: 0.85 }}
            >
              {letter}
            </motion.button>
          );
        })}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {!gameOver && !hint && hintLetter && (
          <Button variant="secondary" size="sm" onClick={() => { setHint(true); guess(hintLetter); }}>
            <Lightbulb size={14} /> Pista (-5 pts)
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={() => restart()}>
          <RotateCcw size={14} /> Nueva palabra
        </Button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            className={`${styles.result} ${won ? styles.resultWon : styles.resultLost}`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className={styles.resultEmoji}>{won ? '🎉' : '💀'}</span>
            <div>
              <p className={styles.resultTitle}>{won ? '¡Correcto!' : 'Game Over'}</p>
              {!won && <p className={styles.resultWord}>La palabra era: <strong>{word}</strong></p>}
            </div>
            <Button size="sm" onClick={() => restart()}>Jugar de nuevo</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
