import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Bot, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useGameScore } from '../../hooks/useGameScore';
import styles from './TicTacToeGame.module.css';

type Cell = 'X' | 'O' | null;
type Mode = 'ai' | '2p';

const WINS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(board: Cell[]): { winner: Cell; line: number[] } | null {
  for (const line of WINS) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

function minimax(board: Cell[], depth: number, isMax: boolean): number {
  const result = checkWinner(board);
  if (result?.winner === 'O') return 10 - depth;
  if (result?.winner === 'X') return depth - 10;
  if (board.every(Boolean)) return 0;

  if (isMax) {
    let best = -Infinity;
    board.forEach((cell, i) => {
      if (!cell) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = null;
      }
    });
    return best;
  } else {
    let best = Infinity;
    board.forEach((cell, i) => {
      if (!cell) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = null;
      }
    });
    return best;
  }
}

function bestAIMove(board: Cell[]): number {
  let best = -Infinity, move = -1;
  board.forEach((cell, i) => {
    if (!cell) {
      board[i] = 'O';
      const val = minimax([...board], 0, false);
      board[i] = null;
      if (val > best) { best = val; move = i; }
    }
  });
  return move;
}

export function TicTacToeGame() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [mode, setMode] = useState<Mode>('ai');
  const [gameOver, setGameOver] = useState(false);
  const [winData, setWinData] = useState<{ winner: Cell; line: number[] } | null>(null);
  const [stats, setStats] = useState({ X: 0, O: 0, draw: 0 });
  const { score, increment, reset } = useGameScore('tictactoe');

  const processResult = useCallback((b: Cell[]) => {
    const result = checkWinner(b);
    if (result) {
      setWinData(result);
      setGameOver(true);
      setStats((s) => ({ ...s, [result.winner!]: s[result.winner as 'X' | 'O'] + 1 }));
      if (result.winner === 'X') increment(10);
    } else if (b.every(Boolean)) {
      setGameOver(true);
      setStats((s) => ({ ...s, draw: s.draw + 1 }));
    }
  }, [increment]);

  const handleClick = useCallback((idx: number) => {
    if (board[idx] || gameOver) return;
    if (mode === 'ai' && turn === 'O') return;

    const newBoard = [...board];
    newBoard[idx] = turn;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result || newBoard.every(Boolean)) {
      processResult(newBoard);
      return;
    }

    const nextTurn = turn === 'X' ? 'O' : 'X';
    setTurn(nextTurn);

    if (mode === 'ai' && nextTurn === 'O') {
      setTimeout(() => {
        const aiIdx = bestAIMove([...newBoard]);
        const afterAI = [...newBoard];
        afterAI[aiIdx] = 'O';
        setBoard(afterAI);
        processResult(afterAI);
        setTurn('X');
      }, 350);
    }
  }, [board, gameOver, mode, turn, processResult]);

  const restart = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setGameOver(false);
    setWinData(null);
    reset();
  };

  const statusText = gameOver
    ? winData ? `¡Gana ${winData.winner}!` : 'Empate'
    : `Turno de ${turn}`;

  return (
    <div className={styles.wrapper}>
      {/* Mode selector */}
      <div className={styles.modeRow}>
        <button className={`${styles.modeBtn} ${mode === 'ai' ? styles.modeBtnActive : ''}`} onClick={() => { setMode('ai'); restart(); }}>
          <Bot size={15} /> vs IA
        </button>
        <button className={`${styles.modeBtn} ${mode === '2p' ? styles.modeBtnActive : ''}`} onClick={() => { setMode('2p'); restart(); }}>
          <Users size={15} /> 2 Jugadores
        </button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.xColor}>X</span>
          <span className={styles.statNum}>{stats.X}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.drawColor}>Empate</span>
          <span className={styles.statNum}>{stats.draw}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.oColor}>O</span>
          <span className={styles.statNum}>{stats.O}</span>
        </div>
      </div>

      {/* Status */}
      <div className={`${styles.status} ${gameOver ? styles.statusDone : ''}`}>
        {statusText}
      </div>

      {/* Board */}
      <div className={styles.board}>
        {board.map((cell, i) => {
          const isWin = winData?.line.includes(i);
          return (
            <motion.button
              key={i}
              className={`${styles.cell} ${isWin ? styles.cellWin : ''}`}
              onClick={() => handleClick(i)}
              whileTap={{ scale: cell ? 1 : 0.9 }}
              style={{
                '--cell-color': cell === 'X' ? 'var(--game-tictactoe)' : 'var(--neon-cyan)',
              } as React.CSSProperties}
            >
              <AnimatePresence>
                {cell && (
                  <motion.span
                    className={`${styles.cellText} ${cell === 'X' ? styles.xColor : styles.oColor}`}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Score */}
      <div className={styles.scoreRow}>
        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Puntos totales:</span>
        <span style={{ color: 'var(--game-tictactoe)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>{score}</span>
      </div>

      <Button variant="secondary" onClick={restart}>
        <RotateCcw size={15} /> Nueva partida
      </Button>
    </div>
  );
}
