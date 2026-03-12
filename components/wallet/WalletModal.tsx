'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ExternalLink } from 'lucide-react';
import { useWalletContext, type WalletType } from '@/context/WalletContext';
import { usePageTransition } from '@/context/TransitionContext';

/* ─── wallet config ─────────────────────────────────────────────── */

const INSTALL_LINKS: Record<WalletType, string> = {
  hiro: 'https://wallet.hiro.so',
  leather: 'https://leather.io',
  xverse: 'https://xverse.app',
};

const WALLETS: {
  type: WalletType;
  name: string;
  description: string;
  detectKey: string;
  bgColor: string;
  fgColor: string;
  letter: string;
}[] = [
  {
    type: 'hiro',
    name: 'Hiro Wallet',
    description: 'The original Stacks wallet',
    detectKey: 'HiroWalletProvider',
    bgColor: '#F15A22',
    fgColor: '#fff',
    letter: 'H',
  },
  {
    type: 'leather',
    name: 'Leather',
    description: 'Bitcoin and Stacks, together',
    detectKey: 'LeatherProvider',
    bgColor: '#12100F',
    fgColor: '#F5F1ED',
    letter: 'L',
  },
  {
    type: 'xverse',
    name: 'Xverse',
    description: 'Mobile-first Bitcoin wallet',
    detectKey: 'XverseProviders',
    bgColor: '#171717',
    fgColor: '#ffffff',
    letter: 'X',
  },
];

/* ─── wallet icon ────────────────────────────────────────────────── */

function WalletIcon({
  bgColor,
  fgColor,
  letter,
}: {
  bgColor: string;
  fgColor: string;
  letter: string;
}) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-syne)',
        fontWeight: 700,
        fontSize: 20,
        color: fgColor,
        flexShrink: 0,
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {letter}
    </div>
  );
}

/* ─── spinner ─────── */

