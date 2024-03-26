import { useAccount, usePositionStream } from '@orderly.network/hooks';
import { API, AccountStatusEnum } from '@orderly.network/types';
import { Table } from '@radix-ui/themes';
import { FunctionComponent } from 'react';

import { Spinner } from '.';
import { UpdatePosition } from './UpdatePosition';

export const Positions: FunctionComponent<{ symbol: API.Symbol }> = ({ symbol }) => {
  const [positions, _info, { refresh }] = usePositionStream(symbol.symbol);
  const { state } = useAccount();

  if (state.status <= AccountStatusEnum.NotSignedIn) {
    return;
  }

  if (!positions.rows) {
    return <Spinner size="2rem" className="m-3" />;
  }

  const baseFormatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 20 });
  const usdFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Symbol</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Quantity</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Avg. Open</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Mark Price</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Unreal. PnL</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Est. Liq Price</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {positions.rows.map((position) => (
          <Table.Row key={position.symbol}>
            <Table.Cell>{position.symbol}</Table.Cell>
            <Table.Cell>{baseFormatter.format(position.position_qty)}</Table.Cell>
            <Table.Cell>{usdFormatter.format(position.average_open_price)}</Table.Cell>
            <Table.Cell>{usdFormatter.format(position.mark_price)}</Table.Cell>
            <Table.Cell>{usdFormatter.format(position.unrealized_pnl)}</Table.Cell>
            <Table.Cell>
              {position.est_liq_price ? usdFormatter.format(position.est_liq_price) : '-'}
            </Table.Cell>
            <Table.Cell>
              <UpdatePosition symbol={symbol} position={position} refresh={refresh} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};
