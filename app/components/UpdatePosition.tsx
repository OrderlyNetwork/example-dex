import { API } from '@orderly.network/types';
import { Cross1Icon } from '@radix-ui/react-icons';
import { Button, Dialog, Separator, Tabs } from '@radix-ui/themes';
import { FC, useState } from 'react';

import { ClosePosition, StopOrder } from '.';
import { TpSlOrder } from './TpSlOrder';

import { baseFormatter, usdFormatter } from '~/utils';

export const UpdatePosition: FC<{
  symbol: string;
  position: API.PositionExt;
  refresh: import('swr/_internal').KeyedMutator<API.PositionInfo>;
}> = ({ symbol, position, refresh }) => {
  const [open, setOpen] = useState(false);

  const renderPositionValue = (header: string, value: string) => (
    <div className="flex flex-col gap-1">
      <div className="font-bold font-size-[1.1rem]">{header}</div>
      <div>{value}</div>
    </div>
  );
  const [_, base, quote] = position.symbol.split('_');

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button>Update</Button>
      </Dialog.Trigger>
      <Dialog.Content
        className="max-w-md"
        size="2"
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <Dialog.Title className="flex justify-between flex-items-center">
          <span className="mr-2">Update Position</span>
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

        <div className="flex w-full flex-wrap gap-4 pt-4 [&>*]:flex-1 [&>*]-min-w-[10rem]">
          {renderPositionValue('Symbol', `${base} / ${quote}`)}
          {renderPositionValue('Quantity', baseFormatter.format(position.position_qty))}
          {renderPositionValue('Avg. Open', usdFormatter.format(position.average_open_price))}
          {renderPositionValue('Mark Price', usdFormatter.format(position.mark_price))}
          {renderPositionValue('Unreal. PnL', usdFormatter.format(position.unrealized_pnl))}
          {renderPositionValue(
            'Est.Liq Price',
            position.est_liq_price ? usdFormatter.format(position.est_liq_price) : '-'
          )}
        </div>
        <Separator className="min-w-full my-4" />

        <Tabs.Root defaultValue="close" className="flex-1">
          <Tabs.List>
            <Tabs.Trigger value="close">Close Position</Tabs.Trigger>
            <Tabs.Trigger value="stop">Stop Market</Tabs.Trigger>
            <Tabs.Trigger value="tp_sl">TP / SL</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="close" className="mt-3">
            <ClosePosition
              symbol={symbol}
              position={position}
              refresh={refresh}
              setOpen={setOpen}
            />
          </Tabs.Content>
          <Tabs.Content value="stop" className="mt-3">
            <StopOrder symbol={symbol} position={position} refresh={refresh} setOpen={setOpen} />
          </Tabs.Content>
          <Tabs.Content value="tp_sl" className="mt-3">
            <TpSlOrder symbol={symbol} position={position} refresh={refresh} setOpen={setOpen} />
          </Tabs.Content>
        </Tabs.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
};
