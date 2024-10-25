import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import type { Chain } from '@web3-onboard/common';

export function isTestnet(chainId?: string | number): boolean {
  const evmNetwork = supportedEvmChains.find(({ id }) => Number(id) === Number(chainId))?.network;
  if (evmNetwork != null) {
    return evmNetwork === 'testnet';
  }
  return (
    supportedSolanaChains.find(({ id }) => Number(id) === Number(chainId))?.network === 'testnet'
  );
}

type SupportedEvmChain = Chain & { network: 'mainnet' | 'testnet'; icon: string };
type SupportedSolanaChain = Omit<SupportedEvmChain, 'rpcUrl' | 'network'> & {
  network: WalletAdapterNetwork;
};

export const supportedEvmChains: SupportedEvmChain[] = [
  {
    network: 'mainnet',
    icon: './assets/ethereum.svg',
    id: '0x1',
    token: 'ETH',
    label: 'Ethereum',
    rpcUrl: 'https://arbitrum-one.publicnode.com'
  },
  {
    network: 'mainnet',
    icon: './assets/arbitrum.svg',
    id: '0xa4b1',
    token: 'ETH',
    label: 'Arbitrum One',
    rpcUrl: 'https://ethereum-rpc.publicnode.com'
  },
  {
    network: 'mainnet',
    icon: './assets/optimism.svg',
    id: '0xa',
    token: 'ETH',
    label: 'OP Mainnet',
    rpcUrl: 'https://mainnet.optimism.io'
  },
  {
    network: 'mainnet',
    icon: './assets/base.svg',
    id: '0x2105',
    token: 'ETH',
    label: 'Base',
    rpcUrl: 'https://base-rpc.publicnode.com'
  },
  {
    network: 'testnet',
    icon: './assets/sepolia.svg',
    id: '0xaa36a7',
    token: 'ETH',
    label: 'Sepolia',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
  },
  {
    network: 'testnet',
    icon: './assets/arbitrum_sepolia.svg',
    id: '0x66eee',
    token: 'ETH',
    label: 'Arbitrum Sepolia',
    rpcUrl: 'https://arbitrum-sepolia.publicnode.com'
  },
  {
    network: 'testnet',
    icon: './assets/optimism_sepolia.svg',
    id: '0xaa37dc',
    token: 'ETH',
    label: 'OP Sepolia',
    rpcUrl: 'https://optimism-sepolia.publicnode.com'
  },
  {
    network: 'testnet',
    icon: './assets/base_sepolia.svg',
    id: '0x14a34',
    token: 'ETH',
    label: 'Base Sepolia',
    rpcUrl: 'https://base-sepolia-rpc.publicnode.com'
  }
];

export const supportedEvmChainIds = supportedEvmChains.map(({ id }) => Number(id));

export const supportedSolanaChains: SupportedSolanaChain[] = [
  {
    network: WalletAdapterNetwork.Devnet,
    icon: './assets/solana_devnet.svg',
    id: '901901901',
    token: 'SOL',
    label: 'Solana Devnet'
  }
];

export const supportedSolanaChainIds = supportedSolanaChains.map(({ id }) => Number(id));
