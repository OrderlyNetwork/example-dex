import { OrderlyConfigProvider } from '@orderly.network/hooks';
import { Outlet } from '@remix-run/react';
import { FunctionComponent } from 'react';

import { NavBar } from '~/components';
import { useIsTestnet } from '~/hooks';

export const App: FunctionComponent = () => {
  const [isTestnet, networkChanged] = useIsTestnet();

  if (networkChanged && typeof window !== 'undefined') {
    window.localStorage.setItem('networkId', isTestnet ? 'testnet' : 'mainnet');
    window.location.reload();
  }

  return (
    <OrderlyConfigProvider networkId={isTestnet ? 'testnet' : 'mainnet'} brokerId="orderly">
      <NavBar />
      <Outlet />
    </OrderlyConfigProvider>
  );
};
