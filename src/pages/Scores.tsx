import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Trash2, Medal } from 'lucide-react';
import { GAMES } from '../services/gameRegistry';
import { getTopScores, clearScores } from '../services/scoreService';
import { Button } from '../components/ui/Button';
import type { GameId } from '../types';
import styles from './Scores.module.css';

export function Scores() {
  const [selected, setSelected] = useState<GameId>(GAMES[0].id);
  const [refresh, setRefresh] = useState(0);

  const game = GAMES.find((g) => g.id === selected)!;
  const scores = getTopScores(selected, 10);

  const handleClear = () => {
    clearScores(selected);
    setRefresh((v) => v + 1);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.titleRow}>
            <div className={styles.iconWrapper}>
              <Trophy size={22} />
            </div>
            <div>
              <h1 className={styles.title}>Hall of Fame</h1>
              <p className={styles.subtitle}>Tus mejores puntuaciones guardadas localmente</p>
            </div>
          </div>
        </motion.div>

        <div className={styles.layout}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            {GAMES.map((g) => {
              const top = getTopScores(g.id, 1);
              return (
                <button
                  key={g.id}
                  className={`${styles.gameBtn} ${selected === g.id ? styles.gameBtnActive : ''}`}
                  onClick={() => setSelected(g.id)}
                  style={{ '--color': g.color } as React.CSSProperties}
                >
                  <span className={styles.gameBtnEmoji}>{g.emoji}</span>
                  <span className={styles.gameBtnTitle}>{g.title}</span>
                  {top.length > 0 && (
                    <span className={styles.gameBtnScore}>{top[0].score.toLocaleString()}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scores panel */}
          <motion.div
            key={selected + refresh}
            className={styles.panel}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.panelHeader}>
              <div className={styles.panelGame}>
                <span>{game.emoji}</span>
                <h2 style={{ color: game.color }}>{game.title}</h2>
              </div>
              {scores.length > 0 && (
                <Button variant="danger" size="sm" onClick={handleClear}>
                  <Trash2 size={14} />
                  Limpiar
                </Button>
              )}
            </div>

            {scores.length === 0 ? (
              <div className={styles.empty}>
                <Trophy size={48} strokeWidth={1} />
                <p>Aún no tienes scores en {game.title}.</p>
                <p className={styles.emptyHint}>¡Juega y vuelve aquí!</p>
              </div>
            ) : (
              <div className={styles.scoreList}>
                {scores.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    className={styles.scoreRow}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ '--color': game.color } as React.CSSProperties}
                  >
                    <div className={styles.rank}>
                      {i === 0 ? <Medal size={18} style={{ color: '#facc15' }} /> :
                       i === 1 ? <Medal size={18} style={{ color: '#94a3b8' }} /> :
                       i === 2 ? <Medal size={18} style={{ color: '#d97706' }} /> :
                       <span>{i + 1}</span>}
                    </div>
                    <div className={styles.scoreValue}>{entry.score.toLocaleString()}</div>
                    <div className={styles.scoreDate}>
                      {new Date(entry.date).toLocaleDateString('es', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
