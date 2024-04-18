import {
  useAccountInstance,
  useChains,
  useCollateral,
  useDeposit,
  useWithdraw
} from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { Table, Tooltip } from '@radix-ui/themes';
import { useNotifications, useSetChain } from '@web3-onboard/react';
import { FixedNumber } from 'ethers';
import { FC, useMemo } from 'react';

import { OrderlyDeposit, PendingButton } from '~/components';
import { useIsTestnet } from '~/hooks';
import { supportedChains, usdFormatter } from '~/utils';

export const Assets: FC = () => {
  const [isTestnet] = useIsTestnet();
  const collateral = useCollateral();
  const [chains] = useChains(isTestnet ? 'testnet' : 'mainnet', {
    filter: (item: API.Chain) => supportedChains.includes(item.network_infos?.chain_id)
  });
  const account = useAccountInstance();
  const [_, customNotification] = useNotifications();

  const token = useMemo(() => {
    return Array.isArray(chains) ? chains[0].token_infos[0] : undefined;
  }, [chains]);
  const [{ connectedChain }] = useSetChain();
  const deposit = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
    srcToken: token?.symbol,
    srcChainId: Number(connectedChain?.id)
  });
  const { withdraw, unsettledPnL, availableWithdraw } = useWithdraw();

  return (
    <div className="flex flex-col gap-8">
      <Table.Root>
        <Table.Body>
          <Table.Row>
            <Table.RowHeaderCell>Wallet Balance:</Table.RowHeaderCell>
            <Table.Cell className="text-right">
              {usdFormatter.format(Number(deposit.balance))} $
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Orderly Balance:</Table.RowHeaderCell>
            <Table.Cell className="text-right">
              {usdFormatter.format(collateral.availableBalance)} $
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Unsettled PnL:</Table.RowHeaderCell>
            <Table.Cell className="text-right">{usdFormatter.format(unsettledPnL)} $</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Row>
          <Table.RowHeaderCell className="flex">
            <Tooltip content="The maximum withdrawable amount. 'freeCollateral - unsettledPnL'">
              <div className="content">
                Withdrawable Balance <QuestionMarkCircledIcon />
              </div>
            </Tooltip>
            :
          </Table.RowHeaderCell>
          <Table.Cell className="text-right">{usdFormatter.format(availableWithdraw)} $</Table.Cell>
        </Table.Row>
      </Table.Root>
      <OrderlyDeposit
        walletBalance={FixedNumber.fromString(deposit.balance, { decimals: 6 })}
        orderlyBalance={FixedNumber.fromString(availableWithdraw.toPrecision(6), {
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
