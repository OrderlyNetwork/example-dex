import { useAccount, usePositionStream } from '@orderly.network/hooks';
import { AccountStatusEnum } from '@orderly.network/types';
import { Badge, Table } from '@radix-ui/themes';
import { FC } from 'react';

import { Spinner, UpdatePosition } from '.';

import { baseFormatter, usdFormatter } from '~/utils';

export const Positions: FC<{ symbol: string; showAll?: boolean }> = ({
  symbol,
  showAll = true
}) => {
  const [positions, _info, { isLoading }] = usePositionStream(showAll ? undefined : symbol);
  const { state } = useAccount();

  if (state.status <= AccountStatusEnum.NotSignedIn) {
    return;
  }

  if (!positions.rows || isLoading) {
    return <Spinner size="2rem" className="m-3" />;
  }

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row className="[&>*]:align-mid">
          <Table.ColumnHeaderCell>Symbol</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Direction</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Quantity</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Avg. Open</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Mark Price</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Unreal. PnL</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Est. Liq Price</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {positions.rows.map((position) => {
          const [_, base, quote] = position.symbol.split('_');
          return (
            <Table.Row key={position.symbol} className="[&>*]:align-mid">
              <Table.Cell>
                {base} / {quote}
              </Table.Cell>
              <Table.Cell>
                {position.position_qty > 0 ? (
                  <Badge color="green">Long</Badge>
                ) : (
                  <Badge color="red">Short</Badge>
                )}
              </Table.Cell>
              <Table.Cell>{baseFormatter.format(Math.abs(position.position_qty))}</Table.Cell>
              <Table.Cell>{usdFormatter.format(position.average_open_price)}</Table.Cell>
              <Table.Cell>{usdFormatter.format(position.mark_price)}</Table.Cell>
              <Table.Cell>
                {usdFormatter.format(position.unrealized_pnl)} (
                {usdFormatter.format(position.unrealized_pnl_ROI * 100)}%)
              </Table.Cell>
              <Table.Cell>
                {position.est_liq_price ? usdFormatter.format(position.est_liq_price) : '-'}
              </Table.Cell>
              <Table.Cell>
                <UpdatePosition position={position} />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
};
