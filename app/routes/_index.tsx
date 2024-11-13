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

const useAdvancedCharts = import.meta.env.VITE_USE_ADVANCED_CHARTS === 'true';

export default function Index() {
  const [symbol, setSymbol] = useState<string>();

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
      <div className="flex flex-1 w-full flex-wrap items-stretch flex-justify-around gap-4">
        <Orderbook symbol={symbol} />
        <CreateOrder symbol={symbol} />
      </div>
      <div className="flex flex-1 min-w-full">
        <OrderTabs symbol={symbol} />
      </div>
    </div>
  );
}
