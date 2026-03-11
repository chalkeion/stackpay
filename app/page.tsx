'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Landing from '@/components/screens/Landing';
import { usePageTransition } from '@/context/TransitionContext';

function LandingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeTransition, ctaPulse, setCTPulse } = usePageTransition();
  const [showAmberFlash, setShowAmberFlash] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (searchParams.get('auth') === '0') {
      // Amber flash + shake + CTA pulse
      setShowAmberFlash(true);
      setTimeout(() => setShowAmberFlash(false), 350);
      setShake(true);
      setTimeout(() => setShake(false), 350);
      setCTPulse(true);
      setTimeout(() => setCTPulse(false), 2500);
      // Remove param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router, setCTPulse]);

  const exitAnim =
    activeTransition === 'connect'
      ? { opacity: 0, transition: { duration: 0 } }
      : { opacity: 0, scale: 1.08, filter: 'blur(8px)' };

  return (
    <motion.div
      key="landing"
      initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
      animate={{
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        x: shake ? [0, -12, 12, -10, 10, -6, 6, 0] : 0,
      }}
      exit={exitAnim}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Amber flash overlay for unauthorized redirect */}
      <AnimatePresence>
        {showAmberFlash && (
          <motion.div
            key="amber"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: '#F59E0B',
              zIndex: 9998,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
      <Landing />
    </motion.div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <LandingContent />
    </Suspense>
  );
}
