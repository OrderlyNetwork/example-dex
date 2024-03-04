import { OrderlyConfigProvider } from '@orderly.network/hooks';
import { Outlet } from '@remix-run/react';
import { FunctionComponent } from 'react';

import { NavBar } from './components/NavBar';
import { useIsTestnet } from './hooks/useIsTestnet';

export const App: FunctionComponent = () => {
  const isTestnet = useIsTestnet();

  return (
    <OrderlyConfigProvider networkId={isTestnet ? 'testnet' : 'mainnet'} brokerId="orderly">
      <NavBar />
      <Outlet />
    </OrderlyConfigProvider>
  );
};
