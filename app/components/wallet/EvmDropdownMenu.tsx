import { useAccountInstance } from '@orderly.network/hooks';
import { Button, DropdownMenu } from '@radix-ui/themes';
import { useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react';
import { FC } from 'react';

import { supportedEvmChains } from '~/utils';

export const EvmDropdownMenu: FC = () => {
  const account = useAccountInstance();
  const [_, setChain] = useSetChain();
  const [_0, _1, disconnect] = useConnectWallet();
  const connectedWallets = useWallets();

  const chainIcon = supportedEvmChains.find(({ id }) => id == account.chainId)?.icon;

  const selectChain = (chainId: string) => () => {
    setChain({ chainId });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button>
          <img
            src={chainIcon}
            alt="connected chain"
            style={{ marginRight: '0.3rem', height: '1.8rem' }}
          />
          {`${account.address?.substring(0, 6)}...${account.address?.substr(-4)}`}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Mainnet</DropdownMenu.Label>
        {supportedEvmChains
          .filter(({ network }) => network === 'mainnet')
          .map(({ id, icon, label }) => (
            <DropdownMenu.Item
              key={id}
              onSelect={selectChain(id)}
              style={{
                backgroundColor: account.chainId === id ? 'lightgrey' : undefined,
                color: account.chainId === id ? 'black' : undefined,
                fontWeight: account.chainId === id ? '600' : undefined
              }}
            >
              <img src={icon} alt={label} style={{ marginRight: '0.3rem', height: '1.8rem' }} />
              {label}
            </DropdownMenu.Item>
          ))}
        <DropdownMenu.Separator />
        <DropdownMenu.Label>Testnet</DropdownMenu.Label>
        {supportedEvmChains
          .filter(({ network }) => network === 'testnet')
          .map(({ id, icon, label }) => (
            <DropdownMenu.Item
              key={id}
              onSelect={selectChain(id)}
              style={{
                backgroundColor: account.chainId === id ? 'lightgrey' : undefined,
                color: account.chainId === id ? 'black' : undefined,
                fontWeight: account.chainId === id ? '600' : undefined
              }}
            >
              <img src={icon} alt={label} style={{ marginRight: '0.3rem', height: '1.8rem' }} />
              {label}
            </DropdownMenu.Item>
          ))}
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onSelect={() => {
            account.disconnect();
            if (connectedWallets.length > 0) {
              disconnect({
                label: connectedWallets[0].label
              });
            }
            window.localStorage.removeItem('chain-namespace');
          }}
        >
          Disconnect
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
