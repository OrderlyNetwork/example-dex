import { useOrderStream } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { Button, Dialog, Table } from '@radix-ui/themes';
import { useNotifications } from '@web3-onboard/react';
import { FC, useState } from 'react';

import { Spinner } from '.';

import { baseFormatter, usdFormatter } from '~/utils';

export const PendingOrder: FC<{
  order: { isAlgoOrder: false; order: API.Order } | { isAlgoOrder: true; order: API.AlgoOrder };
  cancelOrder: ReturnType<typeof useOrderStream>[1]['cancelOrder'];
  cancelAlgoOrder: ReturnType<typeof useOrderStream>[1]['cancelAlgoOrder'];
}> = ({ order, cancelOrder, cancelAlgoOrder }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [_0, customNotification] = useNotifications();

  const [_, base, quote] = order.order.symbol.split('_');
  return (
    <Table.Row
      key={order.isAlgoOrder ? order.order.algo_order_id : order.order.order_id}
      className="[&>*]:align-mid"
    >
      <Table.Cell>
        {base} / {quote}
      </Table.Cell>
      <Table.Cell>
        {order.isAlgoOrder ? order.order.algo_type : ''} {order.order.type}
      </Table.Cell>
      <Table.Cell>{order.order.side}</Table.Cell>
      <Table.Cell>{baseFormatter.format(order.order.quantity)}</Table.Cell>
      <Table.Cell>{order.order.price ? usdFormatter.format(order.order.price) : '-'}</Table.Cell>
      <Table.Cell>
        {order.order.trigger_price ? usdFormatter.format(order.order.trigger_price) : '-'}
      </Table.Cell>
      <Table.Cell>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger>
            <Button className="relative" disabled={loading}>
              {loading && <Spinner overlay={true} />} Cancel
            </Button>
          </Dialog.Trigger>
          <Dialog.Content className="max-w-md" size="1">
            <Dialog.Title className="flex justify-between flex-items-center">
              <span className="mr-2">Cancel Order</span>
            </Dialog.Title>

            <div className="w-full pt-4 flex flex-col gap-2">
              <span>Are you really sure, that you want to cancel this order?</span>
              <div className="flex gap-4 justify-end">
                <Button
                  className="relative bg-[var(--color-bg-red)]"
                  disabled={loading}
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  {loading && <Spinner overlay={true} />} No
                </Button>
                <Button
                  className="relative bg-[var(--color-bg-green)]"
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    const { update } = customNotification({
                      eventCode: 'cancelOrder',
                      type: 'pending',
                      message: 'Cancelling order...'
                    });
                    try {
                      if (order.isAlgoOrder) {
                        await cancelAlgoOrder(order.order.algo_order_id, order.order.symbol);
                      } else {
                        await cancelOrder(order.order.order_id, order.order.symbol);
                      }
                      update({
                        eventCode: 'cancelOrderSuccess',
                        type: 'success',
                        message: 'Successfully cancelled order!',
                        autoDismiss: 5_000
                      });
                    } catch (err) {
                      console.error(err);
                      update({
                        eventCode: 'cancelOrderError',
                        type: 'error',
                        message: 'Cancelling order failed!',
                        autoDismiss: 5_000
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading && <Spinner overlay={true} />} Yes
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </Table.Cell>
    </Table.Row>
  );
};
