import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useGameScore } from '../../hooks/useGameScore';
import styles from './WordSearchGame.module.css';

const WORD_SETS: Record<string, string[]> = {
  easy:   ['GATO','PERRO','PATO','LEON','OSO','PUMA'],
  medium: ['JAVASCRIPT','PYTHON','REACT','NODE','HTML','CSS','GIT'],
  hard:   ['ARQUITECTURA','COMPONENTE','INTERFAZ','TYPESCRIPT','ALGORITMO','PATRON'],
};

const SIZE = 12;
const DIRS = [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]];

function buildGrid(words: string[]): { grid: string[][]; placed: { word: string; cells: [number,number][] }[] } {
  const grid: string[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(''));
  const placed: { word: string; cells: [number,number][] }[] = [];

  for (const word of words) {
    let ok = false;
    for (let attempts = 0; attempts < 200 && !ok; attempts++) {
      const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)];
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      const cells: [number,number][] = [];
      let valid = true;
      for (let i = 0; i < word.length; i++) {
        const nr = r + dr * i, nc = c + dc * i;
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) { valid = false; break; }
        if (grid[nr][nc] !== '' && grid[nr][nc] !== word[i]) { valid = false; break; }
        cells.push([nr, nc]);
      }
      if (valid) {
        cells.forEach(([nr, nc], i) => { grid[nr][nc] = word[i]; });
        placed.push({ word, cells });
        ok = true;
      }
    }
  }
  // Fill blanks
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (!grid[r][c]) grid[r][c] = alpha[Math.floor(Math.random() * alpha.length)];
  }
  return { grid, placed };
}

export function WordSearchGame() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const { grid, placed } = useMemo(() => buildGrid(WORD_SETS[difficulty]), [difficulty]);

  const [selecting, setSelecting] = useState<[number,number][]>([]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [mouseDown, setMouseDown] = useState(false);
  const { score, setScore, save } = useGameScore('wordsearch');

  const cellKey = (r: number, c: number) => `${r}-${c}`;

  const startSelect = useCallback((r: number, c: number) => {
    setMouseDown(true);
    setSelecting([[r, c]]);
  }, []);

  const extendSelect = useCallback((r: number, c: number) => {
    if (!mouseDown) return;
    setSelecting((prev) => {
      if (prev.length === 0) return prev;
      const [sr, sc] = prev[0];
      const dr = r - sr, dc = c - sc;
      const len = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
      const normDr = dr === 0 ? 0 : dr / Math.abs(dr);
      const normDc = dc === 0 ? 0 : dc / Math.abs(dc);
      if (Math.abs(dr) !== Math.abs(dc) && dr !== 0 && dc !== 0) return prev;
      const cells: [number,number][] = [];
      for (let i = 0; i < len; i++) cells.push([sr + normDr * i, sc + normDc * i]);
      return cells;
    });
  }, [mouseDown]);

  const endSelect = useCallback(() => {
    setMouseDown(false);
    const word = selecting.map(([r, c]) => grid[r][c]).join('');
    const revWord = word.split('').reverse().join('');
    const match = placed.find((p) => p.word === word || p.word === revWord);
    if (match && !found.has(match.word)) {
      setFound((f) => new Set([...f, match.word]));
      setFoundCells((fc) => {
        const s = new Set(fc);
        match.cells.forEach(([r, c]) => s.add(cellKey(r, c)));
        return s;
      });
      const pts = match.word.length * 10;
      const newScore = score + pts;
      setScore(newScore);
      if (found.size + 1 === placed.length) save(newScore);
    }
    setSelecting([]);
  }, [selecting, grid, placed, found, score, setScore, save]);

  const selectingSet = useMemo(() => new Set(selecting.map(([r, c]) => cellKey(r, c))), [selecting]);

  const restart = (diff = difficulty) => {
    setFound(new Set());
    setFoundCells(new Set());
    setSelecting([]);
    setMouseDown(false);
    setScore(0);
    setDifficulty(diff);
  };

  const allFound = found.size === placed.length;

  return (
    <div className={styles.wrapper}>
      {/* Difficulty */}
      <div className={styles.diffRow}>
        {(['easy','medium','hard'] as const).map((d) => (
          <button key={d} className={`${styles.diffBtn} ${difficulty === d ? styles.diffActive : ''}`}
            onClick={() => restart(d)}>
            {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Medio' : 'Difícil'}
          </button>
        ))}
      </div>

      {allFound && (
        <motion.div className={styles.wonBanner} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <CheckCircle size={20} /> ¡Encontraste todas las palabras! {score} pts
        </motion.div>
      )}

      <div className={styles.layout}>
        {/* Grid */}
        <div
          className={styles.grid}
          onMouseLeave={endSelect}
          onMouseUp={endSelect}
          onTouchEnd={endSelect}
        >
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const key = cellKey(r, c);
              const isFound = foundCells.has(key);
              const isSelecting = selectingSet.has(key);
              return (
                <div
                  key={key}
                  className={`${styles.cell} ${isFound ? styles.cellFound : ''} ${isSelecting ? styles.cellSelecting : ''}`}
                  onMouseDown={() => startSelect(r, c)}
                  onMouseEnter={() => extendSelect(r, c)}
                  onTouchStart={() => startSelect(r, c)}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const el = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (el) {
                      const rAttr = el.getAttribute('data-r');
                      const cAttr = el.getAttribute('data-c');
                      if (rAttr && cAttr) extendSelect(+rAttr, +cAttr);
                    }
                  }}
                  data-r={r}
                  data-c={c}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>

        {/* Word list */}
        <div className={styles.wordList}>
          <p className={styles.wordListTitle}>Palabras</p>
          {placed.map(({ word }) => (
            <div key={word} className={`${styles.wordItem} ${found.has(word) ? styles.wordFound : ''}`}>
              {found.has(word) && <CheckCircle size={13} />}
              {word}
            </div>
          ))}
        </div>
      </div>

      <Button variant="secondary" onClick={() => restart()}>
        <RotateCcw size={14} /> Nueva sopa
      </Button>
    </div>
  );
}
