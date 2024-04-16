import { useAccount } from '@orderly.network/hooks';
import { AccountStatusEnum } from '@orderly.network/types';
import { CheckCircledIcon, Cross1Icon } from '@radix-ui/react-icons';
import { Button, Dialog, Separator } from '@radix-ui/themes';
import { useConnectWallet, useNotifications, useSetChain } from '@web3-onboard/react';
import { FC, useEffect, useState } from 'react';

import { WalletConnection, PendingButton } from '~/components';
import { useIsTestnet } from '~/hooks';

let timer: number | undefined;

export const OrderlyConnect: FC = () => {
  const [open, setOpen] = useState(false);
  const [{ wallet }] = useConnectWallet();
  const [isTestnet] = useIsTestnet();

  const { account, state } = useAccount();
  const [{ connectedChain }] = useSetChain();

  const [_, customNotification] = useNotifications();

  useEffect(() => {
    if (!connectedChain) return;
    account.switchChainId(connectedChain.id);
  }, [connectedChain, account]);

  useEffect(() => {
    if (timer != null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      if (state.status < AccountStatusEnum.EnableTrading && wallet != null) {
        setOpen(true);
        timer = undefined;
      }
    }, 3_000) as unknown as number;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, setOpen, wallet]);

  const isRegistered = state.status >= AccountStatusEnum.SignedIn;
  const hasOrderlyKey = state.status >= AccountStatusEnum.EnableTrading;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Content
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <Dialog.Title className="flex justify-between flex-items-center">
          <span className="mr-2">Connect with Orderly Network</span>
          <Button
            variant="ghost"
            color="crimson"
            onClick={() => {
              setOpen(false);
            }}
          >
            <Cross1Icon />
          </Button>
        </Dialog.Title>

        <div className="flex flex-col flex-items-center gap-6 pt-6">
          <div className="flex flex-col flex-items-center gap-2">
            <span>You are connected with Orderly {isTestnet ? 'testnet' : 'mainnet'}</span>
            <WalletConnection />
          </div>
          <Separator size="4" />
          <div className="flex flex-col flex-items-center gap-2">
            <span>Register your account first.</span>
            <PendingButton
              disabled={isRegistered}
              onClick={async () => {
                const { update } = customNotification({
                  eventCode: 'register',
                  type: 'pending',
                  message: 'Registering account...'
                });
                try {
                  await account.createAccount();
                  update({
                    eventCode: 'registerSuccess',
                    type: 'success',
                    message: 'Registration complete!',
                    autoDismiss: 5_000
                  });
                } catch (err) {
                  console.error(err);
                  update({
                    eventCode: 'registerError',
                    type: 'error',
                    message: 'Registration failed!',
                    autoDismiss: 5_000
                  });
                  throw err;
                }
              }}
            >
              {isRegistered && <CheckCircledIcon color="green" />} Register
            </PendingButton>
          </div>
          <Separator size="4" />
          <div className="flex flex-col flex-items-center gap-2">
            <span>
              Create a key pair to interact with our API. It will be stored in your browser&apos;s
              local storage and is unique per device.
            </span>
            <PendingButton
              disabled={hasOrderlyKey}
              onClick={async () => {
                const { update } = customNotification({
                  eventCode: 'orderlyKey',
                  type: 'pending',
                  message: 'Registering Orderly key...'
                });
                try {
                  await account.createOrderlyKey(365);
                  update({
                    eventCode: 'orderlyKeySuccess',
                    type: 'success',
                    message: 'Key registration complete!',
                    autoDismiss: 5_000
                  });
                } catch (err) {
                  console.error(err);
                  update({
                    eventCode: 'orderlyKeyError',
                    type: 'error',
                    message: 'Key registration failed!',
                    autoDismiss: 5_000
                  });
                  throw err;
                }
              }}
            >
              {hasOrderlyKey && <CheckCircledIcon color="green" />} Create Key
            </PendingButton>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
