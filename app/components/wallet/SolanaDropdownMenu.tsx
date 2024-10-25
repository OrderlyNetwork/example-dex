import { useAccountInstance } from '@orderly.network/hooks';
import { Button, DropdownMenu } from '@radix-ui/themes';
import { useWallet } from '@solana/wallet-adapter-react';
import { FC } from 'react';

import { useSolanaNetwork } from '~/providers/SolanaProvider';
import { supportedSolanaChains } from '~/utils';

export const SolanaDropdownMenu: FC = () => {
  const account = useAccountInstance();
  const { setSolanaNetwork } = useSolanaNetwork();
  const { disconnect } = useWallet();

  const chainIcon = supportedSolanaChains.find(({ id }) => id == account.chainId)?.icon;

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
        {supportedSolanaChains.map(({ id, icon, label, network }) => (
          <DropdownMenu.Item
            key={id}
            onSelect={() => setSolanaNetwork(network)}
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
            disconnect();
            window.localStorage.removeItem('chain-namespace');
          }}
        >
          Disconnect
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
