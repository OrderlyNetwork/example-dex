import { Button, Dialog } from '@radix-ui/themes';
import { useWalletMultiButton } from '@solana/wallet-adapter-base-ui';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useConnectWallet } from '@web3-onboard/react';
import { FC, useEffect, useState } from 'react';

export const ConnectWalletButton: FC = () => {
  const [open, setOpen] = useState(false);

  const [{ wallet: evmWallet }, connectWallet] = useConnectWallet();
  const { setVisible: setSolanaModalVisible } = useWalletModal();
  const { buttonState, onConnect } = useWalletMultiButton({
    onSelectWallet() {
      setSolanaModalVisible(true);
    }
  });

  useEffect(() => {
    if (buttonState === 'has-wallet' && onConnect) {
      onConnect();
    }
  }, [buttonState, onConnect]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button>Connect wallet</Button>
      </Dialog.Trigger>
      <Dialog.Content size="1" maxWidth="400px">
        <Dialog.Title>Connect Wallet</Dialog.Title>
        <div className="flex flex-col gap-4 mt-8">
          <Button
            size="4"
            onClick={async () => {
              if (evmWallet) return;
              await connectWallet();
            }}
          >
            <img
              src="/assets/ethereum.svg"
              alt="EVM Wallets"
              style={{ marginRight: '0.3rem', height: '1.8rem' }}
            />{' '}
            EVM Wallets
          </Button>
          <Button
            size="4"
            onClick={async () => {
              setOpen(false);
              switch (buttonState) {
                case 'no-wallet':
                  setSolanaModalVisible(true);
                  break;
                case 'has-wallet':
                  if (onConnect) {
                    onConnect();
                  }
                  break;
              }
            }}
          >
            <img
              src="/assets/solana.svg"
              alt="Solana Wallets"
              style={{ marginRight: '0.3rem', height: '1.8rem' }}
            />{' '}
            Solana Wallets
          </Button>
        </div>
        <hr className="my-4"></hr>
        <div className="w-full flex justify-end">
          <Button
            className="self-end"
            onClick={() => {
              setOpen(false);
            }}
            variant="outline"
          >
            Close
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
