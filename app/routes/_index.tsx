import { useQuery } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { useEffect, useState } from 'react';

import { Chart, CreateOrder, Orderbook, Spinner, SymbolHeader } from '~/components';

export default function Index() {
  const [symbol, setSymbol] = useState<API.Symbol>();

  const { data } = useQuery<API.Symbol[]>('/v1/public/info');

  useEffect(() => {
    if (!data || symbol) return;
    setSymbol(data.find((cur) => cur.symbol === 'PERP_BTC_USDC')!);
  }, [data, symbol, setSymbol]);

  if (!symbol) {
    return <Spinner />;
  }

  return (
    <div className="max-w-full w-full mt-6 flex flex-col flex-items-center gap-4">
      <div className="max-w-full w-full flex flex-col gap-1">
        <SymbolHeader symbol={symbol} setSymbol={setSymbol} />
        <Chart symbol={symbol} />
      </div>
      <Orderbook symbol={symbol} />
      <CreateOrder symbol={symbol} />
    </div>
  );
}
