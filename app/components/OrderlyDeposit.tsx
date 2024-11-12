import { useAccount, useChains, useDeposit, useWithdraw } from '@orderly.network/hooks';
import { ChainNamespace } from '@orderly.network/types';
import { Cross1Icon } from '@radix-ui/react-icons';
import { Button, Dialog, Tabs } from '@radix-ui/themes';
import { useNotifications } from '@web3-onboard/react';
import { FixedNumber } from 'ethers';
import { FC, useEffect, useMemo, useState } from 'react';
import { match } from 'ts-pattern';

import { PendingButton, TokenInput } from '~/components';
import { useIsTestnet } from '~/hooks';

export const OrderlyDeposit: FC<{
  walletBalance: FixedNumber;
  orderlyBalance: FixedNumber;
  availableWithdraw: FixedNumber;
  withdraw: ReturnType<typeof useWithdraw>['withdraw'];
}> = ({ walletBalance, orderlyBalance, availableWithdraw, withdraw }) => {
  const [amount, setAmount] = useState<FixedNumber>();
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [mintedTestUSDC, setMintedTestUSDC] = useState(false);
  const [newWalletBalance, setNewWalletBalance] = useState<FixedNumber>();
  const [newOrderlyBalance, setNewOrderlyBalance] = useState<FixedNumber>();

  const [_, customNotification] = useNotifications();

  const [isTestnet] = useIsTestnet();
  const { account, state } = useAccount();
  const [chains] = useChains(isTestnet ? 'testnet' : 'mainnet');
  const token = useMemo(
    () => chains.find((item) => item.network_infos.chain_id === account.chainId)?.token_infos[0],
    [chains, account.chainId]
  );
  const { deposit, approve, allowance, setQuantity } = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
    srcToken: token?.symbol,
    srcChainId: Number(account.chainId)
  });

  useEffect(() => {
    if (amount == null) return;
    setQuantity(amount.toString());
  }, [amount, setQuantity]);
  useEffect(() => {
    if (!newOrderlyBalance || !newWalletBalance) {
      setDisabled(true);
    } else if (newOrderlyBalance.toUnsafeFloat() < 0 || newWalletBalance.toUnsafeFloat() < 0) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [newOrderlyBalance, newWalletBalance]);
  useEffect(() => {
    if (!open) {
      setAmount(undefined);
      setNewWalletBalance(undefined);
      setNewOrderlyBalance(undefined);
    }
  }, [open]);

  const renderContent = (isDeposit: boolean) => {
    return (
      <div className="flex flex-col gap-6 mt-6">
        <div className="flex flex-col gap-1">
          <span>Wallet balance (USDC):</span>
          <div className="flex flex-items-center">
            <span className="flex-1">{walletBalance.toString()}</span>
            {newWalletBalance != null && (
              <>
                <span>⇒</span>
                <span
                  className={`flex-1 text-end ${newWalletBalance.toUnsafeFloat() < walletBalance.toUnsafeFloat() ? 'color-red' : 'color-green'}`}
                >
                  {newWalletBalance.toString()}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span>Orderly balance (USDC):</span>
          <div className="flex flex-items-center">
            <span className="flex-1">{orderlyBalance.toString()}</span>
            {newOrderlyBalance != null && (
              <>
                <span>⇒</span>
                <span
                  className={`flex-1 text-end ${newOrderlyBalance.toUnsafeFloat() < orderlyBalance.toUnsafeFloat() ? 'color-red' : 'color-green'}`}
                >
                  {newOrderlyBalance.toString()}
                </span>
              </>
            )}
          </div>
        </div>

        <TokenInput
          decimals={6}
          onValueChange={(inputBalance) => {
            if (inputBalance.value === 0n) {
              setAmount(undefined);
              setNewWalletBalance(undefined);
              setNewOrderlyBalance(undefined);
              return;
            }
            setAmount(inputBalance);
            if (isDeposit) {
              setNewWalletBalance(walletBalance.sub(inputBalance));
              setNewOrderlyBalance(orderlyBalance.add(inputBalance));
            } else {
              setNewWalletBalance(walletBalance.add(inputBalance));
              setNewOrderlyBalance(orderlyBalance.sub(inputBalance));
            }
          }}
        />

        <PendingButton
          disabled={disabled}
          onClick={async () => {
            if (amount == null) return;

            if (isDeposit) {
              if (Number(allowance) < amount.toUnsafeFloat()) {
                const { update } = customNotification({
                  eventCode: 'approval',
                  type: 'pending',
                  message: 'Approving USDC for deposit...'
                });
                try {
                  await approve(amount.toString());
                  update({
                    eventCode: 'approvalSuccess',
                    type: 'success',
                    message: 'Approval complete! You can now do a deposit',
                    autoDismiss: 8_000
                  });
                } catch (err) {
                  console.error(err);
                  update({
                    eventCode: 'approvalError',
                    type: 'error',
                    message: 'Approval failed!',
                    autoDismiss: 5_000
                  });
                  throw err;
                }
              } else {
                const { update } = customNotification({
                  eventCode: 'deposit',
                  type: 'pending',
                  message: 'Depositing USDC into your Orderly Account...'
                });
                try {
                  await deposit();
                  update({
                    eventCode: 'depositSuccess',
                    type: 'success',
                    message: 'Deposit complete!',
                    autoDismiss: 5_000
                  });
                  setAmount(undefined);
                  setNewWalletBalance(undefined);
                  setNewOrderlyBalance(undefined);
                } catch (err) {
                  console.error(err);
                  update({
                    eventCode: 'depositError',
                    type: 'error',
                    message: 'Deposit failed!',
                    autoDismiss: 5_000
                  });
                  throw err;
                }
              }
            } else {
              if (availableWithdraw.lt(orderlyBalance)) {
                const { update } = customNotification({
                  eventCode: 'settle',
                  type: 'pending',
                  message: 'Settling PnL...'
                });
                try {
                  await account.settle();
                  update({
                    eventCode: 'settleSuccess',
                    type: 'success',
                    message: 'Successfully settled PnL!',
                    autoDismiss: 5_000
                  });
                } catch (err) {
                  console.error(err);
                  update({
                    eventCode: 'settleError',
                    type: 'error',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    message: (err as any).message ?? 'Something went wrong',
                    autoDismiss: 15_000
                  });
                }
              }

              const { update } = customNotification({
                eventCode: 'withdraw',
                type: 'pending',
                message: 'Withdrawing USDC from your Orderly Account...'
              });
              try {
                await withdraw({
                  chainId: Number(account.chainId),
                  amount: amount.toString(),
                  token: 'USDC',
                  allowCrossChainWithdraw: false
                });
                update({
                  eventCode: 'withdrawSuccess',
                  type: 'success',
                  message: 'Withdraw complete!',
                  autoDismiss: 5_000
                });
                setAmount(undefined);
                setNewWalletBalance(undefined);
                setNewOrderlyBalance(undefined);
              } catch (err) {
                console.error(err);
                update({
                  eventCode: 'withdrawError',
                  type: 'error',
                  message: 'Withdraw failed!',
                  autoDismiss: 5_000
                });
                throw err;
              }
            }
          }}
        >
          {isDeposit
            ? amount != null && Number(allowance) < amount.toUnsafeFloat()
              ? 'Approve'
              : 'Deposit'
            : 'Withdraw'}
        </PendingButton>

        {isTestnet && state.chainNamespace != null && (
          <PendingButton
            disabled={mintedTestUSDC}
            onClick={async () => {
              if (state.chainNamespace == null) return;
              const { update } = customNotification({
                eventCode: 'mint',
                type: 'pending',
                message: 'Minting USDC on testnet...'
              });
              try {
                const chainNamespace = state.chainNamespace;
                const res = await fetch(
                  match(chainNamespace)
                    .with(
                      ChainNamespace.evm,
                      () => 'https://testnet-operator-evm.orderly.org/v1/faucet/usdc'
                    )
                    .with(
                      ChainNamespace.solana,
                      () => 'https://testnet-operator-sol.orderly.org/v1/faucet/usdc'
                    )
                    .exhaustive(),
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: match(chainNamespace)
                      .with(ChainNamespace.evm, () =>
                        JSON.stringify({
                          broker_id: import.meta.env.VITE_BROKER_ID,
                          chain_id: String(Number(account.chainId)),
                          user_address: account.address
                        })
                      )
                      .with(ChainNamespace.solana, () =>
                        JSON.stringify({
                          broker_id: import.meta.env.VITE_BROKER_ID,
                          user_address: account.address
                        })
                      )
                      .exhaustive()
                  }
                );
                if (!res.ok) {
                  throw new Error(res.status === 429 ? 'Too many requests' : res.statusText);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { success, message } = (await res.json()) as any;
                if (!success) {
                  throw new Error(message);
                }
                update({
                  eventCode: 'mintSuccess',
                  type: 'success',
                  message:
                    'Mint success! It might take a while to be received in your Orderly account',
                  autoDismiss: 8_000
                });
                setMintedTestUSDC(true);
              } catch (err) {
                console.error(err);
                if (update) {
                  let message: string;
                  if (err instanceof Error) {
                    message = err.message;
                  } else {
                    message = 'Mint failed!';
                  }
                  update({
                    eventCode: 'mintError',
                    type: 'error',
                    message,
                    autoDismiss: 5_000
                  });
                }
                throw err;
              }
            }}
          >
            Request USDC via faucet
          </PendingButton>
        )}
      </div>
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button>Deposit / Withdraw</Button>
      </Dialog.Trigger>
      <Dialog.Content
        className="max-w-xs"
        size="2"
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <Dialog.Title className="flex justify-between flex-items-center">
          <span className="mr-2">Deposit / Withdraw</span>
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

        <Tabs.Root
          defaultValue="deposit"
          onValueChange={() => {
            setNewOrderlyBalance(undefined);
            setNewWalletBalance(undefined);
          }}
        >
          <Tabs.List>
            <Tabs.Trigger value="deposit">Deposit</Tabs.Trigger>
            <Tabs.Trigger value="withdraw">Withdraw</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="deposit">{renderContent(true)}</Tabs.Content>

          <Tabs.Content value="withdraw">{renderContent(false)}</Tabs.Content>
        </Tabs.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
};
