import { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Pause } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useGameScore } from '../../hooks/useGameScore';
import styles from './SnakeGame.module.css';

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Point = { x: number; y: number };

const GRID = 20;
const CELL = 22;
const SPEEDS: Record<string, number> = { easy: 140, medium: 90, hard: 55 };

function rand(max: number) { return Math.floor(Math.random() * max); }
function randomFood(snake: Point[]): Point {
  let p: Point;
  do { p = { x: rand(GRID), y: rand(GRID) }; }
  while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Dir>('RIGHT');
  const nextDirRef = useRef<Dir>('RIGHT');
  const foodRef = useRef<Point>(randomFood([{ x: 10, y: 10 }]));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused' | 'dead'>('idle');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const { score, best, setScore, reset, save } = useGameScore('snake');

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let x = 0; x < GRID; x++) {
      for (let y = 0; y < GRID; y++) {
        ctx.beginPath();
        ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Food
    const f = foodRef.current;
    const grd = ctx.createRadialGradient(
      f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, 2,
      f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, CELL / 2
    );
    grd.addColorStop(0, '#10b981');
    grd.addColorStop(1, 'rgba(16,185,129,0.2)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.roundRect(f.x * CELL + 3, f.y * CELL + 3, CELL - 6, CELL - 6, 5);
    ctx.fill();

    // Snake
    const snake = snakeRef.current;
    snake.forEach((seg, i) => {
      const alpha = Math.max(0.3, 1 - i * 0.04);
      ctx.fillStyle = i === 0
        ? '#8b5cf6'
        : `rgba(139,92,246,${alpha})`;
      const pad = i === 0 ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, i === 0 ? 6 : 4);
      ctx.fill();
    });
  }, []);

  const tick = useCallback(() => {
    dirRef.current = nextDirRef.current;
    const snake = snakeRef.current;
    const head = snake[0];
    const dir = dirRef.current;
    const next: Point = {
      x: (head.x + (dir === 'RIGHT' ? 1 : dir === 'LEFT' ? -1 : 0) + GRID) % GRID,
      y: (head.y + (dir === 'DOWN' ? 1 : dir === 'UP' ? -1 : 0) + GRID) % GRID,
    };

    if (snake.slice(1).some((s) => s.x === next.x && s.y === next.y)) {
      setStatus('dead');
      save();
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const ate = next.x === foodRef.current.x && next.y === foodRef.current.y;
    const newSnake = [next, ...snake];
    if (!ate) newSnake.pop();
    else {
      foodRef.current = randomFood(newSnake);
      setScore((prev) => prev + 10);
    }
    snakeRef.current = newSnake;
    draw();
  }, [draw, save, setScore]);

  const startGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    dirRef.current = 'RIGHT';
    nextDirRef.current = 'RIGHT';
    foodRef.current = randomFood([{ x: 10, y: 10 }]);
    reset();
    setStatus('playing');
  }, [reset]);

  useEffect(() => {
    if (status === 'playing') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, SPEEDS[difficulty]);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status, difficulty, tick]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
      };
      const newDir = map[e.key];
      if (!newDir) {
        if (e.key === ' ') {
          e.preventDefault();
          setStatus((s) => s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s);
        }
        return;
      }
      const opp = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
      if (opp[newDir] !== dirRef.current) nextDirRef.current = newDir;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Score bar */}
      <div className={styles.scoreBar}>
        <div className={styles.scoreItem}>
          <span className={styles.scoreLabel}>Puntos</span>
          <span className={styles.scoreVal} style={{ color: 'var(--game-snake)' }}>{score}</span>
        </div>
        <div className={styles.scoreItem}>
          <span className={styles.scoreLabel}>Récord</span>
          <span className={styles.scoreVal} style={{ color: 'var(--neon-amber)' }}>{best}</span>
        </div>
        <div className={styles.scoreItem}>
          <span className={styles.scoreLabel}>Longitud</span>
          <span className={styles.scoreVal}>{snakeRef.current.length}</span>
        </div>
      </div>

      {/* Difficulty (only when idle) */}
      {status === 'idle' && (
        <div className={styles.diffRow}>
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              className={`${styles.diffBtn} ${difficulty === d ? styles.diffActive : ''}`}
              onClick={() => setDifficulty(d)}
            >
              {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Medio' : 'Difícil'}
            </button>
          ))}
        </div>
      )}

      {/* Canvas */}
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          width={GRID * CELL}
          height={GRID * CELL}
          className={styles.canvas}
        />

        {/* Overlay */}
        {(status === 'idle' || status === 'dead' || status === 'paused') && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {status === 'dead' && (
              <>
                <div className={styles.overlayEmoji}>💀</div>
                <h3 className={styles.overlayTitle}>Game Over</h3>
                <p className={styles.overlayScore}>Puntuación: <strong>{score}</strong></p>
                {score >= best && score > 0 && <p className={styles.newRecord}>¡Nuevo récord!</p>}
              </>
            )}
            {status === 'paused' && (
              <>
                <div className={styles.overlayEmoji}>⏸️</div>
                <h3 className={styles.overlayTitle}>Pausado</h3>
              </>
            )}
            {status === 'idle' && (
              <>
                <div className={styles.overlayEmoji}>🐍</div>
                <h3 className={styles.overlayTitle}>Snake</h3>
                <p className={styles.overlayHint}>Usa las flechas o WASD</p>
              </>
            )}
            <div className={styles.overlayBtns}>
              <Button onClick={startGame}>
                <Play size={16} fill="currentColor" />
                {status === 'dead' ? 'Reintentar' : 'Jugar'}
              </Button>
              {status === 'paused' && (
                <Button variant="secondary" onClick={() => setStatus('playing')}>
                  <Play size={16} fill="currentColor" /> Continuar
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      {status === 'playing' && (
        <div className={styles.controls}>
          <Button variant="secondary" size="sm" onClick={() => setStatus('paused')}>
            <Pause size={14} /> Pausar
          </Button>
          <Button variant="ghost" size="sm" onClick={startGame}>
            <RotateCcw size={14} /> Reiniciar
          </Button>
        </div>
      )}

      {/* Mobile D-pad */}
      <div className={styles.dpad}>
        <div className={styles.dpadRow}>
          <button className={styles.dpadBtn} onClick={() => { nextDirRef.current = 'UP'; }}>▲</button>
        </div>
        <div className={styles.dpadRow}>
          <button className={styles.dpadBtn} onClick={() => { nextDirRef.current = 'LEFT'; }}>◀</button>
          <button className={styles.dpadBtn} onClick={() => { nextDirRef.current = 'DOWN'; }}>▼</button>
          <button className={styles.dpadBtn} onClick={() => { nextDirRef.current = 'RIGHT'; }}>▶</button>
        </div>
      </div>
    </div>
  );
}
