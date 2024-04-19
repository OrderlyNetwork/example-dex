import { LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';

import {
  AdvancedChart,
  CreateOrder,
  LightweightChart,
  Orderbook,
  Spinner,
  SymbolHeader
} from '~/components';
import { OrderTabs } from '~/components/OrderTabs';

export const loader = async ({ context }: LoaderFunctionArgs) => {
  return json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useAdvancedCharts: (context.cloudflare as any).env.USE_ADVANCED_CHARTS === 'true' ? true : false
  });
};

export default function Index() {
  const [symbol, setSymbol] = useState<string>();
  const { useAdvancedCharts } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (symbol) return;
    setSymbol('PERP_BTC_USDC');
  }, [symbol, setSymbol]);

  if (!symbol) {
    return <Spinner />;
  }

  return (
    <div className="max-w-full w-full mt-6 flex flex-wrap flex-items-center gap-4">
      <div className="max-w-[54rem] w-full flex flex-col gap-1">
        <SymbolHeader symbol={symbol} setSymbol={setSymbol} />
        {useAdvancedCharts ? (
          <AdvancedChart symbol={symbol} />
        ) : (
          <LightweightChart symbol={symbol} />
        )}
      </div>
      <div className="flex flex-1 w-full flex-wrap flex-items-center flex-justify-around gap-4">
        <Orderbook symbol={symbol} />
        <CreateOrder symbol={symbol} />
      </div>
      <div className="flex flex-1 min-w-full">
        <OrderTabs symbol={symbol} />
      </div>
    </div>
  );
}
