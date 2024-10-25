import { Theme } from '@radix-ui/themes';
import radixTheme from '@radix-ui/themes/styles.css?url';
import type { LinksFunction } from '@remix-run/node';
import { Links, Meta, Scripts, ScrollRestoration } from '@remix-run/react';
import solana from '@solana/wallet-adapter-react-ui/styles.css?url';

import { Spinner } from './components';

import { App } from '~/App';
import globalCss from '~/global.css?url';
import uno from '~/styles/uno.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: globalCss },
  {
    rel: 'stylesheet',
    href: radixTheme
  },
  { rel: 'stylesheet', href: uno },
  { rel: 'stylesheet', href: solana },
  { rel: 'icon', href: './assets/orderly.svg' }
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
          {children}
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
