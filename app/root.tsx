import { Theme } from '@radix-ui/themes';
import radixTheme from '@radix-ui/themes/styles.css?url';
import type { LinksFunction } from '@remix-run/node';
import { Links, Meta, Scripts, ScrollRestoration } from '@remix-run/react';
import injectedModule from '@web3-onboard/injected-wallets';
import { Web3OnboardProvider, init } from '@web3-onboard/react';
import walletConnectModule from '@web3-onboard/walletconnect';

import { Spinner } from './components';
import { supportedChains } from './utils';

import { App } from '~/App';
import globalCss from '~/global.css?url';
import uno from '~/styles/uno.css?url';

const injected = injectedModule();
const walletConnect = walletConnectModule({
  projectId: '5f4e967f02cf92c8db957c56e877e149',
  requiredChains: [10, 42161],
  optionalChains: [421614, 11155420],
  dappUrl: 'https://orderly-dex.pages.dev'
});

const web3Onboard = init({
  wallets: [injected, walletConnect],
  chains: supportedChains.map(({ id, token, label, rpcUrl }) => ({
    id,
    token,
    label,
    rpcUrl
  })),
  appMetadata: {
    name: 'Orderly DEX',
    description: 'Fully fledged example DEX using Orderly Network'
  },
  accountCenter: {
    desktop: { enabled: false },
    mobile: { enabled: false }
  },
  connect: {
    autoConnectLastWallet: true
  }
});

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: globalCss },
  {
    rel: 'stylesheet',
    href: radixTheme
  },
  { rel: 'stylesheet', href: uno }
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Orderly DEX</title>
        <Meta />
        <Links />
      </head>
      <body className="m5">
        <Theme
          appearance="dark"
          accentColor="iris"
          radius="small"
          className="flex flex-col flex-items-center"
        >
          <Web3OnboardProvider web3Onboard={web3Onboard}>{children}</Web3OnboardProvider>
        </Theme>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <App />;
}

export function HydrateFallback() {
  return <Spinner size="4rem" />;
}
