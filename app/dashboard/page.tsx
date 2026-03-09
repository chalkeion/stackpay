'use client';

import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import DashboardScreen from '@/components/screens/Dashboard';

export default function DashboardPage() {
  return (
    <motion.div
      key="dashboard"
      className="flex h-screen overflow-hidden"
      initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.15, filter: 'blur(8px)' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Sidebar />
      <main className="flex-1 overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <DashboardScreen />
      </main>
    </motion.div>
  );
}
