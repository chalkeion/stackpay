'use client';

import { AnimatePresence } from 'framer-motion';
import { WalletProvider } from '@/context/WalletContext';
import { WalletModal } from '@/components/wallet/WalletModal';
import { TransitionProvider } from '@/context/TransitionContext';
import { DashboardTransition } from '@/components/animations/DashboardTransition';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TransitionProvider>
      <WalletProvider>
        <WalletModal />
        <DashboardTransition />
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </WalletProvider>
    </TransitionProvider>
  );
}
