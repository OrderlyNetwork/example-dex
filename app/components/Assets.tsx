import { useChains, useCollateral, useDeposit, useWithdraw } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { Table } from '@radix-ui/themes';
import { useSetChain } from '@web3-onboard/react';
import { FixedNumber } from 'ethers';
import { FunctionComponent, useMemo } from 'react';

import { OrderlyDeposit } from '~/components';
import { useIsTestnet } from '~/hooks';
import { supportedChains, usdFormatter } from '~/utils';

export const Assets: FunctionComponent = () => {
  const [isTestnet] = useIsTestnet();
  const collateral = useCollateral();
  const [chains] = useChains(isTestnet ? 'testnet' : 'mainnet', {
    filter: (item: API.Chain) => supportedChains.includes(item.network_infos?.chain_id)
  });

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
            <Table.Cell>{usdFormatter.format(Number(deposit.balance))}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Orderly Balance:</Table.RowHeaderCell>
            <Table.Cell>{usdFormatter.format(collateral.availableBalance)}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Unsettled PnL:</Table.RowHeaderCell>
            <Table.Cell>{usdFormatter.format(unsettledPnL)}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <OrderlyDeposit
        walletBalance={FixedNumber.fromString(deposit.balance, { decimals: 6 })}
        orderlyBalance={FixedNumber.fromString(availableWithdraw.toPrecision(6), {
          decimals: 6
        })}
        withdraw={withdraw}
      />
    </div>
  );
};
