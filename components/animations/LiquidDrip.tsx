'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Drop {
  id: number;
  x: number;
}

interface LiquidDripProps {
  isStreaming: boolean;
  senderLabel?: string;
  recipientLabel?: string;
}

export default function LiquidDrip({
  isStreaming,
  senderLabel = 'YOU',
  recipientLabel = 'RECIPIENT',
}: LiquidDripProps) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [ripples, setRipples] = useState<number[]>([]);
  const dropIdRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (isStreaming) {
      intervalRef.current = setInterval(() => {
        const id = dropIdRef.current++;
        setDrops((prev) => [...prev, { id, x: 40 + Math.random() * 20 }]);
        setTimeout(() => {
          setDrops((prev) => prev.filter((d) => d.id !== id));
          setRipples((prev) => [...prev, id]);
          setTimeout(() => setRipples((prev) => prev.filter((r) => r !== id)), 600);
        }, 900);
      }, 400);
    } else {
      clearInterval(intervalRef.current);
      setDrops([]);
    }
    return () => clearInterval(intervalRef.current);
  }, [isStreaming]);

  return (
    <div className="flex flex-col items-center gap-0 select-none" style={{ width: 140 }}>
      {/* Sender card */}
      <div
        className="w-full rounded-xl border px-4 py-3 text-center"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: isStreaming ? 'var(--accent)' : 'var(--bg-border)',
          boxShadow: isStreaming ? '0 0 12px var(--accent-glow)' : 'none',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        <div className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          {senderLabel}
        </div>
      </div>

      {/* Channel */}
      <div className="relative flex justify-center" style={{ width: 60, height: 100 }}>
        {/* Channel line */}
        <div
          className="absolute"
          style={{
            width: 2,
            height: '100%',
            background: isStreaming
              ? 'linear-gradient(to bottom, var(--accent), var(--accent-dim))'
              : 'var(--bg-border)',
            transition: 'background 0.3s',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />

        {/* Drops */}
        <AnimatePresence>
          {drops.map((drop) => (
            <motion.div
              key={drop.id}
              className="absolute rounded-full"
              style={{
                width: 8,
                height: 12,
                background: 'var(--accent)',
                left: `calc(50% - 4px)`,
                top: 0,
                willChange: 'transform',
              }}
              initial={{ y: 0, opacity: 1, scaleY: 1 }}
              animate={{ y: 88, opacity: 0.9, scaleY: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{
                y: { duration: 0.9, ease: [0.55, 0, 1, 0.45] },
                scaleY: { duration: 0.9 },
                opacity: { duration: 0.1, delay: 0.8 },
              }}
            />
          ))}
        </AnimatePresence>

        {/* Ripples */}
        <AnimatePresence>
          {ripples.map((rId) => (
            <motion.div
              key={rId}
              className="absolute rounded-full border"
              style={{
                borderColor: 'var(--accent)',
                left: '50%',
                bottom: 2,
                transform: 'translateX(-50%)',
                width: 8,
                height: 8,
              }}
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Recipient card */}
      <div
        className="w-full rounded-xl border px-4 py-3 text-center"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: isStreaming ? 'var(--accent)' : 'var(--bg-border)',
          boxShadow: isStreaming ? '0 0 12px var(--accent-glow)' : 'none',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        <div className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          {recipientLabel}
        </div>
      </div>
    </div>
  );
}
