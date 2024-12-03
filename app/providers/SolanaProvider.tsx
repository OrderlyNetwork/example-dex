import { ChainNamespace } from '@orderly.network/types';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, WalletConnectWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import React, {
  Context,
  createContext,
  Dispatch,
  FC,
  SetStateAction,
  useContext,
  useMemo,
  useState
} from 'react';

export type SolanaNetworkContextType = {
  solanaNetwork: WalletAdapterNetwork;
  setSolanaNetwork: Dispatch<SetStateAction<WalletAdapterNetwork>>;
};
const SolanaNetworkContext = createContext<SolanaNetworkContextType | null>(null);

export const useSolanaNetwork = () =>
  useContext<SolanaNetworkContextType>(SolanaNetworkContext as Context<SolanaNetworkContextType>);

const autoConnect =
  typeof window !== 'undefined' &&
  window.localStorage.getItem('chain-namespace') === ChainNamespace.solana;

export const SolanaProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const networkId =
    (window.localStorage.getItem('networkId') as 'testnet' | 'mainnet') ?? 'mainnet';

  const [network, setNetwork] = useState(
    networkId === 'testnet' ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet
  );

  const endPoint = useMemo(
    () =>
      network === WalletAdapterNetwork.Devnet
        ? clusterApiUrl(network)
        : 'https://mainnet.helius-rpc.com/?api-key=4cdab4eb-eefe-4790-a0d6-45f66f2ddba5',
    [network]
  );
  const wallets = useMemo(() => {
    return [
      new PhantomWalletAdapter(),
      new WalletConnectWalletAdapter({
        network: network as WalletAdapterNetwork.Mainnet | WalletAdapterNetwork.Devnet,
        options: {
          projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
          metadata: {
            name: import.meta.env.VITE_NAME,
            description: import.meta.env.VITE_DESCRIPTION,
            icons: [
              'https://raw.githubusercontent.com/OrderlyNetwork/broker-registration/refs/heads/master/public/icon.svg'
            ],
            url: import.meta.env.VITE_WALLETCONNECT_DAPP_URL
          }
        }
      })
    ];
  }, [network]);

  return (
    <SolanaNetworkContext.Provider value={{ solanaNetwork: network, setSolanaNetwork: setNetwork }}>
      <ConnectionProvider endpoint={endPoint}>
        <WalletProvider wallets={wallets} autoConnect={autoConnect}>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SolanaNetworkContext.Provider>
  );
};
