import {
  useAccount,
  useChains,
  useCollateral,
  useDeposit,
  useWithdraw
} from '@orderly.network/hooks';
import { AccountStatusEnum } from '@orderly.network/types';
import { Table } from '@radix-ui/themes';
import { useNotifications } from '@web3-onboard/react';
import { FixedNumber } from 'ethers';
import { FC, useMemo } from 'react';

import { OrderlyDeposit, PendingButton } from '~/components';
import { useIsTestnet } from '~/hooks';
import { usdFormatter } from '~/utils';

export const Assets: FC = () => {
  const [isTestnet] = useIsTestnet();
  const collateral = useCollateral();
  const {
    account,
    state: { status }
  } = useAccount();
  const [chains] = useChains(isTestnet ? 'testnet' : 'mainnet');
  const [_, customNotification] = useNotifications();

  const token = useMemo(
    () => chains.find((item) => item.network_infos.chain_id === account.chainId)?.token_infos[0],
    [chains, account.chainId]
  );
  const deposit = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
    srcToken: token?.symbol,
    srcChainId: Number(account.chainId)
  });
  const balance = useMemo(
    () => (status >= AccountStatusEnum.Connected ? deposit.balance : undefined),
    [status, deposit, account.chainId]
  );
  const { withdraw, availableWithdraw } = useWithdraw();

  return (
    <div className="flex flex-col gap-8">
      <Table.Root>
        <Table.Body>
          <Table.Row>
            <Table.RowHeaderCell>Wallet Balance:</Table.RowHeaderCell>
            <Table.Cell className="text-right">
              {usdFormatter.format(Number(balance ?? '0'))} $
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Orderly Balance:</Table.RowHeaderCell>
            <Table.Cell className="text-right">
              {usdFormatter.format(collateral.availableBalance)} $
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <OrderlyDeposit
        walletBalance={FixedNumber.fromString(balance ?? '0', { decimals: 6 })}
        orderlyBalance={FixedNumber.fromString(collateral.availableBalance.toPrecision(6), {
          decimals: 6
        })}
        availableWithdraw={FixedNumber.fromString(availableWithdraw.toPrecision(6), {
          decimals: 6
        })}
        withdraw={withdraw}
      />
      <PendingButton
        onClick={async () => {
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
        }}
      >
        Settle PnL
      </PendingButton>
    </div>
  );
};
