import { useAccount, useChains, useDeposit, useWithdraw } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { Cross1Icon } from '@radix-ui/react-icons';
import { Button, Dialog, Tabs } from '@radix-ui/themes';
import { useNotifications, useSetChain } from '@web3-onboard/react';
import { FixedNumber } from 'ethers';
import { FC, useEffect, useMemo, useState } from 'react';

import { PendingButton, TokenInput } from '~/components';
import { useIsTestnet } from '~/hooks';
import { supportedChains } from '~/utils';

export const OrderlyDeposit: FC<{
  walletBalance: FixedNumber;
  orderlyBalance: FixedNumber;
  withdraw: ReturnType<typeof useWithdraw>['withdraw'];
}> = ({ walletBalance, orderlyBalance, withdraw }) => {
  const [amount, setAmount] = useState<FixedNumber>();
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [mintedTestUSDC, setMintedTestUSDC] = useState(false);
  const [newWalletBalance, setNewWalletBalance] = useState<FixedNumber>();
  const [newOrderlyBalance, setNewOrderlyBalance] = useState<FixedNumber>();

  const [_, customNotification] = useNotifications();

  const [isTestnet] = useIsTestnet();
  const { account } = useAccount();
  const [chains] = useChains(isTestnet ? 'testnet' : 'mainnet', {
    filter: (item: API.Chain) => supportedChains.includes(item.network_infos?.chain_id)
  });
  const [{ connectedChain }] = useSetChain();
  const token = useMemo(() => {
    return Array.isArray(chains)
      ? chains
          .find((chain) => chain.network_infos.chain_id === Number(connectedChain?.id))
          ?.token_infos.find((t) => t.symbol === 'USDC')
      : undefined;
  }, [chains, connectedChain]);
  const deposit = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
    srcToken: token?.symbol,
    srcChainId: Number(connectedChain?.id)
  });

  useEffect(() => {
    if (amount == null) return;
    deposit.setQuantity(amount.toString());
  }, [amount, deposit]);
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
              if (Number(deposit.allowance) < amount.toUnsafeFloat()) {
                const { update } = customNotification({
                  eventCode: 'approval',
                  type: 'pending',
                  message: 'Approving USDC for deposit...'
                });
                try {
                  await deposit.approve(amount.toString());
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
                  await deposit.deposit();
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
            ? amount != null && Number(deposit.allowance) < amount.toUnsafeFloat()
              ? 'Approve'
              : 'Deposit'
            : 'Withdraw'}
        </PendingButton>

        {isTestnet && (
          <PendingButton
            disabled={mintedTestUSDC}
            onClick={async () => {
              const { update } = customNotification({
                eventCode: 'mint',
                type: 'pending',
                message: 'Minting 1k USDC on testnet...'
              });
              try {
                await fetch('https://testnet-operator-evm.orderly.org/v1/faucet/usdc', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    broker_id: 'orderly',
                    chain_id: connectedChain?.id,
                    user_address: account.address
                  })
                });
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
                  update({
                    eventCode: 'mintError',
                    type: 'error',
                    message: 'Mint failed!',
                    autoDismiss: 5_000
                  });
                }
                throw err;
              }
            }}
          >
            Mint 1k USDC via faucet
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
