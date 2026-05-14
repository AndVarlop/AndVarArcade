import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info } from 'lucide-react';
import { getGame } from '../services/gameRegistry';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { SnakeGame } from '../games/snake/SnakeGame';
import { TicTacToeGame } from '../games/tictactoe/TicTacToeGame';
import { MemoryGame } from '../games/memory/MemoryGame';
import { HangmanGame } from '../games/hangman/HangmanGame';
import { MinesweeperGame } from '../games/minesweeper/MinesweeperGame';
import { SudokuGame } from '../games/sudoku/SudokuGame';
import { WordSearchGame } from '../games/wordsearch/WordSearchGame';
import styles from './GamePage.module.css';

const GAME_COMPONENTS: Record<string, React.ComponentType> = {
  snake: SnakeGame,
  tictactoe: TicTacToeGame,
  memory: MemoryGame,
  hangman: HangmanGame,
  minesweeper: MinesweeperGame,
  sudoku: SudokuGame,
  wordsearch: WordSearchGame,
};

const INSTRUCTIONS: Record<string, string[]> = {
  snake: ['Usa las teclas de flecha o WASD para mover la serpiente.', 'Come la comida verde para crecer y ganar puntos.', 'Evita chocar contra tu propio cuerpo.', 'Pausa con Espacio. Cuanto más largo, más difícil.'],
  tictactoe: ['Objetivo: conseguir 3 en línea (horizontal, vertical o diagonal).', 'X siempre empieza primero.', 'Juega contra la IA (Minimax) o en modo 2 jugadores.', 'La IA en modo difícil es invencible — busca el empate.'],
  memory: ['Voltea dos cartas por turno.', 'Si coinciden, quedan descubiertas.', 'Si no coinciden, se voltean boca abajo.', 'Ganas cuando encuentras todos los pares.', 'Tu puntuación depende de movimientos y tiempo.'],
  hangman: ['Adivina la palabra letra a letra.', 'Tienes 6 intentos antes del game over.', 'Usa el teclado del juego o tu teclado físico.', 'Puedes pedir una pista, pero cuesta puntos.'],
  minesweeper: ['Clic izquierdo para revelar una celda.', 'Clic derecho para poner/quitar bandera.', 'Los números indican cuántas minas hay alrededor.', 'Revela todas las celdas sin minas para ganar.', 'El primer clic nunca será una mina.'],
  sudoku: ['Completa el tablero 9×9 con dígitos del 1 al 9.', 'Cada fila, columna y caja 3×3 debe tener cada dígito exactamente una vez.', 'Haz clic en una celda vacía y luego en un número.', 'Las celdas en rojo indican un valor incorrecto.'],
  wordsearch: ['Encuentra todas las palabras ocultas en el tablero.', 'Las palabras pueden estar en cualquier dirección: horizontal, vertical o diagonal.', 'Haz clic y arrastra para seleccionar una palabra.', 'Las palabras encontradas aparecen tachadas en la lista.'],
};

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const game = getGame(gameId ?? '');
  const GameComponent = gameId ? GAME_COMPONENTS[gameId] : null;

  if (!game || !GameComponent) {
    return (
      <div className={styles.notFound}>
        <span>🎮</span>
        <p>Juego no encontrado</p>
        <Button onClick={() => navigate('/arcade')}>Volver al Arcade</Button>
      </div>
    );
  }

  const instructions = INSTRUCTIONS[gameId!] ?? [];

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/arcade')}>
          <ArrowLeft size={16} />
          Arcade
        </button>
        <div className={styles.titleGroup}>
          <span className={styles.titleEmoji}>{game.emoji}</span>
          <h1 className={styles.title} style={{ color: game.color }}>{game.title}</h1>
        </div>
        <button className={styles.infoBtn} onClick={() => setShowInfo(true)}>
          <Info size={16} />
          Instrucciones
        </button>
      </div>

      {/* Game */}
      <div className={styles.gameArea}>
        <GameComponent />
      </div>

      {/* Instructions modal */}
      <Modal open={showInfo} onClose={() => setShowInfo(false)} title={`Cómo jugar: ${game.title}`}>
        <ul className={styles.instructionsList}>
          {instructions.map((line, i) => (
            <motion.li
              key={i}
              className={styles.instructionItem}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <span className={styles.instructionBullet} style={{ background: game.color }}>
                {i + 1}
              </span>
              {line}
            </motion.li>
          ))}
        </ul>
      </Modal>
    </motion.div>
  );
}
