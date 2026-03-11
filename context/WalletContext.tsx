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
  closeModal: () => void;
  refreshBalances: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

// Map wallet types → @stacks/connect provider IDs.
// Hiro was rebranded to Leather; both use the same provider.
const PROVIDER_IDS: Record<WalletType, string> = {
  hiro: 'LeatherProvider',
  leather: 'LeatherProvider',
  xverse: 'XverseProviders.BitcoinProvider',
};

const SBTC_CONTRACT = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ.sbtc-token';
const LS_ADDRESS = 'stackpay:address';
const LS_WALLET  = 'stackpay:wallet';

async function fetchBalances(address: string): Promise<{ stx: number; sbtc: number }> {
  try {
    const [stxRes, sbtcRes] = await Promise.all([
      fetch(`https://api.testnet.hiro.so/v2/accounts/${address}`),
      fetch(`https://api.testnet.hiro.so/v1/address/${address}/balances`),
    ]);
    const stxData  = await stxRes.json();
    const sbtcData = await sbtcRes.json();
    const stx      = parseInt(stxData.balance ?? '0', 10) / 1_000_000;
    const sbtcRaw  = sbtcData.fungible_tokens?.[SBTC_CONTRACT]?.balance;
    const sbtc     = sbtcRaw ? parseInt(sbtcRaw, 10) / 1e8 : 0;
    return { stx, sbtc };
  } catch {
    return { stx: 0, sbtc: 0 };
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address,          setAddress]          = useState<string | null>(null);
  const [stxBalance,       setStxBalance]       = useState<number | null>(null);
  const [sbtcBalance,      setSbtcBalance]      = useState<number | null>(null);
  const [isConnected,      setIsConnected]      = useState(false);
  const [isLoading,        setIsLoading]        = useState(false);
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<WalletType | null>(null);

  // Restore persisted session on mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_ADDRESS);
    if (saved) {
      setAddress(saved);
      setIsConnected(true);
      // Re-sync cookie in case it was cleared by browser
      document.cookie = 'stackpay_connected=1; path=/; max-age=86400';
      fetchBalances(saved).then(({ stx, sbtc }) => {
        setStxBalance(stx);
        setSbtcBalance(sbtc);
      });
    }
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    const { stx, sbtc } = await fetchBalances(address);
    setStxBalance(stx);
    setSbtcBalance(sbtc);
  }, [address]);

  const connect = useCallback(async (walletType: WalletType) => {
    setConnectingWallet(walletType);
    setIsLoading(true);

    // Point @stacks/connect at the right extension before calling getStacksProvider.
    setSelectedProviderId(PROVIDER_IDS[walletType]);

    try {
      // Get the provider DIRECTLY — this bypasses the @stacks/connect UI popup
      // entirely, so only the wallet extension's own native popup fires.
      const provider = getStacksProvider() as
        | { request: (method: string, params?: unknown) => Promise<{
            result?: { addresses?: Array<{ symbol?: string; address?: string }> };
            error?: { message?: string; code?: number };
          }> }
        | undefined
        | null;

      if (!provider) {
        throw new Error(
          `${walletType} wallet not found. Make sure it is installed and unlocked.`,
        );
      }

      // @stacks/connect internally translates 'getAddresses' → 'wallet_connect' for
      // Xverse (see pe() in the source). We must replicate that translation here since
      // we are calling the provider directly.
      const method = walletType === 'xverse' ? 'wallet_connect' : 'getAddresses';

      // provider.request(method, params) — returns { result: ..., error?: ... }
      const raw = await provider.request(method, undefined);

      if (!raw) throw new Error('Wallet returned no response.');
      if (raw.error) throw new Error(raw.error.message ?? 'Wallet error');

      // Extract addresses from result (mirrors @stacks/connect's Y() function)
      const addresses = raw.result?.addresses ?? [];

      // STX addresses start with 'S' (testnet: ST..., mainnet: SP...)
      const stxEntry = addresses.find(
        (a) => a.symbol === 'STX' || a.address?.startsWith('S'),
      );
      if (!stxEntry?.address) {
        throw new Error('Wallet did not return a Stacks address. Please try again.');
      }

      const addr = stxEntry.address;

      // Persist for session restore across page reloads
      localStorage.setItem(LS_ADDRESS, addr);
      localStorage.setItem(LS_WALLET,  walletType);
      localStorage.setItem('stackpay_connected', '1');
      document.cookie = 'stackpay_connected=1; path=/; max-age=86400';

      setAddress(addr);
      setIsConnected(true);
      setIsModalOpen(false);

      const { stx, sbtc } = await fetchBalances(addr);
      setStxBalance(stx);
      setSbtcBalance(sbtc);

    } catch (err) {
      // Re-throw so the modal can handle cancelled / error states
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
  const closeModal = useCallback(() => {
    if (!isLoading) setIsModalOpen(false);
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
