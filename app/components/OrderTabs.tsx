import { API } from '@orderly.network/types';
import { Tabs } from '@radix-ui/themes';
import { FC } from 'react';

import { PendingOrders, Positions } from '.';

export const OrderTabs: FC<{ symbol: API.Symbol }> = ({ symbol }) => {
  return (
    <Tabs.Root defaultValue="positions" className="flex-1">
      <Tabs.List>
        <Tabs.Trigger value="positions">Positions</Tabs.Trigger>
        <Tabs.Trigger value="pending">Pending</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="positions">
        <Positions symbol={symbol} />
      </Tabs.Content>
      <Tabs.Content value="pending">
        <PendingOrders symbol={symbol} />
      </Tabs.Content>
    </Tabs.Root>
  );
};
