import { useAccount } from '@orderly.network/hooks';
import { ChainNamespace } from '@orderly.network/types';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { FC, useEffect, useMemo } from 'react';

import { ConnectWalletButton } from './ConnectWalletButton';
import { EvmDropdownMenu } from './EvmDropdownMenu';
import { SolanaDropdownMenu } from './SolanaDropdownMenu';

import { useIsTestnet } from '~/hooks';
import { useSolanaNetwork } from '~/providers/SolanaProvider';

export const WalletConnection: FC = () => {
  const { account, state } = useAccount();
  const [isTestnet] = useIsTestnet();

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
  const { setSolanaNetwork } = useSolanaNetwork();
  const { signMessage, sendTransaction, publicKey, wallet: solanaWallet } = useWallet();
  const { connection: solanaConnection } = useConnection();
  const solanaAddress = useMemo(() => {
    if (!publicKey) return;
    return publicKey.toBase58();
  }, [publicKey]);
  useEffect(() => {
    if (!solanaWallet || !solanaAddress) return;
    if (solanaAddress !== account.address) {
      account
        .setAddress(solanaAddress, {
          chain: {
            id: isTestnet ? 901901901 : 900900900,
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
          setSolanaNetwork(isTestnet ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet);
          window.localStorage.setItem('chain-namespace', ChainNamespace.solana);
        });
    } else {
      account.switchChainId(isTestnet ? 901901901 : 900900900);
      setSolanaNetwork(isTestnet ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet);
    }
  }, [
    solanaAddress,
    account,
    solanaConnection,
    signMessage,
    sendTransaction,
    solanaWallet,
    setSolanaNetwork,
    isTestnet
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
