import { useAccount, useOrderStream } from '@orderly.network/hooks';
import { API, AccountStatusEnum, OrderStatus } from '@orderly.network/types';
import { Table } from '@radix-ui/themes';
import { FC } from 'react';

import { Spinner, PendingOrder } from '.';

export const PendingOrders: FC<{ symbol: string; showAll?: boolean }> = ({
  symbol,
  showAll = true
}) => {
  const [ordersUntyped, { cancelOrder, cancelAlgoOrder, isLoading }] = useOrderStream({
    symbol: showAll ? undefined : symbol,
    status: OrderStatus.INCOMPLETE
  });
  const orders = ordersUntyped as (API.Order | API.AlgoOrder)[];
  const { state } = useAccount();

  if (state.status <= AccountStatusEnum.NotSignedIn) {
    return;
  }

  if (!orders || isLoading) {
    return <Spinner size="2rem" className="m-3" />;
  }

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Symbol</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Side</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Quantity</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Trigger Price</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {orders.map((o) => {
          let order:
            | { isAlgoOrder: false; order: API.Order }
            | { isAlgoOrder: true; order: API.AlgoOrder };
          if ((o as API.Order).algo_order_id) {
            order = { isAlgoOrder: true, order: o as API.AlgoOrder };
          } else {
            order = { isAlgoOrder: false, order: o as API.Order };
          }
          return (
            <PendingOrder
              key={order.isAlgoOrder ? order.order.algo_order_id : order.order.order_id}
              order={order}
              cancelOrder={cancelOrder}
              cancelAlgoOrder={cancelAlgoOrder}
            />
          );
        })}
      </Table.Body>
    </Table.Root>
  );
};
