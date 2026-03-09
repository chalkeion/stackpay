'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface CircuitBoardProps {
  children: React.ReactNode;
}

const GRID_COLS = 8;
const GRID_ROWS = 6;
const nodes = Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => ({
  x: (i % GRID_COLS) * (100 / (GRID_COLS - 1)),
  y: Math.floor(i / GRID_COLS) * (100 / (GRID_ROWS - 1)),
}));

export default function CircuitBoard({ children }: CircuitBoardProps) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      setDone(true);
      return;
    }
    const timers = [
      setTimeout(() => setStep(1), 0),
      setTimeout(() => setStep(2), 300),
      setTimeout(() => setStep(3), 800),
      setTimeout(() => setStep(4), 1200),
      setTimeout(() => setDone(true), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [prefersReduced]);

  return (
    <div className="relative w-full h-full">
      {/* Children always rendered */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: done ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {!done && (
          <motion.div
            key="circuit-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-50 bg-[var(--bg-base)] overflow-hidden"
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              {/* Horizontal lines */}
              {step >= 2 &&
                Array.from({ length: GRID_ROWS }, (_, row) => (
                  <motion.line
                    key={`h-${row}`}
                    x1="0"
                    y1={row * (100 / (GRID_ROWS - 1))}
                    x2="100"
                    y2={row * (100 / (GRID_ROWS - 1))}
                    stroke="var(--bg-border)"
                    strokeWidth="0.3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: row * 0.04 }}
                  />
                ))}

              {/* Vertical lines */}
              {step >= 2 &&
                Array.from({ length: GRID_COLS }, (_, col) => (
                  <motion.line
                    key={`v-${col}`}
                    x1={col * (100 / (GRID_COLS - 1))}
                    y1="0"
                    x2={col * (100 / (GRID_COLS - 1))}
                    y2="100"
                    stroke="var(--bg-border)"
                    strokeWidth="0.3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + col * 0.04 }}
                  />
                ))}

              {/* Intersection nodes */}
              {step >= 3 &&
                nodes.map((node, i) => (
                  <motion.circle
                    key={`node-${i}`}
                    cx={node.x}
                    cy={node.y}
                    r="0.8"
                    fill="var(--accent)"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: [0, 1, 0.4] }}
                    transition={{ duration: 0.3, delay: i * 0.015 }}
                  />
                ))}
            </svg>

            {/* Scanline sweep */}
            {step >= 1 && (
              <motion.div
                className="absolute left-0 w-full h-1 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)' }}
                initial={{ top: 0 }}
                animate={{ top: '100%' }}
                transition={{ duration: 0.3, ease: 'linear' }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
