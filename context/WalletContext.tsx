'use client';

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import {
  disconnect as stacksDisconnect,
  setSelectedProviderId,
  getStacksProvider,
} from '@stacks/connect';
import { fetchAccountBalances } from '@/lib/getUserAccountDetails';

export type WalletType = 'hiro' | 'leather' | 'xverse';

interface WalletContextValue {
  address: string | null;
  stxBalance: number | null;
  sbtcBalance: number | null;
  isConnected: boolean;
  isLoading: boolean;
  isModalOpen: boolean;
  connectingWallet: WalletType | null;
  connect: (walletType: WalletType) => Promise<void>;
  disconnect: () => void;
  openModal: () => void;
  closeModal: (force?: boolean) => void;
  refreshBalances: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const PROVIDER_IDS: Record<WalletType, string> = {
  hiro: 'LeatherProvider',
  leather: 'LeatherProvider',
  xverse: 'XverseProviders.BitcoinProvider',
};

const LS_ADDRESS = 'stackpay:address';
const LS_WALLET  = 'stackpay:wallet';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address,          setAddress]          = useState<string | null>(null);
  const [stxBalance,       setStxBalance]       = useState<number | null>(null);
  const [sbtcBalance,      setSbtcBalance]      = useState<number | null>(null);
  const [isConnected,      setIsConnected]      = useState(false);
  const [isLoading,        setIsLoading]        = useState(false);
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<WalletType | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LS_ADDRESS);
    if (saved) {
      setAddress(saved);
      setIsConnected(true);
      document.cookie = 'stackpay_connected=1; path=/; max-age=86400';
      fetchAccountBalances(saved).then(({ stx, sbtc }) => {
        setStxBalance(parseInt(stx, 10)/1_000_000);
        setSbtcBalance(parseInt(sbtc, 10)/1e8);
      });
    }
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    const { stx, sbtc } = await fetchAccountBalances(address);
    setStxBalance(parseInt(stx, 10)/1_000_000);
    setSbtcBalance(parseInt(sbtc, 10)/1e8);
  }, [address]);

  const connect = useCallback(async (walletType: WalletType) => {
    setConnectingWallet(walletType);
    setIsLoading(true);

    setSelectedProviderId(PROVIDER_IDS[walletType]);
    // ✅ Yield so provider ID propagates before getStacksProvider() reads it
    await new Promise(resolve => setTimeout(resolve, 0));

    try {
      const provider = getStacksProvider() as
        | { request: (method: string, params?: unknown) => Promise<{
            result?: { addresses?: Array<{ symbol?: string; type?: string; address?: string }> };
            error?: { message?: string; code?: number };
          }> }
        | undefined
        | null;

      if (!provider) {
        throw new Error(
          `${walletType} wallet not found. Make sure it is installed and unlocked.`,
        );
      }

      const method = walletType === 'xverse' ? 'wallet_connect' : 'getAddresses';
      const raw = await provider.request(method, undefined);

      if (!raw) throw new Error('Wallet returned no response.');
      if (raw.error) throw new Error(raw.error.message ?? 'Wallet error');

      const addresses = raw.result?.addresses ?? [];

      // ✅ Also handle Xverse which uses 'type' instead of 'symbol'
      const stxEntry = addresses.find(
        (a) =>
          a.symbol === 'STX' ||
          a.address?.startsWith('ST') ||  // testnet
          a.address?.startsWith('SP'),    // mainnet
      );

      if (!stxEntry?.address) {
        throw new Error('Wallet did not return a Stacks address. Please try again.');
      }

      const addr = stxEntry.address;

      localStorage.setItem(LS_ADDRESS, addr);
      localStorage.setItem(LS_WALLET,  walletType);
      localStorage.setItem('stackpay_connected', '1');
      document.cookie = 'stackpay_connected=1; path=/; max-age=86400';

      setAddress(addr);
      setIsConnected(true);
      setIsModalOpen(false);

      const { stx, sbtc } = await fetchAccountBalances(addr);
      setStxBalance(parseInt(stx, 10)/1_000_000);
      setSbtcBalance(parseInt(sbtc, 10)/1e8);

    } catch (err) {
      // ✅ Reset modal state on failure so user isn't stuck
      setIsModalOpen(false);
      throw err;
    } finally {
      setIsLoading(false);
      setConnectingWallet(null);
    }
  }, []);

  const disconnect = useCallback(() => {
    try { stacksDisconnect(); } catch { /* ignore */ }
    localStorage.removeItem(LS_ADDRESS);
    localStorage.removeItem(LS_WALLET);
    localStorage.removeItem('stackpay_connected');
    document.cookie = 'stackpay_connected=; path=/; max-age=0';
    setAddress(null);
    setStxBalance(null);
    setSbtcBalance(null);
    setIsConnected(false);
  }, []);

  const openModal  = useCallback(() => setIsModalOpen(true), []);
  // ✅ Added force param so modal can always be dismissed if wallet hangs
  const closeModal = useCallback((force = false) => {
    if (!isLoading || force) setIsModalOpen(false);
  }, [isLoading]);

  return (
    <WalletContext.Provider
      value={{
        address,
        stxBalance,
        sbtcBalance,
        isConnected,
        isLoading,
        isModalOpen,
        connectingWallet,
        connect,
        disconnect,
        openModal,
        closeModal,
        refreshBalances,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWalletContext must be used within WalletProvider');
  return ctx;
}