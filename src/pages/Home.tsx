import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Zap, Trophy, ChevronRight, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GameCard } from '../components/game/GameCard';
import { GAMES } from '../services/gameRegistry';
import styles from './Home.module.css';

const FEATURED = GAMES.slice(0, 3);

const STATS = [
  { label: 'Juegos', value: '7', icon: Gamepad2, color: 'var(--neon-purple)' },
  { label: 'Géneros', value: '5+', icon: Zap, color: 'var(--neon-cyan)' },
  { label: 'Scores', value: '∞', icon: Trophy, color: 'var(--neon-amber)' },
];

export function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <motion.div
            className={styles.heroBadge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Zap size={13} fill="currentColor" />
            Plataforma de Juegos Online
          </motion.div>

          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Bienvenido a{' '}
            <span className="gradient-text-hero">AndVar Arcade</span>
          </motion.h1>

          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Tu sala de juegos clásicos en el navegador. Juega Snake, Sudoku, Memory y más —
            sin instalaciones, sin anuncios, sin límites.
          </motion.p>

          <motion.div
            className={styles.heroCtas}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button size="lg" onClick={() => navigate('/arcade')}>
              <Play size={18} fill="currentColor" />
              Explorar Juegos
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/scores')}>
              <Trophy size={18} />
              Ver Scores
            </Button>
          </motion.div>
        </div>

        {/* Hero visual */}
        <motion.div
          className={styles.heroVisual}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className={styles.heroOrb} />
          <div className={styles.heroGrid}>
            {GAMES.map((g, i) => (
              <motion.div
                key={g.id}
                className={styles.heroEmoji}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                style={{ '--glow': g.colorGlow } as React.CSSProperties}
              >
                {g.emoji}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <div className="container">
          <div className={styles.statsGrid}>
            {STATS.map(({ label, value, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                className={styles.statCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <div className={styles.statIcon} style={{ color }}>
                  <Icon size={22} />
                </div>
                <div>
                  <div className={styles.statValue} style={{ color }}>{value}</div>
                  <div className={styles.statLabel}>{label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured games */}
      <section className={styles.featured}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Juegos Destacados</h2>
              <p className={styles.sectionSubtitle}>Los más populares de la sala</p>
            </div>
            <button className={styles.seeAll} onClick={() => navigate('/arcade')}>
              Ver todos
              <ChevronRight size={16} />
            </button>
          </div>

          <div className={styles.gamesGrid}>
            {FEATURED.map((game, i) => (
              <GameCard key={game.id} game={game} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className="container">
          <motion.div
            className={styles.ctaCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.ctaOrb} />
            <h2 className={styles.ctaTitle}>
              ¿Listo para jugar?
            </h2>
            <p className={styles.ctaText}>
              Explora el catálogo completo, bate tus records y compite contigo mismo.
            </p>
            <Button size="lg" onClick={() => navigate('/arcade')}>
              <Gamepad2 size={18} />
              Entrar al Arcade
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
