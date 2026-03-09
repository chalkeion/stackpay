'use client';

import { motion } from 'framer-motion';

interface GrowingTreeProps {
  yieldPercent: number;
}

export default function GrowingTree({ yieldPercent }: GrowingTreeProps) {
  const clamp = Math.min(Math.max(yieldPercent, 0), 100);

  const trunkDraw = Math.min(clamp / 20, 1);
  const branch1Draw = Math.min(Math.max((clamp - 20) / 25, 0), 1);
  const branch2Draw = Math.min(Math.max((clamp - 45) / 25, 0), 1);
  const branch3Draw = Math.min(Math.max((clamp - 70) / 15, 0), 1);
  const showLeaves = clamp > 50;
  const showFruit = clamp > 80;

  const strokeVariant = (drawPercent: number) => ({
    initial: { pathLength: 0 },
    animate: { pathLength: drawPercent },
  });

  const transition = (delay = 0) => ({
    duration: 1.2,
    delay,
    ease: 'easeOut' as const,
  });

  return (
    <div className="flex items-center justify-center">
      <motion.svg
        width="180"
        height="220"
        viewBox="0 0 180 220"
        animate={{ rotate: [0, 0.5, -0.5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Trunk */}
        <motion.path
          d="M 90 210 C 88 190 85 170 90 150 C 93 130 88 110 90 90"
          stroke="var(--accent-dim)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          variants={strokeVariant(trunkDraw)}
          initial="initial"
          animate="animate"
          transition={transition(0)}
        />

        {/* Branch layer 1 */}
        <motion.path
          d="M 90 150 C 70 140 55 130 45 120"
          stroke="var(--accent-dim)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          variants={strokeVariant(branch1Draw)}
          initial="initial"
          animate="animate"
          transition={transition(0.4)}
        />
        <motion.path
          d="M 90 150 C 110 140 125 130 135 118"
          stroke="var(--accent-dim)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          variants={strokeVariant(branch1Draw)}
          initial="initial"
          animate="animate"
          transition={transition(0.4)}
        />

        {/* Branch layer 2 */}
        <motion.path
          d="M 90 120 C 72 110 58 100 48 90"
          stroke="var(--accent)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeOpacity="0.7"
          variants={strokeVariant(branch2Draw)}
          initial="initial"
          animate="animate"
          transition={transition(0.7)}
        />
        <motion.path
          d="M 90 120 C 108 110 122 100 132 88"
          stroke="var(--accent)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeOpacity="0.7"
          variants={strokeVariant(branch2Draw)}
          initial="initial"
          animate="animate"
          transition={transition(0.7)}
        />

        {/* Branch layer 3 (top) */}
        <motion.path
          d="M 90 90 C 75 80 62 70 55 60"
          stroke="var(--accent)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeOpacity="0.9"
          variants={strokeVariant(branch3Draw)}
          initial="initial"
          animate="animate"
          transition={transition(1.0)}
        />
        <motion.path
          d="M 90 90 C 105 80 118 70 125 58"
          stroke="var(--accent)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeOpacity="0.9"
          variants={strokeVariant(branch3Draw)}
          initial="initial"
          animate="animate"
          transition={transition(1.0)}
        />
        <motion.path
          d="M 90 90 L 90 55"
          stroke="var(--accent)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeOpacity="0.9"
          variants={strokeVariant(branch3Draw)}
          initial="initial"
          animate="animate"
          transition={transition(1.0)}
        />

        {/* Leaves */}
        {showLeaves && (
          <>
            {[
              [45, 118], [135, 116], [48, 88], [132, 86],
              [55, 58], [125, 56], [90, 52],
            ].map(([cx, cy], i) => (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r={10}
                fill="var(--green)"
                opacity="0.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4, type: 'spring' }}
              />
            ))}
          </>
        )}

        {/* Fruit (milestone dots) */}
        {showFruit && (
          <>
            {[
              [48, 90], [132, 88], [90, 53],
            ].map(([cx, cy], i) => (
              <motion.circle
                key={`fruit-${i}`}
                cx={cx}
                cy={cy}
                r={6}
                fill="var(--accent)"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 1.2 + i * 0.2, duration: 0.5 }}
              />
            ))}
          </>
        )}
      </motion.svg>
    </div>
  );
}
