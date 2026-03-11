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
  disconnectPhase: number;
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
  const [disconnectPhase, setDisconnectPhase] = useState(0);
  const bootPlayedRef = useRef(false);
  const disconnectTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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
    setDisconnectPhase(1);
    const timers = [
      setTimeout(() => setDisconnectPhase(2), 150),
      setTimeout(() => setDisconnectPhase(3), 400),
      setTimeout(() => setDisconnectPhase(4), 650),
      setTimeout(() => setDisconnectPhase(5), 800),
    ];
    disconnectTimersRef.current = timers;
  }, []);

  const completeTransition = useCallback(() => {
    setActiveTransition(null);
    setWasConnectTransition(false);
    setDisconnectPhase(0);
    disconnectTimersRef.current.forEach(clearTimeout);
    disconnectTimersRef.current = [];
  }, []);

  return (
    <TransitionContext.Provider
      value={{
        activeTransition,
        origin,
        wasConnectTransition,
        ctaPulse,
        disconnectPhase,
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
