import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Lightbulb, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useGameScore } from '../../hooks/useGameScore';
import styles from './SudokuGame.module.css';

// Minimal seeded puzzles (easy, medium, hard)
const PUZZLES: Record<string, number[][]> = {
  easy: [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9],
  ],
  medium: [
    [0,2,0,0,0,0,0,0,0],
    [0,0,0,6,0,0,0,0,3],
    [0,7,4,0,8,0,0,0,0],
    [0,0,0,0,0,3,0,0,2],
    [0,8,0,0,4,0,0,1,0],
    [6,0,0,5,0,0,0,0,0],
    [0,0,0,0,1,0,7,8,0],
    [5,0,0,0,0,9,0,0,0],
    [0,0,0,0,0,0,0,4,0],
  ],
  hard: [
    [8,0,0,0,0,0,0,0,0],
    [0,0,3,6,0,0,0,0,0],
    [0,7,0,0,9,0,2,0,0],
    [0,5,0,0,0,7,0,0,0],
    [0,0,0,0,4,5,7,0,0],
    [0,0,0,1,0,0,0,3,0],
    [0,0,1,0,0,0,0,6,8],
    [0,0,8,5,0,0,0,1,0],
    [0,9,0,0,0,0,4,0,0],
  ],
};

const SOLUTIONS: Record<string, number[][]> = {
  easy: [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9],
  ],
  medium: [
    [1,2,6,4,3,7,9,5,8],
    [8,9,5,6,2,1,4,7,3],
    [3,7,4,9,8,5,1,2,6],
    [4,5,7,1,9,3,8,6,2],
    [9,8,3,2,4,6,5,1,7],
    [6,1,2,5,7,8,3,9,4],
    [2,6,9,3,1,4,7,8,5],
    [5,4,8,7,6,9,2,3,1],
    [7,3,1,8,5,2,6,4,9],
  ],
  hard: [
    [8,1,2,7,5,3,6,4,9],
    [9,4,3,6,8,2,1,7,5],
    [6,7,5,4,9,1,2,8,3],
    [1,5,4,2,3,7,8,9,6],
    [3,6,9,8,4,5,7,2,1],
    [2,8,7,1,6,9,5,3,4],
    [5,2,1,9,7,4,3,6,8],
    [4,3,8,5,2,6,9,1,7],
    [7,9,6,3,1,8,4,5,2],
  ],
};

export function SudokuGame() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const puzzle = PUZZLES[difficulty];
  const solution = SOLUTIONS[difficulty];

  const [grid, setGrid] = useState<number[][]>(() => puzzle.map((r) => [...r]));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [won, setWon] = useState(false);
  const { score, setScore, save } = useGameScore('sudoku');

  const handleSelect = (r: number, c: number) => {
    if (puzzle[r][c] !== 0) return;
    setSelected([r, c]);
  };

  const handleInput = useCallback((val: number) => {
    if (!selected || won) return;
    const [r, c] = selected;
    if (puzzle[r][c] !== 0) return;

    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = val;
    setGrid(newGrid);

    const key = `${r}-${c}`;
    if (val !== 0 && val !== solution[r][c]) {
      setErrors((e) => new Set([...e, key]));
    } else {
      setErrors((e) => { const s = new Set(e); s.delete(key); return s; });
    }

    const complete = newGrid.every((row, ri) => row.every((cell, ci) => cell === solution[ri][ci]));
    if (complete) {
      setWon(true);
      const pts = difficulty === 'easy' ? 100 : difficulty === 'medium' ? 200 : 350;
      setScore(pts);
      save(pts);
    }
  }, [selected, won, puzzle, grid, solution, difficulty, setScore, save]);

  const hint = () => {
    const empties: [number, number][] = [];
    grid.forEach((row, r) => row.forEach((cell, c) => { if (cell === 0 && puzzle[r][c] === 0) empties.push([r, c]); }));
    if (empties.length === 0) return;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = solution[r][c];
    setGrid(newGrid);
    setErrors((e) => { const s = new Set(e); s.delete(`${r}-${c}`); return s; });
  };

  const restart = (diff = difficulty) => {
    setGrid(PUZZLES[diff].map((r) => [...r]));
    setSelected(null);
    setErrors(new Set());
    setWon(false);
  };

  const isFixed = (r: number, c: number) => puzzle[r][c] !== 0;
  const isSelected = (r: number, c: number) => selected?.[0] === r && selected?.[1] === c;
  const isSameNum = (r: number, c: number) => {
    if (!selected) return false;
    const selVal = grid[selected[0]][selected[1]];
    return selVal !== 0 && grid[r][c] === selVal && !(r === selected[0] && c === selected[1]);
  };
  const isRelated = (r: number, c: number) => {
    if (!selected) return false;
    const [sr, sc] = selected;
    return r === sr || c === sc || (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3));
  };

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

      {won && (
        <motion.div className={styles.wonBanner} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <CheckCircle size={20} /> ¡Resuelto! {score} puntos
        </motion.div>
      )}

      {/* Board */}
      <div className={styles.board}>
        {grid.map((row, r) =>
          row.map((val, c) => {
            const key = `${r}-${c}`;
            const hasError = errors.has(key);
            const boxRow = Math.floor(r / 3);
            const boxCol = Math.floor(c / 3);
            const boxDark = (boxRow + boxCol) % 2 === 0;
            return (
              <motion.button
                key={key}
                className={`${styles.cell}
                  ${isFixed(r, c) ? styles.fixed : ''}
                  ${isSelected(r, c) ? styles.selected : ''}
                  ${isRelated(r, c) && !isSelected(r, c) ? styles.related : ''}
                  ${isSameNum(r, c) ? styles.sameNum : ''}
                  ${hasError ? styles.error : ''}
                  ${boxDark ? styles.boxDark : ''}
                  ${c % 3 === 2 && c !== 8 ? styles.boxRight : ''}
                  ${r % 3 === 2 && r !== 8 ? styles.boxBottom : ''}
                `}
                onClick={() => handleSelect(r, c)}
                whileTap={!isFixed(r, c) ? { scale: 0.92 } : {}}
              >
                {val !== 0 && (
                  <motion.span
                    initial={!isFixed(r, c) ? { scale: 0 } : {}}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {val}
                  </motion.span>
                )}
              </motion.button>
            );
          })
        )}
      </div>

      {/* Number pad */}
      <div className={styles.numPad}>
        {[1,2,3,4,5,6,7,8,9].map((n) => (
          <button key={n} className={styles.numBtn} onClick={() => handleInput(n)}>{n}</button>
        ))}
        <button className={`${styles.numBtn} ${styles.numClear}`} onClick={() => handleInput(0)}>✕</button>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" size="sm" onClick={hint}>
          <Lightbulb size={14} /> Pista
        </Button>
        <Button variant="secondary" size="sm" onClick={() => restart()}>
          <RotateCcw size={14} /> Reiniciar
        </Button>
      </div>
    </div>
  );
}
