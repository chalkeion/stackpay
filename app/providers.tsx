'use client';

import { AnimatePresence } from 'framer-motion';
import { WalletProvider } from '@/context/WalletContext';
import { WalletModal } from '@/components/wallet/WalletModal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <WalletModal />
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </WalletProvider>
  );
}
