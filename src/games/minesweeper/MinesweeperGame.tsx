import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Flag, RotateCcw, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useGameScore } from '../../hooks/useGameScore';
import styles from './MinesweeperGame.module.css';

type CellState = { mine: boolean; revealed: boolean; flagged: boolean; adj: number };
type Difficulty = 'easy' | 'medium' | 'hard';

const CONFIGS: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  easy:   { rows: 8,  cols: 8,  mines: 10 },
  medium: { rows: 10, cols: 10, mines: 20 },
  hard:   { rows: 12, cols: 12, mines: 30 },
};

const NUM_COLORS = ['','#3b82f6','#10b981','#ef4444','#8b5cf6','#dc2626','#06b6d4','#000','#6b7280'];

function buildBoard(rows: number, cols: number, mines: number, safeIdx: number): CellState[][] {
  const cells = Array.from({ length: rows * cols }, (_) => ({
    mine: false, revealed: false, flagged: false, adj: 0,
  }));
  let placed = 0;
  while (placed < mines) {
    const idx = Math.floor(Math.random() * cells.length);
    if (!cells[idx].mine && idx !== safeIdx) { cells[idx].mine = true; placed++; }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!cells[r * cols + c].mine) {
        let adj = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && cells[nr * cols + nc].mine) adj++;
        }
        cells[r * cols + c].adj = adj;
      }
    }
  }
  return Array.from({ length: rows }, (_, r) => cells.slice(r * cols, (r + 1) * cols));
}

export function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const { rows, cols, mines } = CONFIGS[difficulty];
  const [board, setBoard] = useState<CellState[][] | null>(null);
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [flagCount, setFlagCount] = useState(0);
  const [time, setTime] = useState(0);
  const timerRef = { current: null as ReturnType<typeof setInterval> | null };
  const { score, setScore, best, save } = useGameScore('minesweeper');

  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
  };

  const reveal = useCallback((b: CellState[][], r: number, c: number) => {
    if (r < 0 || r >= b.length || c < 0 || c >= b[0].length) return;
    const cell = b[r][c];
    if (cell.revealed || cell.flagged) return;
    cell.revealed = true;
    if (cell.adj === 0 && !cell.mine) {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (dr !== 0 || dc !== 0) reveal(b, r + dr, c + dc);
      }
    }
  }, []);

  const handleClick = useCallback((r: number, c: number) => {
    if (status === 'won' || status === 'lost') return;

    let b: CellState[][];
    if (!board || status === 'idle') {
      b = buildBoard(rows, cols, mines, r * cols + c);
      setStatus('playing');
      startTimer();
    } else {
      b = board.map((row) => row.map((cell) => ({ ...cell })));
    }

    if (b[r][c].flagged) return;

    if (b[r][c].mine) {
      b.forEach((row) => row.forEach((cell) => { if (cell.mine) cell.revealed = true; }));
      b[r][c].revealed = true;
      setBoard(b);
      setStatus('lost');
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    reveal(b, r, c);

    const remaining = b.flat().filter((cell) => !cell.mine && !cell.revealed).length;
    if (remaining === 0) {
      setStatus('won');
      const pts = Math.max(50, mines * 10 - time * 2);
      setScore(pts);
      save(pts);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    setBoard(b);
  }, [board, status, rows, cols, mines, reveal, time, setScore, save]);

  const handleFlag = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (!board || status !== 'playing') return;
    const b = board.map((row) => row.map((cell) => ({ ...cell })));
    const cell = b[r][c];
    if (cell.revealed) return;
    cell.flagged = !cell.flagged;
    setFlagCount((f) => f + (cell.flagged ? 1 : -1));
    setBoard(b);
  }, [board, status]);

  const restart = (_diff = difficulty) => {
    setBoard(null);
    setStatus('idle');
    setFlagCount(0);
    setTime(0);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const currentBoard = board ?? Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, adj: 0 }))
  );

  return (
    <div className={styles.wrapper}>
      {/* Difficulty */}
      <div className={styles.diffRow}>
        {(['easy','medium','hard'] as const).map((d) => (
          <button key={d} className={`${styles.diffBtn} ${difficulty === d ? styles.diffActive : ''}`}
            onClick={() => { setDifficulty(d); restart(d); }}>
            {d === 'easy' ? `Fácil (${CONFIGS.easy.mines}💣)` : d === 'medium' ? `Medio (${CONFIGS.medium.mines}💣)` : `Difícil (${CONFIGS.hard.mines}💣)`}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={styles.stat}><Flag size={14} style={{ color: 'var(--neon-amber)' }} /><span>{mines - flagCount}</span></div>
        <div className={styles.stat}><Clock size={14} /><span>{fmt(time)}</span></div>
        {best > 0 && <div className={styles.stat}><span style={{ color: 'var(--neon-amber)' }}>Récord: {best}</span></div>}
      </div>

      {/* Board */}
      <div
        className={`${styles.board} ${status === 'lost' ? styles.boardLost : ''}`}
        style={{ '--cols': cols } as React.CSSProperties}
      >
        {currentBoard.map((row, r) =>
          row.map((cell, c) => {
            const isMineExploded = status === 'lost' && cell.mine && cell.revealed;
            return (
              <motion.button
                key={`${r}-${c}`}
                className={`${styles.cell}
                  ${cell.revealed ? styles.cellRevealed : ''}
                  ${isMineExploded ? styles.cellMine : ''}
                  ${cell.flagged ? styles.cellFlagged : ''}
                `}
                onClick={() => handleClick(r, c)}
                onContextMenu={(e) => handleFlag(e, r, c)}
                whileTap={!cell.revealed && !cell.flagged ? { scale: 0.9 } : {}}
              >
                {cell.flagged && !cell.revealed && '🚩'}
                {cell.revealed && cell.mine && '💣'}
                {cell.revealed && !cell.mine && cell.adj > 0 && (
                  <span style={{ color: NUM_COLORS[cell.adj], fontWeight: 800 }}>{cell.adj}</span>
                )}
              </motion.button>
            );
          })
        )}
      </div>

      {/* Result */}
      {(status === 'won' || status === 'lost') && (
        <motion.div
          className={`${styles.result} ${status === 'won' ? styles.resultWon : styles.resultLost}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span>{status === 'won' ? '🎉' : '💥'}</span>
          <span>{status === 'won' ? `¡Ganaste! ${score} pts` : 'Boom! Inténtalo de nuevo'}</span>
        </motion.div>
      )}

      <div className={styles.hint}>Clic izquierdo = revelar · Clic derecho = bandera</div>

      <Button variant="secondary" onClick={() => restart()}>
        <RotateCcw size={14} /> Reiniciar
      </Button>
    </div>
  );
}
