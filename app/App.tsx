import { Theme } from '@radix-ui/themes';
import { Outlet } from '@remix-run/react';
import { FC } from 'react';

import { EvmProvider } from './providers/EvmProvider';
import { OrderlyProvider } from './providers/OrderlyProvider';
import { SolanaProvider } from './providers/SolanaProvider';

import { NavBar } from '~/components';

export const App: FC = () => {
  return (
    <Theme
      appearance="dark"
      accentColor="iris"
      radius="small"
      className="w-full flex flex-col flex-items-center"
    >
      <EvmProvider>
        <SolanaProvider>
          <OrderlyProvider>
            <NavBar />
            <Outlet />
          </OrderlyProvider>
        </SolanaProvider>
      </EvmProvider>
    </Theme>
  );
};
