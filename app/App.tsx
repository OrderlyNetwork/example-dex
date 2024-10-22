import { DefaultEVMAdapterWalletAdapter } from '@orderly.network/default-evm-adapter';
import { OrderlyConfigProvider } from '@orderly.network/hooks';
import { EthersProvider } from '@orderly.network/web3-provider-ethers';
import { Outlet } from '@remix-run/react';
import { FC } from 'react';

import { NavBar } from '~/components';
import { useIsTestnet } from '~/hooks';

export const App: FC = () => {
  const [isTestnet, networkChanged] = useIsTestnet();

  if (networkChanged && typeof window !== 'undefined') {
    window.localStorage.setItem('networkId', isTestnet ? 'testnet' : 'mainnet');
    window.location.reload();
  }

  return (
    <OrderlyConfigProvider
      networkId={isTestnet ? 'testnet' : 'mainnet'}
      brokerId="orderly"
      brokerName="Orderly Network"
      walletAdapters={[new DefaultEVMAdapterWalletAdapter(new EthersProvider())]}
    >
      <NavBar />
      <Outlet />
    </OrderlyConfigProvider>
  );
};
