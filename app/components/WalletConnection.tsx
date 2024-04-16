import { useAccount } from '@orderly.network/hooks';
import { Button, DropdownMenu } from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { FC, useEffect } from 'react';

export const WalletConnection: FC = () => {
  const { account } = useAccount();
  const [{ wallet }, connectWallet, disconnectWallet] = useConnectWallet();
  const [{ connectedChain }, setChain] = useSetChain();

  useEffect(() => {
    if (!wallet) return;
    account.setAddress(wallet.accounts[0].address, {
      provider: wallet.provider,
      chain: {
        id: wallet.chains[0].id
      }
    });
  }, [wallet, account]);

  let chainIcon;
  switch (connectedChain?.id) {
    case '0xa4b1':
      chainIcon = '/assets/arbitrum.svg';
      break;
    case '0xa':
      chainIcon = '/assets/optimism.svg';
      break;
    case '0x66eee':
      chainIcon = '/assets/arbitrum_sepolia.svg';
      break;
    case '0xaa37dc':
      chainIcon = '/assets/optimism_sepolia.svg';
      break;
    default:
      chainIcon = '/assets/questionmark.svg';
  }

  const selectChain = (chainId: string) => () => {
    setChain({
      chainId
    });
  };

  return wallet ? (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button>
          <img
            src={chainIcon}
            alt="connected chain"
            style={{ marginRight: '0.3rem', height: '1.8rem' }}
          />
          {`${wallet.accounts[0].address.substring(
            0,
            6
          )}...${wallet.accounts[0].address.substr(-4)}`}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Mainnet</DropdownMenu.Label>
        <DropdownMenu.Item
          onSelect={selectChain('0xa4b1')}
          style={{
            backgroundColor: connectedChain?.id === '0xa4b1' ? 'lightgrey' : undefined,
            color: connectedChain?.id === '0xa4b1' ? 'black' : undefined,
            fontWeight: connectedChain?.id === '0xa4b1' ? '600' : undefined
          }}
        >
          <img
            src="/assets/arbitrum.svg"
            alt="Arbitrum"
            style={{ marginRight: '0.3rem', height: '1.8rem' }}
          />
          Arbitrum One
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={selectChain('0xa')}
          style={{
            backgroundColor: connectedChain?.id === '0xa' ? 'lightgrey' : undefined,
            color: connectedChain?.id === '0xa' ? 'black' : undefined,
            fontWeight: connectedChain?.id === '0xa' ? '600' : undefined
          }}
        >
          <img
            src="/assets/optimism.svg"
            alt="Optimism"
            style={{ marginRight: '0.3rem', height: '1.8rem' }}
          />
          OP Mainnet
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Label>Testnet</DropdownMenu.Label>
        <DropdownMenu.Item
          onSelect={selectChain('0x66eee')}
          style={{
            backgroundColor: connectedChain?.id === '0x66eee' ? 'lightgrey' : undefined,
            color: connectedChain?.id === '0x66eee' ? 'black' : undefined,
            fontWeight: connectedChain?.id === '0x66eee' ? '600' : undefined
          }}
        >
          <img
            src="/assets/arbitrum_sepolia.svg"
            alt="Arbitrum Sepolia"
            style={{ marginRight: '0.3rem', height: '1.8rem' }}
          />
          Arbitrum Sepolia
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={selectChain('0xaa37dc')}
          style={{
            backgroundColor: connectedChain?.id === '0xaa37dc' ? 'lightgrey' : undefined,
            color: connectedChain?.id === '0xaa37dc' ? 'black' : undefined,
            fontWeight: connectedChain?.id === '0xaa37dc' ? '600' : undefined
          }}
        >
          <img
            src="/assets/optimism_sepolia.svg"
            alt="Optimism Sepolia"
            style={{ marginRight: '0.3rem', height: '1.8rem' }}
          />
          OP Sepolia
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onSelect={() => {
            disconnectWallet({ label: wallet.label });
          }}
        >
          Disconnect
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  ) : (
    <Button
      onClick={async () => {
        if (wallet) return;
        await connectWallet();
      }}
    >
      Connect wallet
    </Button>
  );
};
