'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Send as SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const RECENT_RECIPIENTS = [
  { label: 'SP3KN', color: '#F15A22' },
  { label: 'SP7MN', color: '#3B82F6' },
  { label: 'SP1NA', color: '#22C55E' },
  { label: 'SP8XZ', color: '#F59E0B' },
];

const BTC_USD_RATE = 100000;
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function scramble(target: string, step: number): string {
  return target
    .split('')
    .map((c, i) => {
      if (i < step) return c;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    })
    .join('');
}

export default function SendScreen() {
  const [address, setAddress] = useState('');
  const [displayAddress, setDisplayAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const scrambleRef = useRef<ReturnType<typeof setInterval>>();

  const usd = amount ? (parseFloat(amount) * BTC_USD_RATE).toFixed(2) : '0.00';

  const onAddressFocus = () => {
    if (!address) return;
    let step = 0;
    clearInterval(scrambleRef.current);
    scrambleRef.current = setInterval(() => {
      setDisplayAddress(scramble(address, step));
      step++;
      if (step > address.length) {
        clearInterval(scrambleRef.current);
        setDisplayAddress(address);
      }
    }, 30);
  };

  useEffect(() => {
    setDisplayAddress(address);
    return () => clearInterval(scrambleRef.current);
  }, [address]);

  const handleSend = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto max-w-xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-syne)', color: 'var(--text-primary)' }}
        >
          Send Payment
        </h1>
        <p className="text-xs mb-8" style={{ color: 'var(--text-secondary)' }}>
          Send sBTC to any Stacks address instantly.
        </p>

        {/* Recent recipients */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
            Recent
          </div>
          <div className="flex gap-3">
            {RECENT_RECIPIENTS.map((r) => (
              <motion.button
                key={r.label}
                className="flex flex-col items-center gap-1.5 cursor-pointer"
                whileHover={{ y: -3 }}
                onClick={() => setAddress(`${r.label}...XXX`)}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: r.color }}
                >
                  {r.label.slice(0, 2)}
                </div>
                <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
                  {r.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Form */}
        <Card className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider block mb-1.5"
              style={{ color: 'var(--text-secondary)' }}>
              Recipient Address
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 focus:outline-none"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--bg-border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-ibm-plex-mono)',
              }}
              placeholder="SP..."
              value={displayAddress}
              onChange={(e) => setAddress(e.target.value)}
              onFocus={onAddressFocus}
              onBlur={() => setDisplayAddress(address)}
            />
          </div>

          <div>
            <Input
              label="Amount (sBTC)"
              type="number"
              placeholder="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-bold"
              style={{ fontFamily: 'var(--font-syne)', color: 'var(--accent)' } as React.CSSProperties}
            />
            <motion.div
              className="mt-1.5 text-xs font-mono"
              style={{ color: 'var(--text-secondary)' }}
              animate={{ opacity: amount ? 1 : 0.4 }}
            >
              ≈ ${usd} USD
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                className="flex items-center justify-center gap-3 py-3 rounded-lg"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid var(--green)' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.4, type: 'spring' }}
                >
                  <CheckCircle2 size={20} style={{ color: 'var(--green)' }} />
                </motion.div>
                <span className="text-sm font-semibold" style={{ color: 'var(--green)' }}>
                  Payment sent!
                </span>
              </motion.div>
            ) : (
              <motion.div key="send-btn" exit={{ opacity: 0 }}>
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full"
                  disabled={!address || !amount}
                  onClick={handleSend}
                >
                  <SendIcon size={16} />
                  Send {amount || '0'} sBTC
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
