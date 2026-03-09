'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import LiquidDrip from '@/components/animations/LiquidDrip';
import { mockStream } from '@/lib/mock-data';

export default function StreamScreen() {
  const [isStreaming, setIsStreaming] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [recipient, setRecipient] = useState(mockStream.recipient);
  const [rate, setRate] = useState(String(mockStream.ratePerMinute));

  useEffect(() => {
    if (!isStreaming) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [isStreaming]);

  const totalStreamed = mockStream.totalStreamed + (elapsed * mockStream.ratePerMinute) / 60;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
          Stream Payments
        </h1>
        <p className="text-xs mb-8" style={{ color: 'var(--text-secondary)' }}>
          Real-time per-second Bitcoin streaming.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Animation + controls */}
          <div className="flex flex-col items-center gap-6">
            <LiquidDrip
              isStreaming={isStreaming}
              senderLabel="YOU"
              recipientLabel={recipient.slice(0, 8) + '...'}
            />

            {/* Controls */}
            <div className="flex gap-3">
              <Button
                variant={isStreaming ? 'default' : 'accent'}
                size="sm"
                onClick={() => setIsStreaming((v) => !v)}
              >
                {isStreaming ? <Pause size={14} /> : <Play size={14} />}
                {isStreaming ? 'Pause' : 'Resume'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setIsStreaming(false); setElapsed(0); }}
              >
                <Square size={14} />
                Stop
              </Button>
            </div>

            {/* Live stats */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {[
                { label: 'Rate', value: `${rate} sBTC/min` },
                { label: 'Total Streamed', value: `${totalStreamed.toFixed(6)} sBTC` },
                { label: 'Elapsed', value: formatTime(elapsed) },
                { label: 'Status', value: isStreaming ? 'ACTIVE' : 'PAUSED' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border p-3"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)' }}
                >
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                  </div>
                  <div
                    className="text-sm font-mono font-semibold"
                    style={{ color: label === 'Status' && isStreaming ? 'var(--green)' : 'var(--text-primary)' }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Config form */}
          <Card>
            <CardHeader>
              <CardTitle>New Stream</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                label="Recipient"
                placeholder="SP..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              <Input
                label="Rate (sBTC per minute)"
                type="number"
                placeholder="0.0001"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
              <Input
                label="Duration (minutes)"
                type="number"
                placeholder="60"
              />
              <Button variant="accent" size="md" className="w-full" onClick={() => setIsStreaming(true)}>
                <Play size={14} />
                Start Stream
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
