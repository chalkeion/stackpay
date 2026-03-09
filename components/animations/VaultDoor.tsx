'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VaultDoorProps {
  isOpen: boolean;
  onToggle?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  dist: number;
}

export default function VaultDoor({ isOpen, onToggle }: VaultDoorProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isOpen) {
      const burst: Particle[] = Array.from({ length: 16 }, (_, i) => ({
        id: i,
        x: 50,
        y: 50,
        angle: (i / 16) * 360,
        dist: 60 + Math.random() * 40,
      }));
      setParticles(burst);
      const timer = setTimeout(() => setParticles([]), 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const rings = [90, 72, 54, 36];

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer select-none"
      style={{ width: 240, height: 240 }}
      onClick={onToggle}
    >
      {/* Ambient pulse when locked */}
      {!isOpen && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 220,
            height: 220,
            border: '1px solid var(--accent)',
            opacity: 0.2,
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Vault door */}
      <motion.div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: 200,
          height: 200,
          background: 'var(--bg-elevated)',
          border: '3px solid var(--bg-border)',
          transformStyle: 'preserve-3d',
          perspective: 600,
          boxShadow: isOpen
            ? '0 0 40px rgba(34,197,94,0.3)'
            : '0 0 20px var(--accent-glow)',
        }}
        animate={{
          rotateY: isOpen ? -75 : 0,
          x: isOpen ? -30 : 0,
        }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      >
        {/* Concentric rings */}
        {rings.map((r, i) => (
          <div
            key={r}
            className="absolute rounded-full"
            style={{
              width: r,
              height: r,
              border: '1.5px solid',
              borderColor: i % 2 === 0 ? 'var(--bg-border)' : 'var(--accent-dim)',
              opacity: 0.6,
            }}
          />
        ))}

        {/* Handle / wheel */}
        <motion.div
          className="absolute flex items-center justify-center"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="none" stroke="var(--accent)" strokeWidth="2" />
            <line x1="20" y1="2" x2="20" y2="8" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="32" x2="20" y2="38" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="20" x2="8" y2="20" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="20" x2="38" y2="20" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="20" r="5" fill="var(--accent)" opacity="0.8" />
          </svg>
        </motion.div>

        {/* Lock indicator */}
        <motion.div
          className="absolute bottom-6"
          animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wider"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
          >
            LOCKED
          </div>
        </motion.div>
      </motion.div>

      {/* Particles on open */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 6,
              height: 6,
              background: 'var(--accent)',
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((p.angle * Math.PI) / 180) * p.dist,
              y: Math.sin((p.angle * Math.PI) / 180) * p.dist,
              opacity: 0,
              scale: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Open state glow */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="open-glow"
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ boxShadow: '0 0 60px rgba(34,197,94,0.4)' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
