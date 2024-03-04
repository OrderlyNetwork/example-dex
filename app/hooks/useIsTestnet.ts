import { useSetChain } from '@web3-onboard/react';

import { isTestnet } from '~/utils/network';

export function useIsTestnet() {
  const [{ connectedChain }] = useSetChain();

  return isTestnet(connectedChain);
}
