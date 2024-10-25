import { ChainNamespace } from '@orderly.network/types';
import injectedModule from '@web3-onboard/injected-wallets';
import { init, Web3OnboardProvider } from '@web3-onboard/react';
import walletConnectModule from '@web3-onboard/walletconnect';
import React, { FC } from 'react';

import { supportedEvmChains } from '../utils';

const injected = injectedModule();
const walletConnect = walletConnectModule({
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  requiredChains: [10, 42161],
  optionalChains: [421614, 11155420],
  dappUrl: import.meta.env.VITE_WALLETCONNECT_DAPP_URL
});

const autoConnectLastWallet =
  typeof window !== 'undefined' &&
  window.localStorage.getItem('chain-namespace') === ChainNamespace.evm;

const web3Onboard = init({
  wallets: [injected, walletConnect],
  chains: supportedEvmChains.map(({ id, token, label, rpcUrl }) => ({
    id,
    token,
    label,
    rpcUrl
  })),
  appMetadata: {
    name: import.meta.env.VITE_NAME,
    description: import.meta.env.VITE_DESCRIPTION
  },
  accountCenter: {
    desktop: { enabled: false },
    mobile: { enabled: false }
  },
  connect: {
    autoConnectLastWallet
  }
});
export const EvmProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Web3OnboardProvider web3Onboard={web3Onboard}>{children}</Web3OnboardProvider>;
};
