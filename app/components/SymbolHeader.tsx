import { useTickerStream } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { FunctionComponent } from 'react';

import { Spinner, SymbolSelection } from '.';

export const SymbolHeader: FunctionComponent<{
  symbol: API.Symbol;
  setSymbol: React.Dispatch<React.SetStateAction<API.Symbol | undefined>>;
}> = ({ symbol, setSymbol }) => {
  const stream = useTickerStream(symbol.symbol);

  let content;
  if (!stream) {
    content = <Spinner />;
  } else {
    let dailyChange: string | undefined;
    let dailyChangePercentage: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((stream as any)['24h_change'] != null && stream.index_price != null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dailyChange = String((stream as any)['24h_change'].toNumber());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dailyChangePercentage = (stream as any)['24h_change']
        .div(stream.index_price)
        .mul(100)
        .toPrecision(4, 2);
    }

    content = (
      <>
        <SymbolSelection symbol={symbol} setSymbol={setSymbol} />
        <div className="flex flex-col font-size-[0.9rem]">
          <div className="font-size-[0.8rem] color-gray">Mark</div>
          <div>{stream.mark_price}</div>
        </div>
        <div className="flex flex-col font-size-[0.9rem]">
          <div className="font-size-[0.8rem] color-gray">Index</div>
          <div>{stream.index_price}</div>
        </div>
        <div className="flex flex-col font-size-[0.9rem]">
          <div className="font-size-[0.8rem] color-gray">24h volume</div>
          <div>{stream['24h_amount']}</div>
        </div>
        <div className="flex flex-col font-size-[0.9rem]">
          <div className="font-size-[0.8rem] color-gray">24h change</div>
          <div>
            {dailyChange && dailyChangePercentage ? (
              <>
                {dailyChange} / {dailyChangePercentage}%
              </>
            ) : (
              '-'
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-[2.7rem] flex flex-items-center [&>*]:border-0 [&>*:not(:last-child)]:border-r-2 [&>*]:border-solid [&>*]:px-3 [&>*]:border-gray font-bold [&>*:not(:first-child)]:flex-1">
      {content}
    </div>
  );
};
