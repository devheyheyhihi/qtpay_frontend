export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  privateKey: string | null;
  mnemonic: string | null;
  isLoading: boolean;
  isHydrated: boolean;
}

export interface WalletContextType {
  walletState: WalletState;
  connectWallet: (
    method: 'create' | 'import',
    options?: { mnemonic?: string; privateKey?: string; keyFile?: File }
  ) => Promise<WalletState | null>;
  disconnectWallet: () => void;
  updateBalance: () => Promise<void>;
  createWallet: () => Promise<WalletState | null>;
  importFromMnemonic: (mnemonic: string) => Promise<WalletState | null>;
  importFromKeyFile: (file: File) => Promise<WalletState | null>;
  sendTransaction: (to: string, amount: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
}

export interface WalletInfo {
  wallet: {
    address: string;
    private_key: string;
    mnemonic: string;
  };
}

