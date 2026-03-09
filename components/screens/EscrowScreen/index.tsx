'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import VaultDoor from '@/components/animations/VaultDoor';
import { mockEscrow } from '@/lib/mock-data';

const MILESTONE_NODE_HEIGHT = 80;

export default function EscrowScreen() {
  const [isOpen, setIsOpen] = useState(false);
  const completed = mockEscrow.milestones.filter((m) => m.complete).length;
  const allDone = completed === mockEscrow.milestones.length;

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
          Escrow
        </h1>
        <p className="text-xs mb-8" style={{ color: 'var(--text-secondary)' }}>
          Milestone-based payments with on-chain conditions.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Vault */}
          <div className="flex flex-col items-center gap-6">
            <VaultDoor isOpen={isOpen} onToggle={() => setIsOpen((v) => !v)} />
            <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
              Click the vault to {isOpen ? 'lock' : 'unlock'}
            </p>

            {/* Escrow details */}
            <div className="w-full grid grid-cols-2 gap-3">
              <div
                className="rounded-xl border p-3"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)' }}
              >
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Locked Amount
                </div>
                <div className="text-lg font-bold font-mono" style={{ color: 'var(--accent)' }}>
                  {mockEscrow.amount} sBTC
                </div>
              </div>
              <div
                className="rounded-xl border p-3"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)' }}
              >
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Progress
                </div>
                <div className="text-lg font-bold font-mono" style={{ color: 'var(--green)' }}>
                  {completed}/{mockEscrow.milestones.length}
                </div>
              </div>
              <div
                className="col-span-2 rounded-xl border p-3"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)' }}
              >
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Recipient
                </div>
                <div className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
                  {mockEscrow.recipient}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative flex flex-col gap-0">
                {/* Connecting path SVG */}
                <svg
                  className="absolute left-4 top-4"
                  width="2"
                  height={mockEscrow.milestones.length * MILESTONE_NODE_HEIGHT - 16}
                  viewBox={`0 0 2 ${mockEscrow.milestones.length * MILESTONE_NODE_HEIGHT - 16}`}
                  style={{ zIndex: 0 }}
                >
                  <line
                    x1="1"
                    y1="0"
                    x2="1"
                    y2={mockEscrow.milestones.length * MILESTONE_NODE_HEIGHT - 16}
                    stroke="var(--bg-border)"
                    strokeWidth="2"
                  />
                  <motion.line
                    x1="1"
                    y1="0"
                    x2="1"
                    y2={mockEscrow.milestones.length * MILESTONE_NODE_HEIGHT - 16}
                    stroke="var(--green)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: completed / mockEscrow.milestones.length }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </svg>

                {mockEscrow.milestones.map((m, i) => (
                  <motion.div
                    key={i}
                    className="relative flex items-start gap-4 pl-10 pb-6"
                    style={{ minHeight: MILESTONE_NODE_HEIGHT }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.4 }}
                  >
                    {/* Node */}
                    <div className="absolute left-0 top-0 flex-shrink-0 z-10">
                      {m.complete ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: i * 0.15 }}
                        >
                          <CheckCircle2 size={20} style={{ color: 'var(--green)' }} />
                        </motion.div>
                      ) : (
                        <Circle size={20} style={{ color: 'var(--text-dim)' }} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div
                        className="text-sm font-medium"
                        style={{ color: m.complete ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                      >
                        {m.label}
                      </div>
                      <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--accent)' }}>
                        {m.amount} sBTC
                      </div>
                    </div>

                    {m.complete && (
                      <div
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}
                      >
                        Done
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <Button
                variant="accent"
                size="md"
                className="w-full mt-4"
                disabled={!allDone}
                onClick={() => setIsOpen(true)}
              >
                {allDone ? 'Release Funds' : `${mockEscrow.milestones.length - completed} milestones remaining`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
