import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Search } from 'lucide-react';
import { GameCard } from '../components/game/GameCard';
import { GAMES } from '../services/gameRegistry';
import styles from './Arcade.module.css';

const ALL_TAGS = ['Todos', 'Clásico', 'Estrategia', 'Lógica', 'Palabras', 'Memoria', 'Arcade'];

export function Arcade() {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('Todos');

  const filtered = GAMES.filter((g) => {
    const matchSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    const matchTag = activeTag === 'Todos' || g.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={styles.titleRow}>
            <div className={styles.iconWrapper}>
              <LayoutGrid size={22} />
            </div>
            <div>
              <h1 className={styles.title}>Catálogo de Juegos</h1>
              <p className={styles.subtitle}>{GAMES.length} juegos disponibles</p>
            </div>
          </div>

          {/* Search */}
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Buscar juego..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Tag filters */}
        <motion.div
          className={styles.tags}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              className={`${styles.tag} ${activeTag === tag ? styles.tagActive : ''}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((game, i) => (
              <GameCard key={game.id} game={game} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            className={styles.empty}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className={styles.emptyEmoji}>🎮</span>
            <p>No se encontraron juegos para "{search}"</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
