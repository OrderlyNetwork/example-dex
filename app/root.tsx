import { OrderlyConfigProvider } from '@orderly.network/hooks';
import * as RadixTheme from '@radix-ui/themes';
import radixTheme from '@radix-ui/themes/styles.css';
import { cssBundleHref } from '@remix-run/css-bundle';
import type { LinksFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import injectedModule from '@web3-onboard/injected-wallets';
import { Web3OnboardProvider, init } from '@web3-onboard/react';
import walletConnectModule from '@web3-onboard/walletconnect';

import { WalletConnection } from './components/WalletConnection';

const { Theme } = RadixTheme;

const injected = injectedModule();
const walletConnect = walletConnectModule({
  projectId: '5f4e967f02cf92c8db957c56e877e149',
  requiredChains: [10, 42161],
  optionalChains: [421614, 11155420],
  dappUrl: 'https://orderlynetwork.github.io/example-dex'
});

const web3Onboard = init({
  wallets: [injected, walletConnect],
  chains: [
    {
      id: '0xa4b1',
      token: 'ETH',
      label: 'Arbitrum One',
      rpcUrl: 'https://arbitrum-one.publicnode.com'
    },
    {
      id: '0xa',
      token: 'ETH',
      label: 'OP Mainnet',
      rpcUrl: 'https://mainnet.optimism.io'
    },
    {
      id: '0x66eee',
      token: 'ETH',
      label: 'Arbitrum Sepolia',
      rpcUrl: 'https://arbitrum-sepolia.publicnode.com'
    },
    {
      id: '0xaa37dc',
      token: 'ETH',
      label: 'OP Sepolia',
      rpcUrl: 'https://optimism-sepolia.publicnode.com'
    }
  ],
  appMetadata: {
    name: 'Orderly DEX',
    description: 'Fully fledged example DEX using Orderly Network'
  },
  accountCenter: {
    desktop: { enabled: false },
    mobile: { enabled: false }
  }
});

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  {
    rel: 'stylesheet',
    href: radixTheme
  }
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Theme>
          <Web3OnboardProvider web3Onboard={web3Onboard}>
            <OrderlyConfigProvider networkId="testnet" brokerId="orderly">
              <WalletConnection />
              <Outlet />
            </OrderlyConfigProvider>
          </Web3OnboardProvider>
        </Theme>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
