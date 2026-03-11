'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import DashboardScreen from '@/components/screens/Dashboard';
import { usePageTransition } from '@/context/TransitionContext';

export default function DashboardPage() {
  const { wasConnectTransition, triggerBoot } = usePageTransition();

  useEffect(() => {
    // Only play boot animation on direct visit / refresh — not after connect transition
    if (!wasConnectTransition) {
      triggerBoot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      key="dashboard"
      className="flex h-screen overflow-hidden"
      // During connect transition, skip page entry animation — transition overlay handles reveal
      initial={wasConnectTransition ? { opacity: 1 } : { opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.15, filter: 'blur(8px)' }}
      transition={{ duration: wasConnectTransition ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Sidebar />
      <main className="flex-1 overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <DashboardScreen />
      </main>
    </motion.div>
  );
}
