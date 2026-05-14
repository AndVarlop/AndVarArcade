import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Trophy } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { getBestScore } from '../../services/scoreService';
import type { GameMeta } from '../../types';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: GameMeta;
  index?: number;
}

export function GameCard({ game, index = 0 }: GameCardProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const bestScore = getBestScore(game.id);

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6 }}
      onClick={() => !game.comingSoon && navigate(game.path)}
      style={{
        '--game-color': game.color,
        '--game-glow': game.colorGlow,
        cursor: game.comingSoon ? 'default' : 'pointer',
      } as React.CSSProperties}
    >
      {/* Glow border on hover */}
      <motion.div
        className={styles.glowBorder}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Background gradient */}
      <div className={styles.bgGradient} />

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.emojiWrapper}>
          <motion.span
            className={styles.emoji}
            animate={{ scale: hovered ? 1.15 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            {game.emoji}
          </motion.span>
        </div>

        <div className={styles.info}>
          <h3 className={styles.title}>{game.title}</h3>
          <p className={styles.description}>{game.description}</p>
        </div>

        <div className={styles.tags}>
          {game.tags.slice(0, 2).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          {game.comingSoon && <Badge variant="amber">Próximamente</Badge>}
        </div>

        <div className={styles.footer}>
          {bestScore > 0 && (
            <div className={styles.bestScore}>
              <Trophy size={12} />
              <span>{bestScore.toLocaleString()}</span>
            </div>
          )}
          {!game.comingSoon && (
            <motion.div
              className={styles.playBtn}
              animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Play size={14} fill="currentColor" />
              Jugar
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