function Spinner() {
  return (
    <motion.div
      style={{
        width: 16,
        height: 16,
        border: '2px solid rgba(241,90,34,0.3)',
        borderTopColor: '#F15A22',
        borderRadius: '50%',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  );
}

/* ─── main modal ─────────────────────────────────────────────────── */

export function WalletModal() {
  const { isModalOpen, closeModal, connect, connectingWallet, isLoading } = useWalletContext();
  const { triggerConnect } = usePageTransition();

  const [detected, setDetected] = useState<Record<WalletType, boolean>>({
    hiro: false,
    leather: false,
    xverse: false,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      const w = window as Window & {
        HiroWalletProvider?: unknown;
        LeatherProvider?: unknown;
        XverseProviders?: unknown;
      };
      const hasLeather = !!w.LeatherProvider;
      setDetected({
        hiro: !!w.HiroWalletProvider && !hasLeather,
        leather: hasLeather,
        xverse: !!w.XverseProviders,
      });
    }
  }, [isModalOpen]);

  const handleWalletClick = async (walletType: WalletType) => {
    if (isLoading) return;
    setErrorMsg(null);
    if (!detected[walletType]) {
      window.open(INSTALL_LINKS[walletType], '_blank', 'noopener,noreferrer');
      return;
    }
    try {
      await connect(walletType);
      // Connection successful — trigger the portal transition
      triggerConnect();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed. Please try again.';
      if (!msg.toLowerCase().includes('cancel') && !msg.toLowerCase().includes('reject')) {
        setErrorMsg(msg);
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 + i * 0.07,
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <>
      {/* ── backdrop ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="wallet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => closeModal()}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9000,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(4px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── modal container ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          padding: '16px',
        }}
      >
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              key="wallet-modal"
              initial={{ scale: 0.85, opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ scale: 0.9, opacity: 0, filter: 'blur(8px)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                position: 'relative',
                borderRadius: 21,
                padding: 1,
                overflow: 'hidden',
                width: 480,
                maxWidth: '100%',
                pointerEvents: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* rotating gradient border */}
              <motion.div
                aria-hidden
                style={{
                  position: 'absolute',
                  width: '200%',
                  height: '200%',
                  top: '-50%',
                  left: '-50%',
                  background:
                    'conic-gradient(from 0deg, transparent 0%, rgba(241,90,34,0.3) 30%, transparent 60%)',
                  zIndex: 0,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />

              {/* modal card */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  boxShadow:
                    '0 0 80px rgba(241,90,34,0.12), 0 25px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
                  padding: '28px',
                }}
              >
                {/* header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontFamily: 'var(--font-syne)',
                        fontWeight: 700,
                        fontSize: 22,
                        color: 'var(--text-primary)',
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      Connect Wallet
                    </h2>
                    <p
                      style={{
                        fontFamily: 'var(--font-ibm-plex-mono)',
                        fontSize: 14,
                        color: 'var(--text-secondary)',
                        margin: '6px 0 0',
                      }}
                    >
                      Choose your Stacks wallet to continue
                    </p>
                  </div>

                  <motion.button
                    onClick={() => closeModal()}
                    disabled={isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      color: 'var(--text-secondary)',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 8,
                      flexShrink: 0,
                    }}
                    whileHover={{ color: '#F15A22' }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>

                {/* wallet cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {WALLETS.map((wallet, i) => {
                    const isThisConnecting = connectingWallet === wallet.type;
                    const isInstalled = detected[wallet.type];
                    const isDisabled = isLoading;

                    return (
                      <motion.button
                        key={wallet.type}
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        onClick={() => handleWalletClick(wallet.type)}
                        disabled={isDisabled}
                        whileHover={
                          !isDisabled
                            ? {
                                y: -2,
                                borderColor: 'rgba(241,90,34,0.5)',
                                boxShadow: '0 0 20px rgba(241,90,34,0.1)',
                              }
                            : {}
                        }
                        whileTap={!isDisabled ? { scale: 0.97 } : {}}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          padding: '14px 16px',
                          borderRadius: 12,
                          background: isThisConnecting
                            ? 'rgba(241,90,34,0.06)'
                            : 'rgba(255,255,255,0.04)',
                          border: isThisConnecting
                            ? '1px solid rgba(241,90,34,0.4)'
                            : '1px solid rgba(255,255,255,0.06)',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          opacity: isLoading && !isThisConnecting ? 0.5 : 1,
                          transition: 'background 0.2s, opacity 0.2s',
                          width: '100%',
                          textAlign: 'left',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* orange glow on click */}
                        {isThisConnecting && (
                          <motion.div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background:
                                'radial-gradient(circle at 50% 50%, rgba(241,90,34,0.15), transparent 70%)',
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}

                        <WalletIcon
                          bgColor={wallet.bgColor}
                          fgColor={wallet.fgColor}
                          letter={wallet.letter}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: 'var(--font-syne)',
                              fontWeight: 500,
                              fontSize: 16,
                              color: 'var(--text-primary)',
                              lineHeight: 1.3,
                            }}
                          >
                            {wallet.name}
                          </div>
                          <div
                            style={{
                              fontFamily: 'var(--font-ibm-plex-mono)',
                              fontSize: 12,
                              color: 'var(--text-secondary)',
                              marginTop: 2,
                            }}
                          >
                            {wallet.description}
                          </div>
                        </div>

                        {/* right side state */}
                        <div
                          style={{
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          {isThisConnecting ? (
                            <Spinner />
                          ) : !isInstalled ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 8px',
                                borderRadius: 6,
                                background: 'rgba(245,158,11,0.12)',
                                border: '1px solid rgba(245,158,11,0.25)',
                              }}
                            >
                              <ExternalLink size={10} style={{ color: '#F59E0B' }} />
                              <span
                                style={{
                                  fontFamily: 'var(--font-ibm-plex-mono)',
                                  fontSize: 10,
                                  color: '#F59E0B',
                                  fontWeight: 500,
                                }}
                              >
                                Not installed
                              </span>
                            </div>
                          ) : (
                            <motion.span
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              style={{
                                fontFamily: 'var(--font-ibm-plex-mono)',
                                fontSize: 12,
                                color: 'var(--accent)',
                                opacity: 0,
                              }}
                            >
                              Connect →
                            </motion.span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* error message */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        marginTop: 12,
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        fontFamily: 'var(--font-ibm-plex-mono)',
                        fontSize: 12,
                        color: '#f87171',
                      }}
                    >
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* footer */}
                <div
                  style={{
                    marginTop: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    justifyContent: 'center',
                  }}
                >
                  <Lock size={11} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <p
                    style={{
                      fontFamily: 'var(--font-ibm-plex-mono)',
                      fontSize: 11,
                      color: 'var(--text-dim)',
                      margin: 0,
                    }}
                  >
                    <span style={{ color: 'var(--accent)' }}>Non-custodial.</span>{' '}
                    We never access your funds.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
