'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { mockSplit } from '@/lib/mock-data';

const CARD_ROTATIONS = [-20, 0, 20];
const COLORS = ['#F15A22', '#3B82F6', '#22C55E'];

export default function SplitScreen() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-syne)', color: 'var(--text-primary)' }}
        >
          Split Payment
        </h1>
        <p className="text-xs mb-8" style={{ color: 'var(--text-secondary)' }}>
          Divide a payment across multiple recipients.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fan animation */}
          <div className="flex flex-col items-center">
            {/* Arc lines SVG */}
            <div className="relative" style={{ width: 340, height: 280 }}>
              <svg
                className="absolute inset-0 pointer-events-none"
                width="340"
                height="280"
                viewBox="0 0 340 280"
              >
                {mockSplit.recipients.map((_, i) => {
                  const centerX = 170;
                  const centerY = 140;
                  const angle = CARD_ROTATIONS[i] * (Math.PI / 180);
                  const dist = 110;
                  const endX = centerX + Math.sin(angle) * dist;
                  const endY = centerY - Math.cos(angle) * dist + 20;

                  return (
                    <g key={i}>
                      <motion.path
                        d={`M ${centerX} ${centerY + 10} Q ${(centerX + endX) / 2} ${centerY - 30} ${endX} ${endY}`}
                        fill="none"
                        stroke={COLORS[i]}
                        strokeWidth="1.5"
                        strokeOpacity="0.5"
                        strokeDasharray="4 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: i * 0.2, ease: 'easeOut' }}
                      />
                      {/* Travelling dot */}
                      {sent && (
                        <motion.circle
                          r="4"
                          fill={COLORS[i]}
                          cx={centerX}
                          cy={centerY + 10}
                          animate={{
                            cx: [centerX, (centerX + endX) / 2, endX],
                            cy: [centerY + 10, centerY - 30, endY],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Center hub */}
              <motion.div
                className="absolute rounded-full border-2 flex items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'var(--accent-dim)',
                  borderColor: 'var(--accent)',
                  boxShadow: sent ? '0 0 20px var(--accent-glow)' : 'none',
                }}
                animate={{ scale: sent ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.4 }}
              >
                <span className="text-xs font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-syne)' }}>
                  SP
                </span>
              </motion.div>

              {/* Recipient cards */}
              {mockSplit.recipients.map((r, i) => {
                const angle = CARD_ROTATIONS[i] * (Math.PI / 180);
                const dist = 110;
                const x = 170 + Math.sin(angle) * dist - 55;
                const y = 140 - Math.cos(angle) * dist + 20 - 40;

                return (
                  <motion.div
                    key={i}
                    className="absolute w-28 rounded-xl border p-3 cursor-pointer"
                    style={{
                      left: x,
                      top: y,
                      background: 'var(--bg-elevated)',
                      borderColor: hoveredIdx === i ? COLORS[i] : 'var(--bg-border)',
                      boxShadow: hoveredIdx === i ? `0 0 14px ${COLORS[i]}44` : 'none',
                    }}
                    initial={{ rotate: CARD_ROTATIONS[i], y: 0 }}
                    animate={{
                      rotate: CARD_ROTATIONS[i],
                      y: hoveredIdx === i ? -20 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    onHoverStart={() => setHoveredIdx(i)}
                    onHoverEnd={() => setHoveredIdx(null)}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mb-2"
                      style={{ background: COLORS[i] }}
                    >
                      {i + 1}
                    </div>
                    <div className="text-xs font-mono truncate" style={{ color: 'var(--text-secondary)' }}>
                      {r.shortAddress}
                    </div>
                    <div className="text-sm font-bold mt-1" style={{ color: COLORS[i], fontFamily: 'var(--font-syne)' }}>
                      {r.percentage}%
                    </div>
                    <div className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
                      {r.amount} sBTC
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Total */}
            <div className="text-center mt-4">
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                Total
              </div>
              <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-syne)', color: 'var(--accent)' }}>
                {mockSplit.total} sBTC
              </div>
            </div>
          </div>

          {/* Right: breakdown + send */}
          <Card>
            <CardHeader>
              <CardTitle>Split Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {mockSplit.recipients.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: COLORS[i] }}
                  />
                  <div className="flex-1 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {r.shortAddress}
                  </div>
                  <div className="text-sm font-bold" style={{ color: COLORS[i] }}>
                    {r.percentage}%
                  </div>
                  <div className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
                    {r.amount} sBTC
                  </div>
                </div>
              ))}

              <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: 'var(--bg-border)' }}>
                <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Total
                </span>
                <span className="font-bold font-mono" style={{ color: 'var(--accent)' }}>
                  {mockSplit.total} sBTC
                </span>
              </div>

              <Button
                variant="accent"
                size="md"
                className="w-full mt-2"
                onClick={() => setSent(true)}
              >
                {sent ? 'Split Sent!' : 'Send Split'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
