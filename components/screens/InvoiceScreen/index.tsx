'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Share2, Twitter, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const QR_SIZE = 20;
const CELL_COUNT = QR_SIZE * QR_SIZE;

function QRPlaceholder() {
  const [visible, setVisible] = useState<Set<number>>(new Set());

  useEffect(() => {
    const indices = Array.from({ length: CELL_COUNT }, (_, i) => i).sort(() => Math.random() - 0.5);
    let i = 0;
    const interval = setInterval(() => {
      const batch = indices.slice(i, i + 8);
      setVisible((prev) => {
        const next = new Set(prev);
        batch.forEach((idx) => next.add(idx));
        return next;
      });
      i += 8;
      if (i >= CELL_COUNT) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden border p-3"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${QR_SIZE}, 1fr)`,
          gap: 2,
          width: 160,
          height: 160,
        }}
      >
        {Array.from({ length: CELL_COUNT }, (_, idx) => (
          <motion.div
            key={idx}
            style={{
              background: visible.has(idx)
                ? idx % 3 === 0 ? 'var(--accent)' : 'var(--text-primary)'
                : 'transparent',
              borderRadius: 1,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={visible.has(idx) ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

// Circular countdown ring
function ExpiryRing({ totalSeconds = 600 }: { totalSeconds?: number }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const progress = remaining / totalSeconds;

  useEffect(() => {
    const id = setInterval(() => setRemaining((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = (remaining % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={72} height={72} viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--bg-border)" strokeWidth="4" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          transform="rotate(-90 36 36)"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
        <text x="36" y="41" textAnchor="middle" fontSize="12" fontFamily="var(--font-ibm-plex-mono)"
          fill="var(--text-primary)">
          {mins}:{secs}
        </text>
      </svg>
      <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
        Expires
      </span>
    </div>
  );
}

export default function InvoiceScreen() {
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const invoiceLink = 'https://stackpay.io/pay/inv_0x9f4a...';

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto max-w-2xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-syne)', color: 'var(--text-primary)' }}
        >
          Invoice
        </h1>
        <p className="text-xs mb-8" style={{ color: 'var(--text-secondary)' }}>
          Generate a shareable Bitcoin payment request.
        </p>

        {/* Invoice card slides up with slight rotation */}
        <motion.div
          initial={{ y: 40, rotate: 2, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.15 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Request</CardTitle>
              <ExpiryRing />
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 items-start">
                <QRPlaceholder />

                <div className="flex-1 flex flex-col gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Request Amount
                    </div>
                    <motion.div
                      className="text-3xl font-bold"
                      style={{ fontFamily: 'var(--font-syne)', color: 'var(--accent)' }}
                      animate={{ scale: amount ? [1, 1.05, 1] : 1 }}
                      transition={{ duration: 0.2 }}
                      key={amount}
                    >
                      {amount || '0.0000'} sBTC
                    </motion.div>
                  </div>

                  <Input
                    label="Amount"
                    type="number"
                    placeholder="0.001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />

                  <Input
                    label="Memo (optional)"
                    placeholder="Freelance payment..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Copy link + share */}
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono truncate"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)', color: 'var(--text-dim)' }}>
            {invoiceLink}
          </div>

          {/* Copy button morphs to checkmark */}
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative"
              >
                <Button variant="accent" size="md">
                  <Check size={14} />
                  Copied!
                </Button>
                {/* Ripple */}
                <motion.div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{ border: '2px solid var(--accent)' }}
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            ) : (
              <motion.div key="copy" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <Button variant="default" size="md" onClick={handleCopy}>
                  <Copy size={14} />
                  Copy Link
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Share */}
          <div className="relative">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowShare((v) => !v)}
            >
              <Share2 size={14} />
            </Button>
            <AnimatePresence>
              {showShare && (
                <motion.div
                  className="absolute right-0 top-full mt-2 flex gap-2 p-2 rounded-xl border"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 30, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {[
                    { icon: Twitter, label: 'Twitter' },
                    { icon: Link2, label: 'Copy' },
                  ].map(({ icon: Icon, label }) => (
                    <motion.button
                      key={label}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: 'var(--bg-border)', color: 'var(--text-secondary)' }}
                      whileHover={{ scale: 1.15 }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-border)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                      }}
                      title={label}
                    >
                      <Icon size={14} />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
