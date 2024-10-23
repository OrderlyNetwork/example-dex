import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import { cjsInterop } from 'vite-plugin-cjs-interop';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3000
  },
  base: process.env.BASE ?? '/',
  ssr: {
    noExternal: [/^@orderly.*$/]
  },
  plugins: [
    remix({
      ssr: false,
      ignoredRouteFiles: ['**/*.css'],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true
      },
      basename: process.env.BASE ?? '/'
    }),
    tsconfigPaths(),
    nodePolyfills({
      include: ['buffer', 'crypto']
    }),
    cjsInterop({
      dependencies: ['bs58', '@coral-xyz/anchor', 'use-constant']
    })
  ]
});
