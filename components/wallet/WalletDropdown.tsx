'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Copy, Check, LogOut } from 'lucide-react';
import { useWalletContext } from '@/context/WalletContext';
import { usePageTransition } from '@/context/TransitionContext';

function truncate(addr: string) {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function WalletChip() {
  const { address, stxBalance, sbtcBalance, disconnect } = useWalletContext();
  const { triggerDisconnect } = usePageTransition();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* chip button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer',
          color: 'var(--text-primary)',
        }}
        whileHover={{
          background: 'rgba(241,90,34,0.08)',
          borderColor: 'rgba(241,90,34,0.3)',
        }}
        transition={{ duration: 0.15 }}
      >
        {/* green connected dot */}
        <motion.div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--green)',
          }}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <span
          style={{
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontSize: 13,
            color: 'var(--text-primary)',
          }}
        >
          {truncate(address ?? '')}
        </span>

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
        </motion.div>
      </motion.button>

      {/* dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="wallet-dropdown"
            initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 260,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(16px) saturate(180%)',
              border: '1px solid rgba(241,90,34,0.2)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5), 0 0 30px rgba(241,90,34,0.06)',
              padding: 12,
              zIndex: 200,
            }}
          >
            {/* full address row */}
            <div
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 4,
                }}
              >
                Testnet Address
              </div>
              <motion.button
                onClick={copyAddress}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  width: '100%',
                  textAlign: 'left',
                }}
                whileHover={{ opacity: 0.8 }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-ibm-plex-mono)',
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {address}
                </span>
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check size={12} style={{ color: 'var(--green)', flexShrink: 0 }} />
                    </motion.div>
                  ) : (
                    <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Copy size={12} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontFamily: 'var(--font-ibm-plex-mono)',
                    fontSize: 10,
                    color: 'var(--green)',
                    marginTop: 4,
                  }}
                >
                  Copied!
                </motion.div>
              )}
            </div>

            {/* balances */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 6,
                marginBottom: 8,
              }}
            >
              {[
                {
                  label: 'STX',
                  value: stxBalance !== null ? stxBalance.toFixed(2) : '—',
                },
                {
                  label: 'sBTC',
                  value: sbtcBalance !== null ? sbtcBalance.toFixed(6) : '—',
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-ibm-plex-mono)',
                      color: 'var(--text-dim)',
                      textTransform: 'uppercase',
                      marginBottom: 3,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-ibm-plex-mono)',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* disconnect */}
            <motion.button
              onClick={() => {
                setOpen(false);
                triggerDisconnect();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '9px 10px',
                borderRadius: 8,
                background: 'none',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-ibm-plex-mono)',
                fontSize: 13,
              }}
              whileHover={{
                background: 'rgba(239,68,68,0.08)',
                borderColor: 'rgba(239,68,68,0.3)',
                color: '#ef4444',
              }}
              transition={{ duration: 0.15 }}
            >
              <LogOut size={14} />
              Disconnect
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
