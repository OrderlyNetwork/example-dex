import { useSymbolsInfo } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { useEffect, useState } from 'react';

import { Chart, CreateOrder, Orderbook, Spinner, SymbolHeader } from '~/components';
import { OrderTabs } from '~/components/OrderTabs';

export default function Index() {
  const [symbol, setSymbol] = useState<API.Symbol>();

  const symbolInfo = useSymbolsInfo();

  useEffect(() => {
    if (symbol) return;
    setSymbol(symbolInfo['PERP_BTC_USDC']());
  }, [symbolInfo, symbol, setSymbol]);

  if (!symbol) {
    return <Spinner />;
  }

  return (
    <div className="max-w-full w-full mt-6 flex flex-wrap flex-items-center gap-4">
      <div className="max-w-[54rem] w-full flex flex-col gap-1">
        <SymbolHeader symbol={symbol} setSymbol={setSymbol} />
        <Chart symbol={symbol} />
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
