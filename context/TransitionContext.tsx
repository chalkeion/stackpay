'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

export type TransitionType = 'connect' | 'boot' | 'disconnect' | null;

interface TransitionContextValue {
  activeTransition: TransitionType;
  origin: { x: number; y: number };
  wasConnectTransition: boolean;
  ctaPulse: boolean;
  storeOrigin: (x: number, y: number) => void;
  triggerConnect: () => void;
  triggerBoot: () => void;
  triggerDisconnect: () => void;
  completeTransition: () => void;
  setCTPulse: (v: boolean) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [activeTransition, setActiveTransition] = useState<TransitionType>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [wasConnectTransition, setWasConnectTransition] = useState(false);
  const [ctaPulse, setCTPulse] = useState(false);
  const bootPlayedRef = useRef(false);

  const storeOrigin = useCallback((x: number, y: number) => {
    setOrigin({ x, y });
  }, []);

  const triggerConnect = useCallback(() => {
    setWasConnectTransition(true);
    setActiveTransition('connect');
    // Navigate immediately — dashboard loads in background during Phase 1
    router.push('/dashboard');
  }, [router]);

  const triggerBoot = useCallback(() => {
    if (bootPlayedRef.current) return;
    bootPlayedRef.current = true;
    setActiveTransition('boot');
  }, []);

  const triggerDisconnect = useCallback(() => {
    setActiveTransition('disconnect');
  }, []);

  const completeTransition = useCallback(() => {
    setActiveTransition(null);
    setWasConnectTransition(false);
  }, []);

  return (
    <TransitionContext.Provider
      value={{
        activeTransition,
        origin,
        wasConnectTransition,
        ctaPulse,
        storeOrigin,
        triggerConnect,
        triggerBoot,
        triggerDisconnect,
        completeTransition,
        setCTPulse,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error('usePageTransition must be used within TransitionProvider');
  return ctx;
}
