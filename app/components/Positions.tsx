import { usePositionStream } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { Table } from '@radix-ui/themes';
import { FunctionComponent } from 'react';

import { Spinner } from '.';

export const Positions: FunctionComponent<{ symbol: API.Symbol }> = ({ symbol }) => {
  const [positions] = usePositionStream();

  if (!positions.rows) {
    return <Spinner />;
  }

  const [_, base] = symbol.symbol.split('_');
  const baseFormatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 20 });
  const usdFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Symbol</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Quantity ({base})</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Avg. Open</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Mark Price</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Unreal. PnL</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Notional</Table.ColumnHeaderCell>
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
            <Table.Cell>{usdFormatter.format(position.notional)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};
