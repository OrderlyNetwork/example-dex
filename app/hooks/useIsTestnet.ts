import { useSetChain } from '@web3-onboard/react';
import { useEffect, useState } from 'react';

import { isTestnet } from '~/utils';

export function useIsTestnet() {
  const [networkId, setNetworkId] = useState<'testnet' | 'mainnet'>();
  const [{ connectedChain }] = useSetChain();

  let testnet: boolean;
  if (connectedChain != null) {
    testnet = isTestnet(connectedChain);
  } else if (typeof window !== 'undefined') {
    testnet = window.localStorage.getItem('networkId') === 'testnet';
  } else {
    testnet = false;
  }
  const networkChanged =
    (testnet && networkId === 'mainnet') || (!testnet && networkId === 'testnet');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNetworkId(
        (window.localStorage.getItem('networkId') as 'testnet' | 'mainnet') ?? 'mainnet'
      );
    }
  }, []);

  useEffect(() => {
    if (connectedChain == null) return;
    setNetworkId(testnet ? 'testnet' : 'mainnet');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedChain]);

  return [testnet, networkChanged];
}
