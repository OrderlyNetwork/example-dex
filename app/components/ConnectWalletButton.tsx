import { Button } from '@radix-ui/themes';
import { useConnectWallet } from '@web3-onboard/react';
import { FC } from 'react';

export const ConnectWalletButton: FC = () => {
  const [{ wallet }, connectWallet, _] = useConnectWallet();

  return (
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
