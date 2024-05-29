import { useAccount } from '@orderly.network/hooks';
import { Button, DropdownMenu } from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { FC, useEffect } from 'react';

import { ConnectWalletButton } from './ConnectWalletButton';

import { supportedChains } from '~/utils';

export const WalletConnection: FC = () => {
  const { account } = useAccount();
  const [{ wallet }, _, disconnectWallet] = useConnectWallet();
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

  const chainIcon = supportedChains.find(({ id }) => id === connectedChain?.id)?.icon;

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
        {supportedChains
          .filter(({ network }) => network === 'mainnet')
          .map(({ id, icon, label }) => (
            <DropdownMenu.Item
              key={id}
              onSelect={selectChain(id)}
              style={{
                backgroundColor: connectedChain?.id === id ? 'lightgrey' : undefined,
                color: connectedChain?.id === id ? 'black' : undefined,
                fontWeight: connectedChain?.id === id ? '600' : undefined
              }}
            >
              <img src={icon} alt={label} style={{ marginRight: '0.3rem', height: '1.8rem' }} />
              {label}
            </DropdownMenu.Item>
          ))}
        <DropdownMenu.Separator />
        <DropdownMenu.Label>Testnet</DropdownMenu.Label>
        {supportedChains
          .filter(({ network }) => network === 'testnet')
          .map(({ id, icon, label }) => (
            <DropdownMenu.Item
              key={id}
              onSelect={selectChain(id)}
              style={{
                backgroundColor: connectedChain?.id === id ? 'lightgrey' : undefined,
                color: connectedChain?.id === id ? 'black' : undefined,
                fontWeight: connectedChain?.id === id ? '600' : undefined
              }}
            >
              <img src={icon} alt={label} style={{ marginRight: '0.3rem', height: '1.8rem' }} />
              {label}
            </DropdownMenu.Item>
          ))}
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
    <ConnectWalletButton />
  );
};
