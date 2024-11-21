import { DefaultEVMWalletAdapter } from '@orderly.network/default-evm-adapter';
import { DefaultSolanaWalletAdapter } from '@orderly.network/default-solana-adapter';
import { OrderlyConfigProvider } from '@orderly.network/hooks';
import { EthersProvider } from '@orderly.network/web3-provider-ethers';
import { FC } from 'react';

import { useIsTestnet } from '~/hooks';

export const OrderlyProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTestnet, networkChanged] = useIsTestnet();

  if (networkChanged && typeof window !== 'undefined') {
    setTimeout(() => {
      window.localStorage.setItem('networkId', isTestnet ? 'testnet' : 'mainnet');
      window.location.reload();
    }, 1_000);
  }

  return (
    <OrderlyConfigProvider
      networkId={isTestnet ? 'testnet' : 'mainnet'}
      brokerId={import.meta.env.VITE_BROKER_ID}
      brokerName={import.meta.env.VITE_BROKER_NAME}
      walletAdapters={[
        new DefaultEVMWalletAdapter(new EthersProvider()),
        new DefaultSolanaWalletAdapter()
      ]}
    >
      {children}
    </OrderlyConfigProvider>
  );
};
