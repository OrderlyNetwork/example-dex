import { useAccount } from '@orderly.network/hooks';
import { ChainNamespace } from '@orderly.network/types';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { FC, useEffect, useMemo } from 'react';

import { ConnectWalletButton } from './ConnectWalletButton';
import { EvmDropdownMenu } from './EvmDropdownMenu';
import { SolanaDropdownMenu } from './SolanaDropdownMenu';

import { useSolanaNetwork } from '~/providers/SolanaProvider';

export const WalletConnection: FC = () => {
  const { account, state } = useAccount();
  const { setSolanaNetwork } = useSolanaNetwork();

  // EVM wallet setup
  const [{ wallet: evmWallet }] = useConnectWallet();
  const [{ connectedChain: connectedEvmChain }] = useSetChain();
  const evmAddress = useMemo(() => evmWallet?.accounts[0].address, [evmWallet]);
  useEffect(() => {
    if (!evmWallet || !connectedEvmChain || !evmAddress) return;
    window.localStorage.setItem('chain-namespace', ChainNamespace.evm);
    account
      .setAddress(evmAddress, {
        chain: {
          id: connectedEvmChain.id,
          namespace: ChainNamespace.evm
        },
        provider: evmWallet.provider,
        wallet: {
          name: evmWallet.label
        }
      })
      .then(() => {
        window.localStorage.setItem('chain-namespace', ChainNamespace.evm);
      });
  }, [account, evmWallet, evmAddress, connectedEvmChain]);

  // Solana wallet setup
  const { signMessage, sendTransaction, publicKey, wallet: solanaWallet } = useWallet();
  const { connection: solanaConnection } = useConnection();
  const solanaAddress = useMemo(() => {
    if (!publicKey) return;
    return publicKey.toBase58();
  }, [publicKey]);
  useEffect(() => {
    if (!solanaWallet || !solanaAddress) return;
    account
      .setAddress(solanaAddress, {
        chain: {
          id: 901901901,
          namespace: ChainNamespace.solana
        },
        provider: {
          signMessage,
          connection: solanaConnection,
          sendTransaction
        },
        wallet: {
          name: solanaWallet.adapter.name
        }
      })
      .then(() => {
        // TODO Solana mainnet
        setSolanaNetwork(WalletAdapterNetwork.Devnet);
        window.localStorage.setItem('chain-namespace', ChainNamespace.solana);
      });
  }, [
    solanaAddress,
    account,
    solanaConnection,
    signMessage,
    sendTransaction,
    solanaWallet,
    setSolanaNetwork
  ]);

  return account.address ? (
    state.chainNamespace === ChainNamespace.solana ? (
      <SolanaDropdownMenu />
    ) : (
      <EvmDropdownMenu />
    )
  ) : (
    <ConnectWalletButton />
  );
};
