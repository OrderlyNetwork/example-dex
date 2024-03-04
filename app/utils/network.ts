import { ConnectedChain } from '@web3-onboard/core';

export function isTestnet(chain: ConnectedChain | null): boolean {
  if (!chain) return false;
  return !['0xa4b1', '0xa'].includes(chain.id);
}

export const supportedChains = [10, 42161, 421614, 11155420];
